const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGO_URL_LOCAL;

mongoose.connect(mongoURL)
  .then(() => console.log('Connected to MongoDB server'))
  .catch(err => console.error('MongoDB connection error:', err));

// Get the default mongoose connection
const db = mongoose.connection;

db.on('connected', () => {
  console.log('MongoDB connection established');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = db;
