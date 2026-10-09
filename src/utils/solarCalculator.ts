import { CITIES, CURRENCIES, PANEL_OPTIONS, ROOF_TYPES } from '../constants/solarData';
import { MonthGenerationDetail, NasaMonthlyData, SolarCalculationResults, SolarInputs, YearProjection } from '../types/solar';

const MONTH_KEYS: (keyof NasaMonthlyData)[] = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_IN_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function calculateSolarSystem(inputs: SolarInputs): SolarCalculationResults {
  const currency = CURRENCIES[inputs.currencyCode] || CURRENCIES.USD;
  const effectiveTariff = currency.defaultRatesPerKwh[inputs.sector];

  // 1. Consumption calculation
  let monthlyConsumptionKwh = 0;
  let monthlyCurrentBill = 0;

  if (inputs.calculationMode === 'bill') {
    monthlyCurrentBill = Math.max(10, inputs.billAmount);
    monthlyConsumptionKwh = monthlyCurrentBill / effectiveTariff;
  } else {
    monthlyConsumptionKwh = Math.max(20, inputs.monthlyKwh);
    monthlyCurrentBill = monthlyConsumptionKwh * effectiveTariff;
  }

  // 2. Solar Radiation from NASA POWER (Prediction Of Worldwide Energy Resources)
  const selectedCity = CITIES.find((c) => c.id === inputs.cityId) || CITIES[0];
  const nasa = inputs.nasaPowerData;

  const annualNasaHsp = nasa?.irradianceGhi?.ANN ?? selectedCity.hsp;
  const monthlyHspList = nasa?.irradianceGhi
    ? MONTH_KEYS.map((k) => nasa.irradianceGhi[k])
    : Array(12).fill(annualNasaHsp);

  const worstMonthHsp = Number(Math.min(...monthlyHspList).toFixed(2));
  const bestMonthHsp = Number(Math.max(...monthlyHspList).toFixed(2));

  // Determine effective HSP based on user's sizing basis or manual override
  let effectiveHsp = annualNasaHsp;
  if (inputs.customHsp && inputs.customHsp > 0) {
    effectiveHsp = inputs.customHsp;
  } else if (inputs.sizingBasis === 'worst_month') {
    effectiveHsp = worstMonthHsp;
  } else if (inputs.sizingBasis === 'best_month') {
    effectiveHsp = bestMonthHsp;
  }

  // 3. Performance Ratio & Thermal Derating using NASA POWER 2-Meter Temperature (T2M)
  const avgTempC = nasa?.temperatureC?.ANN ?? 18.5;
  // NOCT cell heating offset approx 22°C above ambient under operative solar irradiation
  const operativeCellTemp = avgTempC + 22;
  const thermalDeratingFraction = Math.max(0, (operativeCellTemp - 25) * 0.0035); // 0.35% / °C loss above 25°C STC
  const basePr = 0.83; // inverter 98%, cables 2%, dust/soiling 3%, mismatch 2%
  const effectivePr = Number((basePr * (1 - thermalDeratingFraction)).toFixed(2));

  // 4. System Sizing
  const coverageFraction = Math.min(1, Math.max(0.2, inputs.targetCoveragePct / 100));
  const targetMonthlyOffsetKwh = monthlyConsumptionKwh * coverageFraction;
  const dailyTargetKwh = targetMonthlyOffsetKwh / 30;

  // Power required in kWp = Daily Target kWh / (Effective HSP * Effective PR)
  const recommendedKwp = Number((dailyTargetKwh / (effectiveHsp * effectivePr)).toFixed(2));

  // Panel counts
  const panelWattageKw = inputs.panelWattage / 1000;
  const panelCount = Math.max(1, Math.ceil(recommendedKwp / panelWattageKw));
  const actualInstalledKwp = Number((panelCount * panelWattageKw).toFixed(2));

  // 5. NASA Monthly Generation Breakdown
  const monthlyDetails: MonthGenerationDetail[] = MONTH_KEYS.map((key, idx) => {
    const monthHsp = nasa?.irradianceGhi ? nasa.irradianceGhi[key] : effectiveHsp;
    const monthTemp = nasa?.temperatureC ? nasa.temperatureC[key] : avgTempC;
    const monthThermalLoss = Math.max(0, (monthTemp + 22 - 25) * 0.0035);
    const monthPr = basePr * (1 - monthThermalLoss);

    const days = DAYS_IN_MONTH[idx];
    const genKwh = Math.round(actualInstalledKwp * monthHsp * monthPr * days);
    const savings = Math.round(Math.min(genKwh, monthlyConsumptionKwh) * effectiveTariff);

    return {
      monthKey: key,
      monthName: MONTH_NAMES[idx],
      nasaHsp: Number(monthHsp.toFixed(2)),
      nasaTempC: Number(monthTemp.toFixed(1)),
      generationKwh: genKwh,
      savingsMoney: savings,
    };
  });

  const annualGenerationKwh = monthlyDetails.reduce((acc, m) => acc + m.generationKwh, 0);
  const monthlyGenerationKwh = Math.round(annualGenerationKwh / 12);

  // 6. Roof Space Required
  const panelSpec = PANEL_OPTIONS.find((p) => p.wattage === inputs.panelWattage) || PANEL_OPTIONS[1];
  const roofAreaRequiredM2 = Math.round(panelCount * panelSpec.areaPerPanel);

  // 7. Savings & Financials
  const utilityFixedFeePct = 0.06;
  const offsetPotential = Math.min(monthlyGenerationKwh, monthlyConsumptionKwh);
  const rawMonthlySavings = offsetPotential * effectiveTariff;

  const newEstimatedMonthlyBill = Math.max(
    monthlyCurrentBill * utilityFixedFeePct,
    monthlyCurrentBill - rawMonthlySavings
  );
  const monthlySavingsAmount = Math.max(0, monthlyCurrentBill - newEstimatedMonthlyBill);
  const savingsPercentage = Math.round((monthlySavingsAmount / monthlyCurrentBill) * 100);
  const annualSavingsAmount = monthlySavingsAmount * 12;

  // 8. Capital Cost & ROI
  const baseCostPerKwpUsd = inputs.systemType === 'hybrid' ? 1650 : 1120;
  const roofConfig = ROOF_TYPES.find((r) => r.id === inputs.roofType) || ROOF_TYPES[0];
  const roofFactor = roofConfig.factorCost;

  const scaleFactor = Math.max(0.85, 1 - Math.min(0.15, (actualInstalledKwp - 3) * 0.01));
  const totalCostUsd = actualInstalledKwp * baseCostPerKwpUsd * roofFactor * scaleFactor;
  
  const estimatedGrossCost = Math.round(totalCostUsd * currency.toUsdRate);
  const taxIncentiveAmount = Math.round(estimatedGrossCost * 0.20);
  const netInvestmentCost = estimatedGrossCost - taxIncentiveAmount;

  const paybackYears = Number(
    Math.min(25, Math.max(1.5, netInvestmentCost / Math.max(1, annualSavingsAmount))).toFixed(1)
  );
  const estimatedRoiPercentage = Number(((annualSavingsAmount / netInvestmentCost) * 100).toFixed(1));

  // 9. 30-Year Cashflow Simulation (Exact comparison: Conventional Grid Cost vs Solar System Cost)
  const tariffInflationRate = 0.055; // 5.5% historical compounding utility inflation
  const panelDegradationRate = 0.005; // 0.5% yearly module degradation
  
  // Amortization period for financing option (6 years typical green loan)
  const financingYears = 6;
  const annualLoanPayment = (netInvestmentCost / financingYears) * 1.06;
  const annualMaintenanceBase = netInvestmentCost * 0.01; // 1% O&M

  let cumulativeSavings = 0;
  const thirtyYearCashflow: YearProjection[] = [];

  for (let y = 1; y <= 30; y++) {
    const tariffAtYear = effectiveTariff * Math.pow(1 + tariffInflationRate, y - 1);
    const genAtYear = annualGenerationKwh * Math.pow(1 - panelDegradationRate, y - 1);
    
    // Conventional grid annual cost without solar
    const costWithoutSolarAtYear = Math.round((monthlyConsumptionKwh * 12) * tariffAtYear);
    
    // Residual grid cost (power consumed when sun is down not offset or minimum fixed grid toll)
    const residualGridAnnual = Math.round(costWithoutSolarAtYear * utilityFixedFeePct);
    const oMAtYear = Math.round(annualMaintenanceBase * Math.pow(1 + 0.03, y - 1));

    // Solar system cost at year y:
    // In years 1 to 6: Loan repayment + residual grid
    // In years 7 to 30: System is completely paid off! Only residual grid + basic O&M maintenance
    let costWithSolarAtYear = residualGridAnnual + oMAtYear;
    if (y <= financingYears) {
      costWithSolarAtYear += Math.round(annualLoanPayment);
    }

    const annualSavings = Math.max(0, costWithoutSolarAtYear - costWithSolarAtYear);
    cumulativeSavings += annualSavings;

    thirtyYearCashflow.push({
      year: y,
      costWithoutSolar: costWithoutSolarAtYear,
      costWithSolar: costWithSolarAtYear,
      annualSavings,
      netCumulativeSavings: cumulativeSavings,
    });
  }

  const twentyFiveYearCashflow = thirtyYearCashflow.slice(0, 25);
  const cumulative25YearSavings = twentyFiveYearCashflow[twentyFiveYearCashflow.length - 1].netCumulativeSavings;
  const cumulative30YearSavings = thirtyYearCashflow[thirtyYearCashflow.length - 1].netCumulativeSavings;

  // 10. Environmental Impact
  const annualCo2TonsAvoided = Number(((annualGenerationKwh * 0.44) / 1000).toFixed(2));
  const treesEquivalentCount = Math.round((annualCo2TonsAvoided * 1000) / 21.8);
  const carsKmAvoided = Math.round((annualCo2TonsAvoided * 1000) / 0.192);
  const homesPoweredEquivalent = Number((annualGenerationKwh / 3600).toFixed(1));

  return {
    monthlyConsumptionKwh: Math.round(monthlyConsumptionKwh),
    targetMonthlyOffsetKwh: Math.round(targetMonthlyOffsetKwh),
    recommendedKwp,
    panelCount,
    panelWattage: inputs.panelWattage,
    actualInstalledKwp,
    monthlyGenerationKwh,
    annualGenerationKwh,
    roofAreaRequiredM2,

    effectiveHspUsed: Number(effectiveHsp.toFixed(2)),
    effectivePr,
    averageAmbientTempC: Number(avgTempC.toFixed(1)),
    nasaDataSource: nasa?.source ?? 'NASA/POWER Climatology API (Langley Research Center)',
    worstMonthHsp,
    bestMonthHsp,
    monthlyDetails,

    effectiveTariffPerKwh: effectiveTariff,
    monthlyCurrentBill: Math.round(monthlyCurrentBill),
    monthlySavingsAmount: Math.round(monthlySavingsAmount),
    newEstimatedMonthlyBill: Math.round(newEstimatedMonthlyBill),
    savingsPercentage,
    annualSavingsAmount: Math.round(annualSavingsAmount),

    estimatedGrossCost,
    taxIncentiveAmount,
    netInvestmentCost,
    paybackYears,
    estimatedRoiPercentage,
    cumulative25YearSavings,
    cumulative30YearSavings,

    annualCo2TonsAvoided,
    treesEquivalentCount,
    carsKmAvoided,
    homesPoweredEquivalent,

    twentyFiveYearCashflow,
    thirtyYearCashflow,
  };
}

export function formatCurrencyValue(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const isHighValue = currency.toUsdRate > 50;
  
  const formatted = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: isHighValue ? 0 : currency.formatDecimals,
    minimumFractionDigits: isHighValue ? 0 : currency.formatDecimals,
  }).format(amount);

  return `${currency.symbol} ${formatted} ${currency.code}`;
}

export function formatCompactCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  if (Math.abs(amount) >= 1_000_000) {
    return `${currency.symbol} ${(amount / 1_000_000).toFixed(1)}M ${currency.code}`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${currency.symbol} ${(amount / 1_000).toFixed(1)}k ${currency.code}`;
  }
  return formatCurrencyValue(amount, currencyCode);
}
