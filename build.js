const fs = require('fs');
const path = require('path');

const root = __dirname;
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');

console.log('Running pre-deployment build...');

// Clean dist directory
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

// Copy all static assets from public/ into dist/
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, dist, { recursive: true });
  console.log('Copied public/ assets to dist/');
}

// Copy index.html into dist/
const indexPath = path.join(root, 'index.html');
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, path.join(dist, 'index.html'));
  console.log('Copied index.html to dist/');
}

// Copy server.js and package.json to dist/ (if needed)
const serverPath = path.join(root, 'server.js');
if (fs.existsSync(serverPath)) {
  fs.copyFileSync(serverPath, path.join(dist, 'server.js'));
}

console.log('Build completed successfully! dist/ is ready for deployment.');
