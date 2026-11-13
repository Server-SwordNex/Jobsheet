import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { createRequire } from "module";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* =========================
   LOCAL ENV
   Non-secret settings come from .env (deployed with the function); secrets live in
   Secret Manager. Variables already in the environment always win.
========================= */
// .env.local (never deployed) holds secrets for running locally and wins over .env
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/* =========================
   PROJECT / DATABASE
========================= */

const ROOT = process.env.MYAPP_ROOT;
const TENANT_ID = process.env.MYAPP_TENANT_ID; // data partition key (not an Auth tenant)
const PROJECT_ID = process.env.FB_PROJECT_ID || process.env.GCLOUD_PROJECT;
const DATABASE_ID = String(process.env.JOBSHEET_DB_ID || "").trim();

if (!ROOT || !TENANT_ID) {
  throw new Error("MYAPP_ROOT and MYAPP_TENANT_ID must be set");
}

// This app shares its Firebase project with other SwordNex apps. Never fall back to
// the shared (default) database and mix customers' data into it.
if (!DATABASE_ID || DATABASE_ID === "(default)") {
  throw new Error("JOBSHEET_DB_ID is not set to the Jobsheet database (jobsheet)");
}

/* =========================
   INITIALIZE FIREBASE
   1. a local service-account key (never deployed), or
   2. Application Default Credentials (Cloud Functions / Cloud Run)
========================= */

if (!admin.apps.length) {
  let options;

  try {
    const serviceAccount = require("./swordnexServiceAccountKey.json");

    if (PROJECT_ID && serviceAccount.project_id !== PROJECT_ID) {
      throw new Error(
        `Service account key is for project "${serviceAccount.project_id}" but FB_PROJECT_ID is "${PROJECT_ID}"`
      );
    }

    options = {
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    };
  } catch (err) {
    if (err.code !== "MODULE_NOT_FOUND") throw err;

    options = {
      credential: admin.credential.applicationDefault(),
      projectId: PROJECT_ID,
    };
  }

  admin.initializeApp({
    ...options,
    storageBucket:
      process.env.JOBSHEET_STORAGE_BUCKET ||
      `${options.projectId}.firebasestorage.app`,
  });

  console.log(`Firebase Admin initialized (project: ${admin.app().options.projectId}, database: ${DATABASE_ID})`);
}

/* =========================
   FIREBASE SERVICES
========================= */

const db = getFirestore(admin.app(), DATABASE_ID);
db.settings({ ignoreUndefinedProperties: true });

const bucket = admin.storage().bucket();

const auth = admin.auth();

/* =========================
   ACCOUNT IDS (no Firebase Auth users)

   The Firebase Auth user pool of this project is shared by every SwordNex app, so
   Jobsheet must NOT create, change or delete accounts in it (that would clash with,
   or rewrite the passwords of, the same person's other SwordNex logins).

   Jobsheet signs users in against the bcrypt hash stored in its own Firestore
   database, so Auth is only ever used to mint an id. This adapter keeps the
   `tenantAuth` interface the services already use and generates the ids locally.
========================= */
const notFound = () => {
  const error = new Error("There is no user record corresponding to the provided identifier.");
  error.code = "auth/user-not-found";
  return error;
};

// An id for an account that has no Firebase Auth user (e.g. a team member's login).
const newAccountId = () => crypto.randomUUID().replace(/-/g, "").slice(0, 28);

const localAuth = {
  async createUser({ email }) {
    return { uid: newAccountId(), email };
  },
  async getUserByEmail() {
    throw notFound(); // email uniqueness is enforced in Firestore
  },
  async updateUser() {
    return {};
  },
  async deleteUser() {},
  async verifyIdToken() {
    const error = new Error("Google sign-in is not available");
    error.code = "auth/argument-error";
    throw error;
  },
};

/* With JOBSHEET_SHARED_LOGIN=true the business owner's account IS a Firebase Auth user of the
   shared SwordNex pool (same login as the other SwordNex apps), so the real Auth service is used. */
const sharedLogin = String(process.env.JOBSHEET_SHARED_LOGIN || "").toLowerCase() === "true";
const tenantAuth = sharedLogin ? auth : localAuth;

/* =========================
   DATA ROOT
   <MYAPP_ROOT>/<MYAPP_TENANT_ID>/<collection>
========================= */

const tenantRef = db.collection(ROOT).doc(TENANT_ID);

const getCollection = (name) => tenantRef.collection(name);

export {
  admin,
  db,
  auth,
  tenantAuth,
  newAccountId,
  tenantRef,
  getCollection,
  TENANT_ID,
  bucket,
};
