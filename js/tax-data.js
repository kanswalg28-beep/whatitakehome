const TaxData = {
  activeYear: "2026",
  stateDataNote: "Federal income tax, FICA wage caps, and state schedules reflect 2026 statutory rates (including 2026 flat-tax transitions). Local rules and state credits are approximations.",
  years: {
    "2026": {
      name: "2026 (Current Tax Year)",
      irsNotice: "IRS Rev. Proc. 2025-32 · SSA 2026 wage base",
      retirement401kMax: 24500,
      standardDeduction: { single: 16100, married: 32200, hoh: 24150 },
      brackets: {
        single: [
          { rate: 0.10, upTo: 12400 },
          { rate: 0.12, upTo: 50400 },
          { rate: 0.22, upTo: 105700 },
          { rate: 0.24, upTo: 201775 },
          { rate: 0.32, upTo: 256225 },
          { rate: 0.35, upTo: 640600 },
          { rate: 0.37, upTo: Infinity }
        ],
        married: [
          { rate: 0.10, upTo: 24800 },
          { rate: 0.12, upTo: 100800 },
          { rate: 0.22, upTo: 211400 },
          { rate: 0.24, upTo: 403550 },
          { rate: 0.32, upTo: 512450 },
          { rate: 0.35, upTo: 768700 },
          { rate: 0.37, upTo: Infinity }
        ],
        hoh: [
          { rate: 0.10, upTo: 17700 },
          { rate: 0.12, upTo: 67450 },
          { rate: 0.22, upTo: 105700 },
          { rate: 0.24, upTo: 201775 },
          { rate: 0.32, upTo: 256200 },
          { rate: 0.35, upTo: 640600 },
          { rate: 0.37, upTo: Infinity }
        ]
      },
      fica: {
        socialSecurity: { rate: 0.062, limit: 184500 },
        medicare: { rate: 0.0145, limit: Infinity },
        additionalMedicare: { rate: 0.009, threshold: { single: 200000, married: 250000, hoh: 200000 } }
      }
    },
    "2025": {
      name: "2025 (Prior Year)",
      irsNotice: "IRS Rev. Proc. 2024-40, as amended by the One Big Beautiful Bill Act (standard deduction)",
      retirement401kMax: 23500,
      standardDeduction: { single: 15750, married: 31500, hoh: 23625 },
      brackets: {
        single: [
          { rate: 0.10, upTo: 11925 },
          { rate: 0.12, upTo: 48475 },
          { rate: 0.22, upTo: 103350 },
          { rate: 0.24, upTo: 197300 },
          { rate: 0.32, upTo: 250525 },
          { rate: 0.35, upTo: 626350 },
          { rate: 0.37, upTo: Infinity }
        ],
        married: [
          { rate: 0.10, upTo: 23850 },
          { rate: 0.12, upTo: 96950 },
          { rate: 0.22, upTo: 206700 },
          { rate: 0.24, upTo: 394600 },
          { rate: 0.32, upTo: 501050 },
          { rate: 0.35, upTo: 751600 },
          { rate: 0.37, upTo: Infinity }
        ],
        hoh: [
          { rate: 0.10, upTo: 17000 },
          { rate: 0.12, upTo: 64850 },
          { rate: 0.22, upTo: 103350 },
          { rate: 0.24, upTo: 197300 },
          { rate: 0.32, upTo: 250500 },
          { rate: 0.35, upTo: 626350 },
          { rate: 0.37, upTo: Infinity }
        ]
      },
      fica: {
        socialSecurity: { rate: 0.062, limit: 176100 },
        medicare: { rate: 0.0145, limit: Infinity },
        additionalMedicare: { rate: 0.009, threshold: { single: 200000, married: 250000, hoh: 200000 } }
      }
    },
    "2024": {
      name: "2024 (Two Years Ago)",
      irsNotice: "IRS Rev. Proc. 2023-34 · Form 1040 & Pub 15-T",
      retirement401kMax: 23000,
      standardDeduction: { single: 14600, married: 29200, hoh: 21900 },
      brackets: {
        single: [
          { rate: 0.10, upTo: 11600 },
          { rate: 0.12, upTo: 47150 },
          { rate: 0.22, upTo: 100525 },
          { rate: 0.24, upTo: 191950 },
          { rate: 0.32, upTo: 243725 },
          { rate: 0.35, upTo: 609350 },
          { rate: 0.37, upTo: Infinity }
        ],
        married: [
          { rate: 0.10, upTo: 23200 },
          { rate: 0.12, upTo: 94300 },
          { rate: 0.22, upTo: 201050 },
          { rate: 0.24, upTo: 383900 },
          { rate: 0.32, upTo: 487450 },
          { rate: 0.35, upTo: 731200 },
          { rate: 0.37, upTo: Infinity }
        ],
        hoh: [
          { rate: 0.10, upTo: 16550 },
          { rate: 0.12, upTo: 63100 },
          { rate: 0.22, upTo: 100500 },
          { rate: 0.24, upTo: 191950 },
          { rate: 0.32, upTo: 243700 },
          { rate: 0.35, upTo: 609350 },
          { rate: 0.37, upTo: Infinity }
        ]
      },
      fica: {
        socialSecurity: { rate: 0.062, limit: 168600 },
        medicare: { rate: 0.0145, limit: Infinity },
        additionalMedicare: { rate: 0.009, threshold: { single: 200000, married: 250000, hoh: 200000 } }
      }
    }
  },
  get federal() {
    return this.years[this.activeYear || "2026"];
  },
  get year() {
    return parseInt(this.activeYear || "2026", 10);
  },
  states: {
    // Zero Income Tax States
    "AK": { type: "none", name: "Alaska" },
    "FL": { type: "none", name: "Florida" },
    "NV": { type: "none", name: "Nevada" },
    "NH": { type: "none", name: "New Hampshire" },
    "SD": { type: "none", name: "South Dakota" },
    "TN": { type: "none", name: "Tennessee" },
    "TX": { type: "none", name: "Texas" },
    "WA": { type: "none", name: "Washington" },
    "WY": { type: "none", name: "Wyoming" },

    // Flat-Rate Income Tax States (with 2026 rates & standard deductions/exemptions)
    "AZ": { type: "flat", rate: 0.025, name: "Arizona", stdDed: { single: 16100, married: 32200 } },
    "CO": { type: "flat", rate: 0.044, name: "Colorado", stdDed: { single: 16100, married: 32200 } },
    "GA": { type: "flat", rate: 0.0509, name: "Georgia", stdDed: { single: 12000, married: 24000 } },
    "ID": { type: "flat", rate: 0.053, name: "Idaho", stdDed: { single: 16100, married: 32200 } },
    "IL": { type: "flat", rate: 0.0495, name: "Illinois", stdDed: { single: 2775, married: 5550 } },
    "IN": { type: "flat", rate: 0.0295, name: "Indiana", stdDed: { single: 1000, married: 2000 } },
    "IA": { type: "flat", rate: 0.038, name: "Iowa", stdDed: { single: 16100, married: 32200 } },
    "KY": { type: "flat", rate: 0.035, name: "Kentucky", stdDed: { single: 3270, married: 6540 } },
    "LA": { type: "flat", rate: 0.03, name: "Louisiana", stdDed: { single: 12500, married: 25000 } },
    "MA": { type: "flat", rate: 0.05, name: "Massachusetts", stdDed: { single: 4400, married: 8800 } },
    "MI": { type: "flat", rate: 0.0425, name: "Michigan", stdDed: { single: 5600, married: 11200 } },
    "MS": { type: "flat", rate: 0.04, name: "Mississippi", stdDed: { single: 12300, married: 14600 } },
    "NC": { type: "flat", rate: 0.0399, name: "North Carolina", stdDed: { single: 12750, married: 25500 } },
    "PA": { type: "flat", rate: 0.0307, name: "Pennsylvania", stdDed: { single: 0, married: 0 } },
    "UT": { type: "flat", rate: 0.0455, name: "Utah", stdDed: { single: 0, married: 0 } },

    // Progressive Income Tax States
    "CA": {
      type: "progressive", name: "California", stdDed: { single: 5540, married: 11080 },
      brackets: {
        single: [{ rate: 0.01, upTo: 10756 }, { rate: 0.02, upTo: 25499 }, { rate: 0.04, upTo: 40245 }, { rate: 0.06, upTo: 55866 }, { rate: 0.08, upTo: 70606 }, { rate: 0.093, upTo: 360659 }, { rate: 0.103, upTo: 432787 }, { rate: 0.113, upTo: 721314 }, { rate: 0.123, upTo: 1000000 }, { rate: 0.133, upTo: Infinity }],
        married: [{ rate: 0.01, upTo: 21512 }, { rate: 0.02, upTo: 50998 }, { rate: 0.04, upTo: 80490 }, { rate: 0.06, upTo: 111732 }, { rate: 0.08, upTo: 141212 }, { rate: 0.093, upTo: 721318 }, { rate: 0.103, upTo: 865574 }, { rate: 0.113, upTo: 1442628 }, { rate: 0.123, upTo: 2000000 }, { rate: 0.133, upTo: Infinity }]
      }
    },
    "NY": {
      type: "progressive", name: "New York", stdDed: { single: 8000, married: 16050 },
      locals: {
        "NYC": {
          type: "progressive", name: "New York City",
          brackets: {
            single: [{ rate: 0.03078, upTo: 12000 }, { rate: 0.03762, upTo: 25000 }, { rate: 0.03819, upTo: 50000 }, { rate: 0.03876, upTo: Infinity }],
            married: [{ rate: 0.03078, upTo: 21600 }, { rate: 0.03762, upTo: 45000 }, { rate: 0.03819, upTo: 90000 }, { rate: 0.03876, upTo: Infinity }]
          }
        },
        "YONKERS": { type: "surcharge", rate: 0.1675, name: "Yonkers (16.75% Surcharge)" }
      },
      brackets: {
        single: [{ rate: 0.04, upTo: 8500 }, { rate: 0.045, upTo: 11700 }, { rate: 0.0525, upTo: 13900 }, { rate: 0.055, upTo: 80650 }, { rate: 0.06, upTo: 215400 }, { rate: 0.0685, upTo: 1077550 }, { rate: 0.0965, upTo: 5000000 }, { rate: 0.103, upTo: 25000000 }, { rate: 0.109, upTo: Infinity }],
        married: [{ rate: 0.04, upTo: 17150 }, { rate: 0.045, upTo: 23600 }, { rate: 0.0525, upTo: 27900 }, { rate: 0.055, upTo: 161550 }, { rate: 0.06, upTo: 323200 }, { rate: 0.0685, upTo: 2155350 }, { rate: 0.0965, upTo: 5000000 }, { rate: 0.103, upTo: 25000000 }, { rate: 0.109, upTo: Infinity }]
      }
    },
    "NJ": { type: "progressive", name: "New Jersey", stdDed: { single: 1000, married: 2000 }, brackets: { single: [{ rate: 0.014, upTo: 20000 }, { rate: 0.0175, upTo: 35000 }, { rate: 0.035, upTo: 40000 }, { rate: 0.05525, upTo: 75000 }, { rate: 0.0637, upTo: 500000 }, { rate: 0.0897, upTo: 1000000 }, { rate: 0.1075, upTo: Infinity }], married: [{ rate: 0.014, upTo: 20000 }, { rate: 0.0175, upTo: 50000 }, { rate: 0.0245, upTo: 70000 }, { rate: 0.035, upTo: 80000 }, { rate: 0.05525, upTo: 150000 }, { rate: 0.0637, upTo: 500000 }, { rate: 0.0897, upTo: 1000000 }, { rate: 0.1075, upTo: Infinity }] } },
    "HI": { type: "progressive", name: "Hawaii", stdDed: { single: 4400, married: 8800 }, brackets: { single: [{ rate: 0.014, upTo: 9600 }, { rate: 0.032, upTo: 14400 }, { rate: 0.055, upTo: 19200 }, { rate: 0.064, upTo: 24000 }, { rate: 0.068, upTo: 36000 }, { rate: 0.072, upTo: 48000 }, { rate: 0.076, upTo: 125000 }, { rate: 0.079, upTo: 175000 }, { rate: 0.0825, upTo: 225000 }, { rate: 0.09, upTo: 275000 }, { rate: 0.10, upTo: 325000 }, { rate: 0.11, upTo: Infinity }], married: [{ rate: 0.014, upTo: 19200 }, { rate: 0.032, upTo: 28800 }, { rate: 0.055, upTo: 38400 }, { rate: 0.064, upTo: 48000 }, { rate: 0.068, upTo: 72000 }, { rate: 0.072, upTo: 96000 }, { rate: 0.076, upTo: 250000 }, { rate: 0.079, upTo: 350000 }, { rate: 0.0825, upTo: 450000 }, { rate: 0.09, upTo: 550000 }, { rate: 0.10, upTo: 650000 }, { rate: 0.11, upTo: Infinity }] } },
    "OR": { type: "progressive", name: "Oregon", stdDed: { single: 2745, married: 5495 }, brackets: { single: [{ rate: 0.0475, upTo: 4300 }, { rate: 0.0675, upTo: 10750 }, { rate: 0.0875, upTo: 125000 }, { rate: 0.099, upTo: Infinity }], married: [{ rate: 0.0475, upTo: 8600 }, { rate: 0.0675, upTo: 21500 }, { rate: 0.0875, upTo: 250000 }, { rate: 0.099, upTo: Infinity }] } },
    "MN": { type: "progressive", name: "Minnesota", stdDed: { single: 14575, married: 29150 }, brackets: { single: [{ rate: 0.0535, upTo: 31690 }, { rate: 0.068, upTo: 104090 }, { rate: 0.0785, upTo: 193240 }, { rate: 0.0985, upTo: Infinity }], married: [{ rate: 0.0535, upTo: 46330 }, { rate: 0.068, upTo: 184040 }, { rate: 0.0785, upTo: 321450 }, { rate: 0.0985, upTo: Infinity }] } },
    "WI": { type: "progressive", name: "Wisconsin", stdDed: { single: 13230, married: 24490 }, brackets: { single: [{ rate: 0.035, upTo: 14320 }, { rate: 0.044, upTo: 28640 }, { rate: 0.053, upTo: 315310 }, { rate: 0.0765, upTo: Infinity }], married: [{ rate: 0.035, upTo: 19090 }, { rate: 0.044, upTo: 38190 }, { rate: 0.053, upTo: 420420 }, { rate: 0.0765, upTo: Infinity }] } },
    "AL": { type: "progressive", name: "Alabama", stdDed: { single: 3000, married: 8500 }, brackets: { single: [{ rate: 0.02, upTo: 500 }, { rate: 0.04, upTo: 3000 }, { rate: 0.05, upTo: Infinity }], married: [{ rate: 0.02, upTo: 1000 }, { rate: 0.04, upTo: 6000 }, { rate: 0.05, upTo: Infinity }] } },
    "AR": { type: "progressive", name: "Arkansas", stdDed: { single: 2340, married: 4680 }, brackets: { single: [{ rate: 0.02, upTo: 4400 }, { rate: 0.039, upTo: Infinity }], married: [{ rate: 0.02, upTo: 8800 }, { rate: 0.039, upTo: Infinity }] } },
    "CT": { type: "progressive", name: "Connecticut", stdDed: { single: 15000, married: 24000 }, brackets: { single: [{ rate: 0.02, upTo: 10000 }, { rate: 0.045, upTo: 50000 }, { rate: 0.055, upTo: 100000 }, { rate: 0.06, upTo: 200000 }, { rate: 0.065, upTo: 250000 }, { rate: 0.069, upTo: 500000 }, { rate: 0.0699, upTo: Infinity }], married: [{ rate: 0.02, upTo: 20000 }, { rate: 0.045, upTo: 100000 }, { rate: 0.055, upTo: 200000 }, { rate: 0.06, upTo: 400000 }, { rate: 0.065, upTo: 500000 }, { rate: 0.069, upTo: 1000000 }, { rate: 0.0699, upTo: Infinity }] } },
    "DE": { type: "progressive", name: "Delaware", stdDed: { single: 3250, married: 6500 }, brackets: { single: [{ rate: 0.022, upTo: 5000 }, { rate: 0.039, upTo: 10000 }, { rate: 0.048, upTo: 20000 }, { rate: 0.052, upTo: 25000 }, { rate: 0.0555, upTo: 60000 }, { rate: 0.066, upTo: Infinity }], married: [{ rate: 0.022, upTo: 5000 }, { rate: 0.039, upTo: 10000 }, { rate: 0.048, upTo: 20000 }, { rate: 0.052, upTo: 25000 }, { rate: 0.0555, upTo: 60000 }, { rate: 0.066, upTo: Infinity }] } },
    "KS": { type: "progressive", name: "Kansas", stdDed: { single: 3605, married: 8240 }, brackets: { single: [{ rate: 0.052, upTo: 23000 }, { rate: 0.0558, upTo: Infinity }], married: [{ rate: 0.052, upTo: 46000 }, { rate: 0.0558, upTo: Infinity }] } },
    "ME": { type: "progressive", name: "Maine", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.058, upTo: 26050 }, { rate: 0.0675, upTo: 61600 }, { rate: 0.0715, upTo: Infinity }], married: [{ rate: 0.058, upTo: 52100 }, { rate: 0.0675, upTo: 123250 }, { rate: 0.0715, upTo: Infinity }] } },
    "MD": { type: "progressive", name: "Maryland", stdDed: { single: 2550, married: 5150 }, brackets: { single: [{ rate: 0.02, upTo: 1000 }, { rate: 0.03, upTo: 2000 }, { rate: 0.04, upTo: 3000 }, { rate: 0.0475, upTo: 100000 }, { rate: 0.05, upTo: 125000 }, { rate: 0.0525, upTo: 150000 }, { rate: 0.055, upTo: 250000 }, { rate: 0.0575, upTo: Infinity }], married: [{ rate: 0.02, upTo: 1000 }, { rate: 0.03, upTo: 2000 }, { rate: 0.04, upTo: 3000 }, { rate: 0.0475, upTo: 150000 }, { rate: 0.05, upTo: 175000 }, { rate: 0.0525, upTo: 225000 }, { rate: 0.055, upTo: 300000 }, { rate: 0.0575, upTo: Infinity }] } },
    "MO": { type: "progressive", name: "Missouri", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.0, upTo: 1273 }, { rate: 0.02, upTo: 2546 }, { rate: 0.025, upTo: 3819 }, { rate: 0.03, upTo: 5092 }, { rate: 0.035, upTo: 6365 }, { rate: 0.04, upTo: 7638 }, { rate: 0.045, upTo: 8911 }, { rate: 0.047, upTo: Infinity }], married: [{ rate: 0.0, upTo: 1273 }, { rate: 0.02, upTo: 2546 }, { rate: 0.025, upTo: 3819 }, { rate: 0.03, upTo: 5092 }, { rate: 0.035, upTo: 6365 }, { rate: 0.04, upTo: 7638 }, { rate: 0.045, upTo: 8911 }, { rate: 0.047, upTo: Infinity }] } },
    "MT": { type: "progressive", name: "Montana", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.047, upTo: 21100 }, { rate: 0.0565, upTo: Infinity }], married: [{ rate: 0.047, upTo: 42200 }, { rate: 0.0565, upTo: Infinity }] } },
    "NE": { type: "progressive", name: "Nebraska", stdDed: { single: 8350, married: 16700 }, brackets: { single: [{ rate: 0.0246, upTo: 4030 }, { rate: 0.0351, upTo: 24120 }, { rate: 0.0455, upTo: Infinity }], married: [{ rate: 0.0246, upTo: 8060 }, { rate: 0.0351, upTo: 48240 }, { rate: 0.0455, upTo: Infinity }] } },
    "NM": { type: "progressive", name: "New Mexico", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.015, upTo: 5500 }, { rate: 0.032, upTo: 16500 }, { rate: 0.043, upTo: 33500 }, { rate: 0.047, upTo: 66500 }, { rate: 0.049, upTo: 210000 }, { rate: 0.059, upTo: Infinity }], married: [{ rate: 0.015, upTo: 8000 }, { rate: 0.032, upTo: 25000 }, { rate: 0.043, upTo: 50000 }, { rate: 0.047, upTo: 100000 }, { rate: 0.049, upTo: 315000 }, { rate: 0.059, upTo: Infinity }] } },
    "ND": { type: "progressive", name: "North Dakota", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.0, upTo: 47150 }, { rate: 0.0195, upTo: 238200 }, { rate: 0.025, upTo: Infinity }], married: [{ rate: 0.0, upTo: 78775 }, { rate: 0.0195, upTo: 290450 }, { rate: 0.025, upTo: Infinity }] } },
    "OH": { type: "progressive", name: "Ohio", stdDed: { single: 0, married: 0 }, brackets: { single: [{ rate: 0.0, upTo: 26050 }, { rate: 0.0275, upTo: Infinity }], married: [{ rate: 0.0, upTo: 26050 }, { rate: 0.0275, upTo: Infinity }] } },
    "OK": { type: "progressive", name: "Oklahoma", stdDed: { single: 6350, married: 12700 }, brackets: { single: [{ rate: 0.0025, upTo: 1000 }, { rate: 0.0075, upTo: 2500 }, { rate: 0.0175, upTo: 3750 }, { rate: 0.0275, upTo: 4900 }, { rate: 0.0375, upTo: 7200 }, { rate: 0.045, upTo: Infinity }], married: [{ rate: 0.0025, upTo: 2000 }, { rate: 0.0075, upTo: 5000 }, { rate: 0.0175, upTo: 7500 }, { rate: 0.0275, upTo: 9800 }, { rate: 0.0375, upTo: 12200 }, { rate: 0.045, upTo: Infinity }] } },
    "RI": { type: "progressive", name: "Rhode Island", stdDed: { single: 10550, married: 21150 }, brackets: { single: [{ rate: 0.0375, upTo: 77450 }, { rate: 0.0475, upTo: 176050 }, { rate: 0.0599, upTo: Infinity }], married: [{ rate: 0.0375, upTo: 77450 }, { rate: 0.0475, upTo: 176050 }, { rate: 0.0599, upTo: Infinity }] } },
    "SC": { type: "progressive", name: "South Carolina", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.0, upTo: 3460 }, { rate: 0.03, upTo: 17330 }, { rate: 0.062, upTo: Infinity }], married: [{ rate: 0.0, upTo: 3460 }, { rate: 0.03, upTo: 17330 }, { rate: 0.062, upTo: Infinity }] } },
    "VT": { type: "progressive", name: "Vermont", stdDed: { single: 7400, married: 14850 }, brackets: { single: [{ rate: 0.0335, upTo: 47900 }, { rate: 0.066, upTo: 116000 }, { rate: 0.076, upTo: 242000 }, { rate: 0.0875, upTo: Infinity }], married: [{ rate: 0.0335, upTo: 79950 }, { rate: 0.066, upTo: 193300 }, { rate: 0.076, upTo: 294600 }, { rate: 0.0875, upTo: Infinity }] } },
    "VA": { type: "progressive", name: "Virginia", stdDed: { single: 8500, married: 17000 }, brackets: { single: [{ rate: 0.02, upTo: 3000 }, { rate: 0.03, upTo: 5000 }, { rate: 0.05, upTo: 17000 }, { rate: 0.0575, upTo: Infinity }], married: [{ rate: 0.02, upTo: 3000 }, { rate: 0.03, upTo: 5000 }, { rate: 0.05, upTo: 17000 }, { rate: 0.0575, upTo: Infinity }] } },
    "WV": { type: "progressive", name: "West Virginia", stdDed: { single: 2000, married: 4000 }, brackets: { single: [{ rate: 0.0222, upTo: 10000 }, { rate: 0.0296, upTo: 25000 }, { rate: 0.0333, upTo: 40000 }, { rate: 0.0444, upTo: 60000 }, { rate: 0.0482, upTo: Infinity }], married: [{ rate: 0.0222, upTo: 10000 }, { rate: 0.0296, upTo: 25000 }, { rate: 0.0333, upTo: 40000 }, { rate: 0.0444, upTo: 60000 }, { rate: 0.0482, upTo: Infinity }] } },
    "DC": { type: "progressive", name: "District of Columbia", stdDed: { single: 16100, married: 32200 }, brackets: { single: [{ rate: 0.04, upTo: 10000 }, { rate: 0.06, upTo: 40000 }, { rate: 0.065, upTo: 60000 }, { rate: 0.085, upTo: 250000 }, { rate: 0.0925, upTo: 500000 }, { rate: 0.0975, upTo: 1000000 }, { rate: 0.1075, upTo: Infinity }], married: [{ rate: 0.04, upTo: 10000 }, { rate: 0.06, upTo: 40000 }, { rate: 0.065, upTo: 60000 }, { rate: 0.085, upTo: 250000 }, { rate: 0.0925, upTo: 500000 }, { rate: 0.0975, upTo: 1000000 }, { rate: 0.1075, upTo: Infinity }] } }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaxData;
}