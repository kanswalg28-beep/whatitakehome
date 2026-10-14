const fs = require('fs');
const path = require('path');
const TaxData = require('../js/tax-data.js');
const TaxEngine = require('../js/tax-engine.js');

const engine = new TaxEngine(TaxData);
const statesFile = path.join(__dirname, 'states.json');
const templateFile = path.join(__dirname, 'template.html');
const outDir = path.join(__dirname, '..');

const states = JSON.parse(fs.readFileSync(statesFile, 'utf-8'));
const template = fs.readFileSync(templateFile, 'utf-8');

function formatRawNumber(num) {
  return Math.round(num).toLocaleString('en-US');
}

function generateStateGuide(code, stateName) {
  const s = TaxData.states[code];
  if (!s) return '';

  let taxTypeDesc = '';
  if (s.type === 'none') {
    if (code === 'WA') {
      taxTypeDesc = `<strong>State income tax:</strong> No state income tax on wages. Washington has no tax on wage income. It does charge payroll premiums for programs such as Paid Family and Medical Leave and WA Cares, and a separate tax on certain capital gains; none of those are included here.`;
    } else if (code === 'TX') {
      taxTypeDesc = `<strong>State income tax:</strong> No state income tax. Texas has no state income tax on wages, so your paycheck is reduced only by federal income tax and FICA. Local property and sales taxes are not part of a paycheck calculation.`;
    } else if (code === 'NH') {
      taxTypeDesc = `<strong>State income tax:</strong> No state income tax on earned wages. New Hampshire does not tax W-2 wage income, so your paycheck is reduced only by federal income tax and FICA.`;
    } else if (code === 'TN') {
      taxTypeDesc = `<strong>State income tax:</strong> No state income tax. Tennessee has no personal income tax on earned wages, so your paycheck is reduced only by federal income tax and FICA.`;
    } else {
      taxTypeDesc = `<strong>State income tax:</strong> No state income tax. ${stateName} has no state income tax on wages, so your paycheck is reduced only by federal income tax and FICA.`;
    }
  } else if (s.type === 'flat') {
    const ratePct = (s.rate * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
    const stdDedNote = s.stdDed && (s.stdDed.single > 0 || s.stdDed.married > 0)
      ? ` State standard deductions reduce taxable wages before the flat rate applies.`
      : ``;
    taxTypeDesc = `<strong>State income tax:</strong> Flat (${ratePct}). ${stateName} levies a flat individual income tax of ${ratePct} across taxable wage income, keeping withholding straightforward regardless of income bracket.${stdDedNote}`;
  } else if (s.type === 'progressive') {
    if (code === 'CA') {
      taxTypeDesc = `<strong>State income tax:</strong> Progressive (1% to 13.3%). California uses graduated rates from 1% up, so the share you pay rises with income. California also charges State Disability Insurance (SDI) through payroll, which this calculator does not include, so real paychecks will be a little lower than shown.`;
    } else if (code === 'NY') {
      taxTypeDesc = `<strong>State income tax:</strong> Progressive (4% to 10.9%). New York uses graduated rates. New York City and Yonkers residents also pay a local income tax; choose the local zone in the calculator to include it. Other payroll programs, such as state disability and paid family leave premiums, are not included.`;
    } else if (code === 'NJ') {
      taxTypeDesc = `<strong>State income tax:</strong> Progressive (1.4% to 10.75%). New Jersey uses graduated tax brackets where higher portions of income are taxed at increasing rates. Local property taxes or state payroll withholdings (such as FLI/SUI) are not included in this paycheck estimate.`;
    } else if (code === 'DC') {
      taxTypeDesc = `<strong>State income tax:</strong> Progressive (4% to 10.75%). The District of Columbia levies graduated income tax rates ranging from 4% to 10.75% across progressive income brackets.`;
    } else {
      const bList = s.brackets.single;
      const minRate = (bList[0].rate * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
      const maxRate = (bList[bList.length - 1].rate * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
      taxTypeDesc = `<strong>State income tax:</strong> Progressive (${minRate} to ${maxRate}). ${stateName} uses graduated tax brackets ranging from ${minRate} to ${maxRate}, so higher portions of your wage income are taxed at progressively higher marginal rates.`;
    }
  }

  // 100k single filer example
  const calc100k = engine.calculate(100000, 'single', code, 'none', { retirement: 0, health: 0 }, '2026');
  const effRate100k = (calc100k.effectiveTaxRate * 100).toFixed(1) + '%';
  const ex100k = `For a single filer earning $100,000 with no pre-tax deductions, the estimate is $${formatRawNumber(calc100k.takeHome)} a year in take-home pay: $${formatRawNumber(calc100k.federalTax)} federal income tax, $${formatRawNumber(calc100k.stateTax)} ${stateName} income tax and $${formatRawNumber(calc100k.totalFica)} Social Security and Medicare, an effective rate of ${effRate100k}.`;

  const salaries = [50000, 75000, 100000, 150000, 200000];

  function buildTable(filing) {
    let rows = '';
    for (const amt of salaries) {
      const res = engine.calculate(amt, filing, code, 'none', { retirement: 0, health: 0 }, '2026');
      const fedRounded = Math.round(res.federalTax);
      const stateRounded = Math.round(res.stateTax);
      const ficaRounded = Math.round(res.totalFica);
      // Ensure take-home + taxes sum to gross for visual consistency in table rows
      const takeHomeBalanced = amt - fedRounded - stateRounded - ficaRounded;
      const eff = (res.effectiveTaxRate * 100).toFixed(1) + '%';
      rows += `<tr><td class="tabular-nums"><strong>$${formatRawNumber(amt)}</strong></td><td class="tabular-nums">$${formatRawNumber(fedRounded)}</td><td class="tabular-nums">$${formatRawNumber(stateRounded)}</td><td class="tabular-nums">$${formatRawNumber(ficaRounded)}</td><td class="tabular-nums" style="font-weight:700;">$${formatRawNumber(takeHomeBalanced)}</td><td class="tabular-nums">${eff}</td></tr>`;
    }
    return `<div class="matrix-card"><table class="matrix-table"><thead><tr><th>Gross salary</th><th>Federal tax</th><th>${stateName} tax</th><th>FICA</th><th>Take-home</th><th>Effective rate</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  const singleTable = buildTable('single');
  const marriedTable = buildTable('married');

  return `  <section class="state-guide" id="state-guide">
    <h2>${stateName} paycheck taxes in 2026</h2>
    <p>${taxTypeDesc}</p>
    <p>${ex100k}</p>
    <h3 style="margin:1.25rem 0 .5rem;">Single filer, 2026</h3>${singleTable}
    <h3 style="margin:1.25rem 0 .5rem;">Married filing jointly, 2026</h3>${marriedTable}
    <p class="calc-disclaimer">Computed with the calculator above using 2026 federal figures and the state rules described in our <a href="disclaimer.html">disclaimer</a>. No pre-tax deductions, credits or local taxes. Estimates only.</p>
  </section>`;
}

let count = 0;
for (const [code, data] of Object.entries(states)) {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-');
  const guideContent = generateStateGuide(code, data.name);

  const html = template
    .replace(/{{STATE_NAME}}/g, data.name)
    .replace(/{{STATE_CODE}}/g, code)
    .replace(/{{STATE_SLUG}}/g, slug)
    .replace(/{{STATE_GUIDE_CONTENT}}/g, guideContent);

  fs.writeFileSync(path.join(outDir, `${slug}.html`), html);
  count++;
}

console.log(`Successfully generated ${count} state pages.`);
