const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('Already connected to MongoDB');
      return;
    }

    // Add these options to fix the connection
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: 'imagify',
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process, just log the error
    console.log('Server will continue without database connection');
  }
};

module.exports = connectToDatabase;
