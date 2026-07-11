const mongoose = require('mongoose');

/**
 * Establish connection to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing inside .env');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected Successfully');
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit server process on connection failure as requested
    process.exit(1);
  }
};

module.exports = connectDB;
