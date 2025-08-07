const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ module: 'whitelabel', status: 'operational', timestamp: new Date().toISOString() });
});

router.get('/instances', (req, res) => {
  res.json({ instances: [{ id: 1, domain: 'demo.kryonix.com', status: 'active' }], total: 1 });
});

module.exports = router;
