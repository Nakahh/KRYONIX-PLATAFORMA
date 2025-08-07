const express = require('express');
const router = express.Router();

// Health check for CRM module
router.get('/health', (req, res) => {
  res.json({
    module: 'crm',
    status: 'operational',
    features: ['contacts', 'leads', 'opportunities'],
    timestamp: new Date().toISOString()
  });
});

// Get contacts
router.get('/contacts', (req, res) => {
  res.json({
    contacts: [
      { id: 1, name: 'Cliente Demo', email: 'demo@kryonix.com.br', status: 'active' }
    ],
    total: 1
  });
});

// Get leads
router.get('/leads', (req, res) => {
  res.json({
    leads: [
      { id: 1, name: 'Lead Demo', source: 'website', score: 85, status: 'qualified' }
    ],
    total: 1
  });
});

// Get opportunities
router.get('/opportunities', (req, res) => {
  res.json({
    opportunities: [
      { id: 1, title: 'Oportunidade Demo', value: 5000, stage: 'proposal', probability: 75 }
    ],
    total: 1
  });
});

module.exports = router;
