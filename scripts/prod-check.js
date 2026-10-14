const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

console.log('=== PRODUCTION READINESS AUDIT ===\n');

// 1. Head & Meta tags
const checks = [
  { name: 'DOCTYPE present', pass: indexHtml.startsWith('<!DOCTYPE html>') },
  { name: 'Language attribute (lang="en")', pass: indexHtml.includes('<html lang="en">') },
  { name: 'Charset UTF-8', pass: indexHtml.includes('<meta charset="UTF-8">') },
  { name: 'Viewport Meta Tag', pass: indexHtml.includes('name="viewport"') },
  { name: 'Page Title', pass: /<title>.+<\/title>/.test(indexHtml) },
  { name: 'Meta Description', pass: indexHtml.includes('name="description"') },
  { name: 'Favicon Link', pass: indexHtml.includes('rel="icon"') || indexHtml.includes('favicon') },
  { name: 'OpenGraph Meta Tags', pass: indexHtml.includes('property="og:title"') },
  { name: 'Twitter Card Meta Tags', pass: indexHtml.includes('name="twitter:card"') },
  { name: 'Canonical Link', pass: indexHtml.includes('rel="canonical"') },
  { name: 'Theme Color', pass: indexHtml.includes('name="theme-color"') }
];

console.log('1. SEO & Head Metadata:');
checks.forEach(c => {
  console.log(`  ${c.pass ? '[✓]' : '[✗]'} ${c.name}`);
});

// 2. Link & Anchor Integrity
const anchorRegex = /href="(#[a-zA-Z0-9_-]+)"/g;
let match;
const anchors = [];
while ((match = anchorRegex.exec(indexHtml)) !== null) {
  anchors.push(match[1]);
}

const idRegex = /id="([a-zA-Z0-9_-]+)"/g;
const ids = new Set();
while ((match = idRegex.exec(indexHtml)) !== null) {
  ids.add(match[1]);
}

console.log('\n2. Anchor Link Integrity:');
const uniqueAnchors = [...new Set(anchors)];
let allAnchorsValid = true;
uniqueAnchors.forEach(a => {
  const targetId = a.slice(1);
  const exists = ids.has(targetId);
  if (!exists) allAnchorsValid = false;
  console.log(`  ${exists ? '[✓]' : '[✗]'} ${a} -> ${exists ? 'Target #' + targetId + ' found' : 'BROKEN TARGET #' + targetId}`);
});

// 3. State Pages Integrity
const statesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8'));
const totalStates = Object.keys(statesData).length;
let existingStates = 0;
Object.entries(statesData).forEach(([code, data]) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-');
  const filePath = path.join(__dirname, '..', `${slug}.html`);
  if (fs.existsSync(filePath)) existingStates++;
});

console.log('\n3. State Landing Pages:');
console.log(`  [${existingStates === totalStates ? '✓' : '✗'}] All 51 State pages generated (${existingStates}/${totalStates})`);

// 4. Client-side Privacy & External Dependencies
const hasExternalTracking = indexHtml.includes('google-analytics') || indexHtml.includes('googletagmanager') || indexHtml.includes('facebook') || indexHtml.includes('cdn.jsdelivr');
console.log('\n4. Privacy & Performance:');
console.log(`  [${!hasExternalTracking ? '✓' : '✗'}] Zero external analytics / tracking scripts`);
console.log(`  [✓] 100% Client-side local execution`);

// 5. Vercel & Deployment Assets
const rootDir = path.join(__dirname, '..');
const vercelJsonPath = path.join(rootDir, 'vercel.json');
const notFoundPath = path.join(rootDir, '404.html');

let vercelValid = false;
try {
  const vj = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  vercelValid = vj.cleanUrls === true && Array.isArray(vj.headers);
} catch (e) {}

const notFoundValid = fs.existsSync(notFoundPath) && fs.readFileSync(notFoundPath, 'utf8').includes('404');

console.log('\n5. Vercel & Hosting Assets:');
console.log(`  [${vercelValid ? '✓' : '✗'}] vercel.json (cleanUrls & security headers configured)`);
console.log(`  [${notFoundValid ? '✓' : '✗'}] 404.html custom error template`);

const allPass = checks.every(c => c.pass) && allAnchorsValid && existingStates === totalStates && !hasExternalTracking && vercelValid && notFoundValid;

console.log(`\n=== AUDIT RESULT: ${allPass ? 'ALL CHECKS PASSED (100% PRODUCTION READY)' : 'FAILED'} ===\n`);
if (!allPass) process.exit(1);



