

import admin from "firebase-admin";

import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./envConfig.js";


/* =========================
   FIX __dirname
========================= */

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

/* =========================
   ROOT CONFIG
========================= */

const ROOT =
    config.myappRoot;

const TENANT_ID =
    config.myappTenantId;


if (!TENANT_ID) {
    throw new Error(
        "MYAPP_TENANT_ID is missing in .env"
    );
}

/* =========================
   INITIALIZE FIREBASE
========================= */

async function initializeFirebase() {

    if (!admin.apps.length) {

        try {

            const serviceAccountPath =
                path.join(
                    __dirname,
                    "swordnexServiceAccountKey.json"
                );

            const serviceAccount =
                JSON.parse(
                    await readFile(
                        serviceAccountPath,
                        "utf8"
                    )
                );

            admin.initializeApp({
                credential:
                    admin.credential.cert(
                        serviceAccount
                    ),

                projectId:
                    serviceAccount.project_id,

                storageBucket:
                    `${serviceAccount.project_id}.firebasestorage.app`,
            });

            console.log(
                "✅ Firebase Admin initialized successfully"
            );

            console.log(`${serviceAccount.project_id}.appspot.com`);
        } catch (error) {

            console.error(
                "❌ Firebase initialization failed:",
                error.message
            );

            process.exit(1);
        }
    }
}

/* =========================
   START FIREBASE
========================= */

await initializeFirebase();

/* =========================
   FIREBASE SERVICES
========================= */

const db = admin.firestore();

const bucket = admin.storage().bucket();

const auth =
    admin.auth();

/* =========================
   TENANT AUTH
========================= */

const tenantAuth =
    auth
        .tenantManager()
        .authForTenant(TENANT_ID);

/* =========================
   TENANT ROOT
========================= */

const tenantRef =
    db
        .collection(ROOT)
        .doc(TENANT_ID);

/* =========================
   COLLECTION HELPER
========================= */

const getCollection = (
    name
) => {
    return tenantRef.collection(name);
};

/* =========================
   EXPORTS
========================= */

export {
    admin,
    db,
    auth,
    tenantAuth,
    tenantRef,
    getCollection,
    TENANT_ID,
    bucket,
};