const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  stripeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    default: ''
  },
  credits: {
    type: Number,
    default: 0
  },
  buyerId: {
    type: String,
    required: true,
    index: true    // clerkId of the user
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    required: true
  }
}, {
  timestamps: true
});

// Indexes for fast lookup
TransactionSchema.index({ stripeId: 1 });
TransactionSchema.index({ buyerId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
