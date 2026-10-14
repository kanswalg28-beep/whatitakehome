class TaxEngine {
  constructor(data) {
    this.data = data;
  }

  calculate(grossIncome, filingStatus, stateCode, localCode = 'none', preTaxDeductions = { retirement: 0, health: 0 }, taxYear = null) {
    grossIncome = Math.max(0, Number(grossIncome) || 0);
    taxYear = String(taxYear || this.data.activeYear || '2026');

    // Resolve active tax year parameters (Rev. Proc. 2025-32 for 2026, 2024-40 for 2025, 2023-34 for 2024)
    const fedData = (this.data.years && this.data.years[taxYear])
      ? this.data.years[taxYear]
      : this.data.federal;

    const rawHealth = Math.max(0, Number(preTaxDeductions.health) || 0);
    const rawRetirement = Math.max(0, Number(preTaxDeductions.retirement) || 0);
    const clampedHealth = Math.min(grossIncome, rawHealth);
    const clampedRetirement = Math.min(Math.max(0, grossIncome - clampedHealth), rawRetirement);
    const totalPreTax = clampedHealth + clampedRetirement;
    const agi = Math.max(0, grossIncome - totalPreTax);

    const federalStandardDeduction = fedData.standardDeduction[filingStatus] ?? fedData.standardDeduction.single;
    // States in this dataset publish single/married schedules; Head of Household uses the single schedule (approximation).
    const stateFiling = filingStatus === 'married' ? 'married' : 'single';
    const taxableFederalIncome = Math.max(0, agi - federalStandardDeduction);

    // 1. Calculate Federal Tax & Bracket-by-Bracket telemetry
    const federalBrackets = fedData.brackets[filingStatus] || [];
    let federalTax = 0;
    let previousLimit = 0;
    let marginalFederalRate = 0;
    const bracketBreakdown = [];

    for (let i = 0; i < federalBrackets.length; i++) {
      const b = federalBrackets[i];
      let taxableAmountInBracket = 0;
      let taxInBracket = 0;
      if (taxableFederalIncome > previousLimit) {
        taxableAmountInBracket = Math.min(taxableFederalIncome, b.upTo) - previousLimit;
        taxInBracket = taxableAmountInBracket * b.rate;
        federalTax += taxInBracket;
      }
      // Next-dollar marginal rate: if AGI exceeds standard deduction and lands on/above previousLimit
      if (agi >= federalStandardDeduction && taxableFederalIncome >= previousLimit) {
        marginalFederalRate = b.rate;
      }
      const isCurrent = taxableFederalIncome > 0
        ? (taxableFederalIncome > previousLimit && (taxableFederalIncome <= b.upTo || i === federalBrackets.length - 1))
        : (i === 0 && agi >= federalStandardDeduction);

      bracketBreakdown.push({
        rate: b.rate,
        from: previousLimit,
        to: b.upTo,
        taxableAmount: taxableAmountInBracket,
        taxPaid: taxInBracket,
        active: taxableAmountInBracket > 0,
        isCurrent
      });
      previousLimit = b.upTo;
    }

    // 2. Calculate FICA
    // Health premiums are Section 125 pre-tax (exempt from FICA); 401(k) is subject to FICA.
    const ficaBase = Math.max(0, grossIncome - clampedHealth);

    // Social Security (capped at statutory wage base limit)
    const ssSubject = Math.min(ficaBase, fedData.fica.socialSecurity.limit);
    const socialSecurityTax = ssSubject * fedData.fica.socialSecurity.rate;

    // Medicare (uncapped 1.45%)
    const medicareTax = ficaBase * fedData.fica.medicare.rate;

    // Additional Medicare (+0.9% over threshold)
    let additionalMedicareTax = 0;
    const addMedThreshold = fedData.fica.additionalMedicare.threshold[filingStatus] ?? 200000;
    if (ficaBase > addMedThreshold) {
      additionalMedicareTax = (ficaBase - addMedThreshold) * fedData.fica.additionalMedicare.rate;
    }
    const totalFica = socialSecurityTax + medicareTax + additionalMedicareTax;

    // 3. Calculate State & Local Tax
    let stateTax = 0;
    let localTax = 0;
    let marginalStateRate = 0;
    const stateData = this.data.states[stateCode];

    if (stateData) {
      const stateStdDed = stateData.stdDed ? (stateData.stdDed[stateFiling] || 0) : 0;
      const stateTaxable = Math.max(0, agi - stateStdDed);

      if (stateData.type === 'flat') {
        stateTax = stateTaxable * stateData.rate;
        if (agi >= stateStdDed && grossIncome > 0) {
          marginalStateRate = stateData.rate;
        }
      } else if (stateData.type === 'progressive') {
        const stateBrackets = stateData.brackets ? stateData.brackets[stateFiling] : [];
        let statePrevLimit = 0;
        for (let i = 0; i < (stateBrackets || []).length; i++) {
          const b = stateBrackets[i];
          if (stateTaxable > statePrevLimit) {
            const taxableInBracket = Math.min(stateTaxable, b.upTo) - statePrevLimit;
            stateTax += taxableInBracket * b.rate;
          }
          if (agi >= stateStdDed && stateTaxable >= statePrevLimit && grossIncome > 0) {
            marginalStateRate = b.rate;
          }
          statePrevLimit = b.upTo;
        }
      }

      // Local Surcharge (NYC progressive, Yonkers % of state tax, or flat local)
      if (localCode && localCode !== 'none' && stateData.locals && stateData.locals[localCode]) {
        const localData = stateData.locals[localCode];
        if (localData.type === 'surcharge') {
          localTax = stateTax * localData.rate;
          marginalStateRate += marginalStateRate * localData.rate;
        } else if (localData.type === 'flat') {
          localTax = stateTaxable * localData.rate;
          if (agi >= stateStdDed && grossIncome > 0) {
            marginalStateRate += localData.rate;
          }
        } else if (localData.type === 'progressive') {
          const localBrackets = localData.brackets ? localData.brackets[stateFiling] : [];
          let localPrevLimit = 0;
          let marginalLocalRate = 0;
          for (let i = 0; i < (localBrackets || []).length; i++) {
            const b = localBrackets[i];
            if (stateTaxable > localPrevLimit) {
              const taxableInBracket = Math.min(stateTaxable, b.upTo) - localPrevLimit;
              localTax += taxableInBracket * b.rate;
            }
            if (agi >= stateStdDed && stateTaxable >= localPrevLimit && grossIncome > 0) {
              marginalLocalRate = b.rate;
            }
            localPrevLimit = b.upTo;
          }
          marginalStateRate += marginalLocalRate;
        }
      }
    }

    const totalTax = federalTax + totalFica + stateTax + localTax;
    const takeHome = Math.max(0, grossIncome - totalTax - totalPreTax);

    const marginalFicaRate = grossIncome > 0
      ? (fedData.fica.medicare.rate
        + (ficaBase < fedData.fica.socialSecurity.limit ? fedData.fica.socialSecurity.rate : 0)
        + (ficaBase >= addMedThreshold ? fedData.fica.additionalMedicare.rate : 0))
      : 0;

    return {
      grossIncome,
      taxYear,
      irsNotice: fedData.irsNotice,
      retirement401kMax: fedData.retirement401kMax,
      totalPreTax,
      agi,
      federalStandardDeduction,
      taxableFederalIncome,
      federalTax,
      totalFica,
      socialSecurityTax,
      medicareTax: medicareTax + additionalMedicareTax,
      stateTax,
      localTax,
      totalTax,
      takeHome,
      effectiveTaxRate: grossIncome > 0 ? (totalTax / grossIncome) : 0,
      marginalTaxRate: grossIncome > 0 ? (marginalFederalRate + marginalStateRate + marginalFicaRate) : 0,
      federalBrackets,
      bracketBreakdown,
      marginalFederalRate,
      marginalStateRate
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TaxEngine;
}