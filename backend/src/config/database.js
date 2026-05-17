require('dotenv').config();
const mongoose = require('mongoose');

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB connection error:", err);
    throw err;
  }
};

module.exports = connection;
