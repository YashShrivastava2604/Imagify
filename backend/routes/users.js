const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getUserById, updateUser, updateCredits } = require('../services/userService');

const router = express.Router();

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user credits
router.patch('/:userId/credits', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { creditFee } = req.body;
    const updatedUser = await updateCredits(userId, creditFee);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;