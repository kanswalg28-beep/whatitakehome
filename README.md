# WhatITakeHome 💼

**Free, fast, and 100% private US Income Tax & Paycheck Calculator (2026).**

WhatITakeHome estimates net take-home pay from gross wages by simulating federal income tax brackets, FICA payroll taxes (Social Security & Medicare), and 50-state + DC state and local tax withholding.

All calculations execute **100% locally in your browser** — zero income, deduction, or location data is ever transmitted to a server.

---

## ✨ Features

- **2026 IRS Statutory Baselines:** Configured with IRS Revenue Procedure 2025-32 inflation adjustments, 2026 standard deductions ($16,100 Single / $32,200 Married / $24,150 Head of Household), and the $184,500 Social Security statutory wage base.
- **50-State + DC Coverage:** Models progressive state income taxes, flat-tax schedules (including 2026 reforms), standard deductions, and local surcharges (NYC, Yonkers).
- **Interactive 3D Paycheck Telemetry:** Canvas-driven 3D pie visualizer with synced frequency breakdowns (Annual, Monthly, Bi-Weekly, Weekly, Hourly).
- **Federal Progressive Tax Ladder:** Tier-by-tier visualizer showing how each income slice fills lower tax brackets first.
- **Relocation Tax Arbitrage Duel:** Compare take-home pay and tax drag side-by-side between any two states in real time.
- **Command Palette Quick-Input (⌘K / Ctrl+K):** Natural language parser supporting shortcuts like `150k CA single` or `120000 NYC married`.
- **Zero-Dependency Vanilla Stack:** Lightweight, ultra-fast HTML5, modern CSS, and vanilla ES6 JavaScript with no heavy build systems.

---

## 🛠️ Project Structure

```text
├── index.html               # Main calculator application
├── about.html               # Mission, methodology & source citations
├── contact.html             # Feedback and bug reporting
├── disclaimer.html          # Statutory estimation disclosures
├── privacy.html             # Client-side zero-tracking privacy policy
├── [state-name].html        # 51 Dedicated SEO state tax guide pages
├── css/
│   ├── theme.css            # Color variables, typography tokens & resets
│   └── layout.css           # Bento grid, responsive layout & print stylesheet
├── js/
│   ├── tax-data.js          # 2024-2026 federal brackets, FICA & 50-state tax rules
│   ├── tax-engine.js        # Deterministic tax calculation engine
│   └── app.js               # UI controller, 3D pie visualizer & events
├── scripts/
│   ├── states.json          # State metadata registry
│   ├── template.html        # Clean state page HTML template
│   ├── build-states.js      # Generates all 51 state pages with benchmark tables
│   ├── build-sitemap.js     # Generates XML sitemap
│   ├── verify-all.js        # 37-point unit and regression test suite
│   └── prod-check.js        # Production metadata and anchor audit
├── server.js                # Lightweight local development HTTP server
├── robots.txt               # Crawler directives & sitemap location
└── sitemap.xml              # Search engine index with 56 URLs
```

---

## 🚀 Development & Testing

### Run Local Development Server
```bash
node server.js
# Serves at: http://localhost:3000/
```

### Run Test Suite & Verification Audit
```bash
node scripts/verify-all.js
node scripts/prod-check.js
```

### Rebuild State Pages & Sitemap
```bash
node scripts/build-states.js
node scripts/build-sitemap.js
```

---

## 📜 License

MIT License. Designed and maintained for fast, transparent, and private personal finance calculations.
