const fs = require('fs');
const path = require('path');

const baseUrl = 'https://whatitakehome.com';
const statesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8'));

const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Legal and informational pages
const infoPages = ['about.html', 'privacy.html', 'disclaimer.html', 'contact.html'];
infoPages.forEach(page => {
  xml += `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
});

// All 51 state guide pages
Object.values(statesData).forEach(s => {
  const slug = s.name.toLowerCase().replace(/\s+/g, '-');
  xml += `  <url>
    <loc>${baseUrl}/${slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

xml += `</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${1 + infoPages.length + Object.keys(statesData).length} URLs.`);
