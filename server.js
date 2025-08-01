const express = require('express');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 8080;

// Initialize Next.js app
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

// Initialize Express app
const expressApp = express();

// Security middleware
expressApp.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
expressApp.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'https://kryonix.com.br'],
  credentials: true
}));

// Body parsing middleware
expressApp.use(bodyParser.json({ limit: '10mb' }));
expressApp.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
expressApp.use(morgan('combined'));

// Health check endpoint
expressApp.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'kryonix-platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: port,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
expressApp.get('/api/status', (req, res) => {
  res.json({
    platform: 'KRYONIX',
    status: 'running',
    services: {
      web: 'active',
      api: 'active',
      next: 'active'
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Prepare Next.js and start server
nextApp.prepare().then(() => {
  console.log('🚀 KRYONIX Platform starting...');
  console.log(`📦 Dependencies loaded successfully`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Handle all other requests with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Create HTTP server
  const server = createServer(expressApp);

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('❌ Server failed to start:', err);
      process.exit(1);
    }

    console.log(`✅ KRYONIX Platform ready!`);
    console.log(`🌐 Server: http://${hostname}:${port}`);
    console.log(`💚 Health: http://${hostname}:${port}/health`);
    console.log(`📊 Status: http://${hostname}:${port}/api/status`);
    console.log(`🎯 All dependencies loaded and ready`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('❌ Failed to start KRYONIX Platform:', err);
  console.error('🔍 Check if all dependencies are installed correctly');
  process.exit(1);
});
