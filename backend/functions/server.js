import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import subscriptionReminderCron from './cronJobs/subscriptionReminderCron.js';
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

const app = express();

const corsOptions = {
  origin: true,
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
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json());
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

app.get("/", (req, res) => {
  res.send("Hello from the Jobsheet API!");
});


// Initialize subscription reminder cron jobs
subscriptionReminderCron();

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


export default app;
