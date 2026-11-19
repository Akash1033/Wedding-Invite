const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const publicRoot = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded === '/' ? '/index.html' : decoded;
  const base = relative.startsWith('/assets/') || relative.startsWith('/audio/') || relative === '/manus-routes.json' || relative === '/favicon.png' || relative === '/apple-touch-icon.png' || relative === '/og-wedding-groom.jpg' ? publicRoot : root;
  const resolved = path.normalize(path.join(base, relative));
  return resolved.startsWith(base) ? resolved : null;
}

const server = http.createServer((req, res) => {
  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(400); res.end('Bad request'); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const type = mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    if ((req.headers.accept || '').includes('text/html')) {
      res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-cache' });
      fs.createReadStream(path.join(root, 'index.html')).pipe(res);
      return;
    }
    res.writeHead(404); res.end('Not found');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Vardan & Sameeksha invitation listening on ${port}`);
});
