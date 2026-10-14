const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('Building WhatITakeHome for production...');

// 1. Rebuild states and sitemap in root first
require('./build-states.js');
require('./build-sitemap.js');

// 2. Prepare clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Helper to copy files recursively
function copySync(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copySync(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 3. Copy HTML files
const files = fs.readdirSync(rootDir);
files.forEach(f => {
  if (f.endsWith('.html') || f === 'favicon.svg' || f === 'robots.txt' || f === 'sitemap.xml') {
    fs.copyFileSync(path.join(rootDir, f), path.join(distDir, f));
  }
});

// 4. Copy CSS and JS assets
copySync(path.join(rootDir, 'css'), path.join(distDir, 'css'));
copySync(path.join(rootDir, 'js'), path.join(distDir, 'js'));

const distFiles = fs.readdirSync(distDir);
console.log(`✓ Build successful! Exported ${distFiles.length} top-level entries to dist/`);
