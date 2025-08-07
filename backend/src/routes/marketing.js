const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ module: 'marketing', status: 'operational', timestamp: new Date().toISOString() });
});

router.get('/campaigns', (req, res) => {
  res.json({ campaigns: [{ id: 1, name: 'Campanha Demo', status: 'active' }], total: 1 });
});

module.exports = router;
