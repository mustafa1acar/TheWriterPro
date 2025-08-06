const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/writerpro';
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
    console.log(` Database: ${conn.connection.name}`);
    console.log(` Connection String: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log(' Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error(' Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' Mongoose disconnected from MongoDB');
    });

    // Graceful close on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log(' MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 