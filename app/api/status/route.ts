import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    platform: 'KRYONIX',
    status: 'running',
    services: {
      web: 'active',
      api: 'active',
      next: 'active',
      webhook: 'active',
      vercel: 'enabled'
    },
    version: '2.0.0',
    features: ['auto-dependency-update', 'vercel-deployment', 'next-js-app-router'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    deployment: {
      platform: 'Vercel',
      region: process.env.VERCEL_REGION || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      url: process.env.VERCEL_URL || 'localhost'
    }
  });
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
