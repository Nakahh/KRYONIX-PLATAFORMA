import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    service: 'kryonix-platform',
    timestamp: Date.now(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
    vercel: true,
    platform: 'Vercel Serverless',
    region: process.env.VERCEL_REGION || 'unknown'
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
