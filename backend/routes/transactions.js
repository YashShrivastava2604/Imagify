const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { checkoutCredits, createTransaction } = require('../services/transactionService');

const router = express.Router();

// Checkout credits
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const transaction = req.body;
    const sessionUrl = await checkoutCredits(transaction);
    res.json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
