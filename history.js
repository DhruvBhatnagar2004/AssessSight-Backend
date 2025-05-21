const express = require('express');
const router = express.Router();
const ScanResult = require('./models/ScanResult');
const authMiddleware = require('./middleware/authMiddleware');

// Apply auth middleware to all history routes
router.use(authMiddleware);

// GET /api/history
router.get('/', async (req, res) => {
  try {
    // Filter by user if authenticated
    const query = req.user ? { user: req.user._id } : {};
    
    const scans = await ScanResult.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
