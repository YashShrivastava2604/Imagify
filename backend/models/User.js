const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,     // Allow multiple null values
    default: null,    // Default to null if not provided
  },
  photo: {
    type: String,
    default: null,    // Make photo optional
  },
  firstName: {
    type: String,
    default: '',      // Default empty string
  },
  lastName: {
    type: String,
    default: '',      // Default empty string
  },
  planId: {
    type: Number,
    default: 1,
  },
  creditBalance: {
    type: Number,
    default: 10,
  },
}, {
  timestamps: true
});

// Ensure indexes are created
UserSchema.index({ clerkId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 }, { sparse: true });

module.exports = mongoose.model('User', UserSchema);
