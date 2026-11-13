// Local development entry point.
// index.js only exports a Firebase Cloud Function and never calls listen(),
// so `nodemon index.js` would start and then idle. This file starts the same
// Express app on a normal port for local work.
import app from './server.js';
import subscriptionReminderCron from './cronJobs/subscriptionReminderCron.js';

const PORT = process.env.PORT || 5000;

// In production this runs as a scheduled Cloud Function (index.js). Locally it is opt-in,
// because a dev server may point at the live database and would email real customers.
if (process.env.RUN_CRON_LOCALLY === 'true') {
  subscriptionReminderCron();
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
