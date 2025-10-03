const express = require('express');
const router = express.Router();

// Auth routes will be handled by Clerk on the frontend

router.get('/status', (req, res) => {
  res.json({ message: 'Auth service is running' });
});

module.exports = router;