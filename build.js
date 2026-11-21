const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const assetsDir = path.join(publicDir, 'assets');
const indexPath = path.join(root, 'index.html');

console.log('Running pre-deployment build with asset content hashing...');

// Helper to compute an 8-character base64url content hash
function hashContent(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('base64url').slice(0, 8);
}

let newJsName = null;
let newCssName = null;

// 1. Hash and rename main-*.js and main-*.css in public/assets
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const currentJsFiles = assetFiles.filter(f => f.startsWith('main-') && f.endsWith('.js'));
  const currentCssFiles = assetFiles.filter(f => f.startsWith('main-') && f.endsWith('.css'));

  if (currentJsFiles.length > 0) {
    const currentJs = currentJsFiles[0];
    const jsContent = fs.readFileSync(path.join(assetsDir, currentJs));
    const jsHash = hashContent(jsContent);
    newJsName = `main-${jsHash}.js`;

    if (currentJs !== newJsName) {
      fs.renameSync(path.join(assetsDir, currentJs), path.join(assetsDir, newJsName));
      console.log(`Renamed JS: ${currentJs} -> ${newJsName}`);
    } else {
      console.log(`JS content hash unchanged: ${newJsName}`);
    }

    // Clean up any other old main-*.js files if they exist
    for (const f of currentJsFiles) {
      if (f !== currentJs && f !== newJsName && fs.existsSync(path.join(assetsDir, f))) {
        fs.unlinkSync(path.join(assetsDir, f));
      }
    }
  }

  if (currentCssFiles.length > 0) {
    const currentCss = currentCssFiles[0];
    const cssContent = fs.readFileSync(path.join(assetsDir, currentCss));
    const cssHash = hashContent(cssContent);
    newCssName = `main-${cssHash}.css`;

    if (currentCss !== newCssName) {
      fs.renameSync(path.join(assetsDir, currentCss), path.join(assetsDir, newCssName));
      console.log(`Renamed CSS: ${currentCss} -> ${newCssName}`);
    } else {
      console.log(`CSS content hash unchanged: ${newCssName}`);
    }

    // Clean up any other old main-*.css files if they exist
    for (const f of currentCssFiles) {
      if (f !== currentCss && f !== newCssName && fs.existsSync(path.join(assetsDir, f))) {
        fs.unlinkSync(path.join(assetsDir, f));
      }
    }
  }
}

// 2. Update index.html in root with the new hashed bundle filenames
if (fs.existsSync(indexPath) && (newJsName || newCssName)) {
  let indexHtml = fs.readFileSync(indexPath, 'utf8');
  if (newJsName) {
    indexHtml = indexHtml.replace(/src=["']\/assets\/main-[^"'\s>]+\.js["']/, `src="/assets/${newJsName}"`);
  }
  if (newCssName) {
    indexHtml = indexHtml.replace(/href=["']\/assets\/main-[^"'\s>]+\.css["']/, `href="/assets/${newCssName}"`);
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8');
  console.log(`Updated root index.html -> JS: /assets/${newJsName}, CSS: /assets/${newCssName}`);
}

// 3. Clean and recreate dist directory
if (fs.existsSync(dist)) {
  fs.rmSync(dist, { recursive: true, force: true });
}
fs.mkdirSync(dist, { recursive: true });

// 4. Copy all static assets from public/ into dist/
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, dist, { recursive: true });
  console.log('Copied public/ assets to dist/');
}

// 5. Copy index.html into dist/
if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, path.join(dist, 'index.html'));
  console.log('Copied index.html to dist/');
}

// 6. Copy server.js and package.json to dist/ (if needed)
const serverPath = path.join(root, 'server.js');
if (fs.existsSync(serverPath)) {
  fs.copyFileSync(serverPath, path.join(dist, 'server.js'));
}

console.log('Build completed successfully! dist/ is ready for deployment.');
