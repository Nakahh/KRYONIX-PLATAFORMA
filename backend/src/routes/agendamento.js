const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ module: 'agendamento', status: 'operational', timestamp: new Date().toISOString() });
});

router.get('/appointments', (req, res) => {
  res.json({
    appointments: [
      { id: 1, title: 'Reunião Demo', date: '2025-01-20T10:00:00Z', client: 'Cliente Demo' }
    ],
    total: 1
  });
});

module.exports = router;
