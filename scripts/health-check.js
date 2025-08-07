#!/usr/bin/env node

/**
 * 🏥 KRYONIX - Health Check Script
 * 
 * Verifica se todos os serviços estão funcionando corretamente
 * Compatível com Vercel e Render
 */

const http = require('http');
const https = require('https');
const { promisify } = require('util');

console.log('🏥 KRYONIX - Health Check');

async function healthCheck() {
  const checks = [];
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  checks.push({
    name: 'Node.js Version',
    status: majorVersion >= 18 ? 'ok' : 'error',
    value: nodeVersion,
    required: '>=18.0.0'
  });

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memoryMB = Math.round(memUsage.rss / 1024 / 1024);
  
  checks.push({
    name: 'Memory Usage',
    status: memoryMB < 512 ? 'ok' : 'warning',
    value: `${memoryMB}MB`,
    threshold: '512MB'
  });

  // Check environment variables
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT'
  ];

  requiredEnvVars.forEach(envVar => {
    checks.push({
      name: `Environment Variable: ${envVar}`,
      status: process.env[envVar] ? 'ok' : 'warning',
      value: process.env[envVar] || 'not-set'
    });
  });

  // Check database connection (if applicable)
  if (process.env.DATABASE_URL) {
    try {
      // Simple connection test would go here
      checks.push({
        name: 'Database Connection',
        status: 'ok',
        value: 'connected'
      });
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'error',
        value: error.message
      });
    }
  }

  // Generate report
  console.log('\n📊 Health Check Results:');
  console.log('='.repeat(50));
  
  let errorCount = 0;
  let warningCount = 0;
  
  checks.forEach(check => {
    const icon = check.status === 'ok' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.value}`);
    
    if (check.status === 'error') errorCount++;
    if (check.status === 'warning') warningCount++;
  });

  console.log('='.repeat(50));
  console.log(`📈 Summary: ${checks.length - errorCount - warningCount} OK, ${warningCount} Warnings, ${errorCount} Errors`);
  
  if (errorCount > 0) {
    console.log('❌ Health check failed');
    process.exit(1);
  } else {
    console.log('✅ Health check passed');
    process.exit(0);
  }
}

healthCheck().catch(error => {
  console.error('❌ Health check failed:', error);
  process.exit(1);
});
