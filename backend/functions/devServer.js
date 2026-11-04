// Local development entry point.
// index.js only exports a Firebase Cloud Function and never calls listen(),
// so `nodemon index.js` would start and then idle. This file starts the same
// Express app on a normal port for local work.
import app from './server.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
