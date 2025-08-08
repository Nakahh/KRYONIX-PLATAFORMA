const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

console.log('🚀 KRYONIX Emergency Server Starting...');
console.log(`📡 Mode: ${dev ? 'Development' : 'Production'}`);
console.log(`🌐 Port: ${port}`);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Health check endpoint
      if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'OK', 
          service: 'KRYONIX Emergency',
          timestamp: new Date().toISOString()
        }));
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`✅ KRYONIX Emergency Server ready on http://${hostname}:${port}`);
    console.log(`🔍 Health check: http://${hostname}:${port}/health`);
  });
});
