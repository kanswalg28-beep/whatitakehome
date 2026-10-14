const fs = require('fs');
const path = require('path');
const TaxData = require('../js/tax-data.js');
const TaxEngine = require('../js/tax-engine.js');

const engine = new TaxEngine(TaxData);

console.log('--------------------------------------------------');
console.log('WHATITAKEHOME COMPREHENSIVE SUITE AUDIT & VERIFICATION');
console.log('--------------------------------------------------');

let passed = 0;
let total = 0;

function assert(name, condition, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name}: ${details}`);
    process.exitCode = 1;
  }
}

// 1. Core 2026 Benchmark (IRS Rev. Proc. 2025-32)
const r2026 = engine.calculate(100000, 'single', 'CA', 'none', { retirement: 0, health: 0 }, '2026');
assert('2026 CA $100k Single Federal Tax is $13,170', Math.round(r2026.federalTax) === 13170, `got ${Math.round(r2026.federalTax)}`);
assert('2026 CA $100k Single State Tax is $5,327', Math.round(r2026.stateTax) === 5327, `got ${Math.round(r2026.stateTax)}`);
assert('2026 CA $100k Single FICA is $7,650', Math.round(r2026.totalFica) === 7650, `got ${Math.round(r2026.totalFica)}`);
assert('2026 CA $100k Single Take-Home is $73,853', Math.round(r2026.takeHome) === 73853, `got ${Math.round(r2026.takeHome)}`);
assert('2026 Standard Deduction is $16,100', r2026.federalStandardDeduction === 16100, `got ${r2026.federalStandardDeduction}`);
assert('2026 401(k) limit is $24,500', r2026.retirement401kMax === 24500, `got ${r2026.retirement401kMax}`);

// 2. 2026 Head of Household (hoh)
const rHoh = engine.calculate(100000, 'hoh', 'CA', 'none', { retirement: 0, health: 0 }, '2026');
assert('2026 HOH Standard Deduction is $24,150', rHoh.federalStandardDeduction === 24150, `got ${rHoh.federalStandardDeduction}`);
assert('2026 HOH Federal Tax is lower than Single ($100k)', rHoh.federalTax < r2026.federalTax, `got ${rHoh.federalTax} vs ${r2026.federalTax}`);

// 3. 2025 Prior Year Verification (OBBBA amended)
const r2025 = engine.calculate(100000, 'single', 'CA', 'none', { retirement: 0, health: 0 }, '2025');
assert('2025 Standard Deduction is $15,750', r2025.federalStandardDeduction === 15750, `got ${r2025.federalStandardDeduction}`);
assert('2025 401k Limit is $23,500', r2025.retirement401kMax === 23500, `got ${r2025.retirement401kMax}`);

// 4. 2024 Prior Year Verification
const r2024 = engine.calculate(100000, 'single', 'CA', 'none', { retirement: 0, health: 0 }, '2024');
assert('2024 Standard Deduction is $14,600', r2024.federalStandardDeduction === 14600, `got ${r2024.federalStandardDeduction}`);
assert('2024 401k Limit is $23,000', r2024.retirement401kMax === 23000, `got ${r2024.retirement401kMax}`);

// 5. No-State-Tax (Texas) Single $150k for 2026
const rTx = engine.calculate(150000, 'single', 'TX', 'none', { retirement: 0, health: 0 }, '2026');
assert('2026 TX $150k State Tax is $0', rTx.stateTax === 0, `got ${rTx.stateTax}`);
assert('2026 TX $150k Take-home matches gross - fed - fica', Math.round(rTx.takeHome) === Math.round(150000 - rTx.federalTax - rTx.totalFica));

// 6. Zero Income Edge Case ($0)
const rZero = engine.calculate(0, 'single', 'CA', 'none', { retirement: 0, health: 0 }, '2026');
assert('Zero income produces 0 take-home', rZero.takeHome === 0);
assert('Zero income produces 0 total tax', rZero.totalTax === 0);
assert('Zero income effective rate is 0', rZero.effectiveTaxRate === 0);
assert('Zero income produces no NaN in any field', !Object.values(rZero).some(v => typeof v === 'number' && isNaN(v)));

// 7. Ultra High Income ($10,000,000) for 2026
const rHigh = engine.calculate(10000000, 'single', 'CA', 'none', { retirement: 0, health: 0 }, '2026');
const ssCapTax2026 = 184500 * 0.062;
assert('2026 SS Tax capped at $11,439 ($184,500 SSA limit)', Math.abs(rHigh.socialSecurityTax - ssCapTax2026) < 0.01, `got ${rHigh.socialSecurityTax}`);
assert('Additional Medicare tax (0.9% over $200k) applied', rHigh.medicareTax > 10000000 * 0.0145);

// 8. Pre-Tax Deductions (401k & Healthcare Section 125)
const rPreTax = engine.calculate(100000, 'single', 'CA', 'none', { retirement: 20000, health: 5000 }, '2026');
assert('Health insurance reduces FICA base', rPreTax.totalFica < 7650);
assert('401(k) + Health reduces taxable federal income base', rPreTax.taxableFederalIncome === 100000 - 25000 - 16100);

// 9. Trust & Legal Content Pages
const legalPages = ['about.html', 'contact.html', 'disclaimer.html', 'privacy.html', 'favicon.svg'];
legalPages.forEach(page => {
  const pPath = path.join(__dirname, '..', page);
  assert(`Legal / asset file exists: ${page}`, fs.existsSync(pPath));
});

// 10. Template and All 51 State Pages Consistency
const statesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json'), 'utf8'));
const stateList = Object.entries(statesData);
assert('51 States/Jurisdictions in config', stateList.length === 51);

let allStatesExist = true;
let allStatesHaveGuides = true;
let allStatesHave2026 = true;
let allStatesHaveHoh = true;

stateList.forEach(([code, data]) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-');
  const file = path.join(__dirname, '..', `${slug}.html`);
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${slug}.html`);
    allStatesExist = false;
  } else {
    const html = fs.readFileSync(file, 'utf8');
    if (!html.includes('id="state-guide"')) {
      console.error(`Missing state-guide in ${slug}.html`);
      allStatesHaveGuides = false;
    }
    if (!html.includes('value="2026"')) {
      console.error(`Missing 2026 in ${slug}.html`);
      allStatesHave2026 = false;
    }
    if (!html.includes('value="hoh"')) {
      console.error(`Missing hoh in ${slug}.html`);
      allStatesHaveHoh = false;
    }
  }
});

assert('All 51 state HTML files exist on disk', allStatesExist);
assert('All 51 state HTML files include state guide & benchmark tables', allStatesHaveGuides);
assert('All 51 state HTML files include 2026 tax year option', allStatesHave2026);
assert('All 51 state HTML files include Head of Household filing option', allStatesHaveHoh);

// 11. Sitemap Verification
const sitemap = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
assert('Sitemap includes about.html', sitemap.includes('/about.html'));
assert('Sitemap includes privacy.html', sitemap.includes('/privacy.html'));
assert('Sitemap includes disclaimer.html', sitemap.includes('/disclaimer.html'));
assert('Sitemap includes contact.html', sitemap.includes('/contact.html'));
assert('Sitemap has all 51 states', stateList.every(([code, data]) => sitemap.includes(`/${data.name.toLowerCase().replace(/\s+/g, '-')}.html`)));

console.log('--------------------------------------------------');
console.log(`AUDIT COMPLETE: ${passed} / ${total} CHECKS PASSED.`);
console.log('--------------------------------------------------');
