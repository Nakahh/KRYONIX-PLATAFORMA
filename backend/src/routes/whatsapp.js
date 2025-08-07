const express = require('express');
const router = express.Router();

// Health check for WhatsApp module
router.get('/health', (req, res) => {
  res.json({
    module: 'whatsapp',
    status: 'operational',
    features: ['send-message', 'webhooks', 'automation'],
    timestamp: new Date().toISOString()
  });
});

// Send message
router.post('/send-message', (req, res) => {
  const { to, message } = req.body;
  
  res.json({
    success: true,
    messageId: 'msg_' + Date.now(),
    to,
    message,
    status: 'sent',
    timestamp: new Date().toISOString()
  });
});

// Get messages
router.get('/messages', (req, res) => {
  res.json({
    messages: [
      {
        id: 'msg_1',
        from: '+5511999999999',
        to: '+5511888888888',
        message: 'Mensagem demo',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      }
    ],
    total: 1
  });
});

// Webhook endpoint
router.post('/webhook', (req, res) => {
  console.log('WhatsApp webhook received:', req.body);
  res.json({ success: true });
});

module.exports = router;
