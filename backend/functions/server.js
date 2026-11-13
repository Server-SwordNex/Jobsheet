import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import superAdminLoginRoute from './routes/superAdminLoginRoute.js';
import pricingPlanRoute from './routes/pricingPlanRoute.js';
import userRegistrationRoute from './routes/userRegistrationRoute.js';
import userLoginRoute from './routes/userLoginRoute.js';
import userSessionRoute from './routes/userSessionRoute.js';
import technicianRoute from './routes/technicianRoute.js';
import jobsheetRoute from './routes/jobsheetRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import subuserRoute from './routes/subuserRoute.js';
import subuserRecordRoute from './routes/subuserRecordRoute.js';
import supportTicketRoute from './routes/supportTicketRoute.js';
import updateProfileRoute from './routes/updateProfileRoute.js';
import announcementRoute from './routes/announcementRoute.js';
import superAdminUserRoute from './routes/superAdminUserRoute.js';
import securityRoute from './routes/securityRoute.js';
import entitlementRoute from './routes/entitlementRoute.js';
import superAdminSettingsRoute from './routes/superAdminSettingsRoute.js';

const app = express();

// Optional allowlist: ALLOWED_ORIGINS="https://app.example.com,http://localhost:5173".
// The desktop (Electron) build is served from file:// and sends the origin "null".
// When unset every origin is allowed - safe here because auth uses a Bearer header
// (no cookies), but set it in production to lock the API down to your own apps.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length
    ? (origin, callback) => callback(null, !origin || origin === "null" || allowedOrigins.includes(origin))
    : true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-auth-token",
    "x-tenant-id",
    "x-firebase-appcheck",
    "x-safe",
  ],
  exposedHeaders: ["Content-Length", "Content-Type", "Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Behind the Cloud Functions / Google front end: needed for the real client IP (rate limiting)
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(superAdminLoginRoute);
app.use(pricingPlanRoute);
app.use(userRegistrationRoute);
app.use(userLoginRoute);
app.use(userSessionRoute);
app.use(technicianRoute);
app.use(jobsheetRoute);
app.use(dashboardRoute);
app.use(subuserRoute);
app.use(subuserRecordRoute);
app.use(supportTicketRoute);
app.use(updateProfileRoute);
app.use(announcementRoute);
app.use(superAdminUserRoute);
app.use(securityRoute);
app.use(entitlementRoute);
app.use(superAdminSettingsRoute);

app.get("/", (req, res) => {
  res.send("Hello from the Jobsheet API!");
});


// NOTE: the daily subscription reminder job is NOT started here. In production it runs
// as a scheduled Cloud Function (see index.js); for local development devServer.js
// starts it.

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


export default app;
