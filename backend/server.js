const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
const cloudinary = require('./utils/Uploading utils/cloudinary'); // Cloudinary must load AFTER dotenv

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.error('DB connection error:', err));

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
process.on('uncaughtException', (err) => {
  console.log('Shutting down due to an uncaught exception... 💣');
  console.error(err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.log('Shutting down due to an unhandled rejection... 💣');
  console.error(err); // Log full error details
  server.close(() => {
    process.exit(1);
  });
});
