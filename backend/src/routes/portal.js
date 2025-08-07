const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ module: 'portal', status: 'operational', timestamp: new Date().toISOString() });
});

router.get('/clients', (req, res) => {
  res.json({ clients: [{ id: 1, name: 'Portal Demo', plan: 'premium' }], total: 1 });
});

module.exports = router;
