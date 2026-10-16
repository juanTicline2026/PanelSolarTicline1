import { CITIES, CURRENCIES } from '../constants/solarData';
import { QUOTE_PARAMS } from '../constants/quoteCatalog';
import { MonthGenerationDetail, NasaMonthlyData, QuoteBreakdown, SolarCalculationResults, SolarInputs, YearProjection } from '../types/solar';
import { calculateQuoteCop } from './quoteEngine';

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

  // 3. Eficiencia del sistema (Excel: COTIZACIÓN!G9 & Fórmula Andrés: 80%)
  const avgTempC = nasa?.temperatureC?.ANN ?? 18.5;
  const effectivePr = QUOTE_PARAMS.systemEfficiency; // 0.80 = 80%
  const DAYS_PER_YEAR = QUOTE_PARAMS.daysPerYear; // 365 días

  // 4. Dimensionamiento con la Fórmula Oficial Andrés:
  //    E_consumoAnual = ConsumoMensual(Factura) * 12
  //    Irradiancia = Radiacion Solar Horizontal (Nasa Power) en kWh/m^2/day
  //    NroPaneles = E_consumoAnual / (PotPanel(kWp) * 365dias * irradiancia * eficiencia(80%))
  const annualConsumptionKwh = monthlyConsumptionKwh * 12;
  const coverageFraction = Math.min(1, Math.max(0.2, inputs.targetCoveragePct / 100));
  const targetMonthlyOffsetKwh = monthlyConsumptionKwh * coverageFraction;
  const annualTargetKwh = targetMonthlyOffsetKwh * 12;

  const panelWattageKw = inputs.panelWattage / 1000; // PotPanel en kWp
  // NroPaneles exacto según la fórmula
  const exactPanelCount = annualTargetKwh / (panelWattageKw * DAYS_PER_YEAR * effectiveHsp * effectivePr);
  const recommendedKwp = Number((exactPanelCount * panelWattageKw).toFixed(2));

  // Número de paneles enteros y potencia instalada real
  const panelCount = Math.max(1, Math.ceil(exactPanelCount));
  const actualInstalledKwp = Number((panelCount * panelWattageKw).toFixed(2));

  // 5. Generación anual con la Fórmula Oficial Andrés:
  //    E_genAnual = NroPaneles * PotPanel(kWp) * 365dias * irradiancia * eficiencia(80%)
  const annualGenerationKwh = Math.round(panelCount * panelWattageKw * DAYS_PER_YEAR * effectiveHsp * effectivePr);
  const monthlyGenerationKwh = Math.round(annualGenerationKwh / 12);

  // Distribución mensual con la curva de radiación NASA POWER (suma = generación anual)
  const monthWeights = MONTH_KEYS.map((key, idx) => {
    const hsp = nasa?.irradianceGhi ? nasa.irradianceGhi[key] : effectiveHsp;
    return hsp * DAYS_IN_MONTH[idx];
  });
  const totalWeight = monthWeights.reduce((acc, w) => acc + w, 0);

  const monthlyDetails: MonthGenerationDetail[] = MONTH_KEYS.map((key, idx) => {
    const monthHsp = nasa?.irradianceGhi ? nasa.irradianceGhi[key] : effectiveHsp;
    const monthTemp = nasa?.temperatureC ? nasa.temperatureC[key] : avgTempC;

    const genKwh = Math.round((annualGenerationKwh * monthWeights[idx]) / totalWeight);
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

  // 6. Área requerida (Excel: COTIZACIÓN!E4 = (2.382 + 0.6 * 1.134) * kWp)
  const roofAreaRequiredM2 = Math.round(
    (QUOTE_PARAMS.areaPanelM2 + QUOTE_PARAMS.areaSpacingFactor * QUOTE_PARAMS.areaSpacingWidth) * actualInstalledKwp
  );

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

  // 8. Costo de capital (fórmulas de la hoja COTIZACIÓN del Excel, calculadas en COP)
  const quoteCop = calculateQuoteCop({
    panelCount,
    panelWattage: inputs.panelWattage,
    systemType: inputs.systemType,
    monthlyConsumptionKwh,
    batteryCapacityKwh: inputs.batteryCapacityKwh,
  });
  // Conversión COP -> moneda seleccionada
  const fx = (cop: number) => (cop * currency.toUsdRate) / CURRENCIES.COP.toUsdRate;

  const quote: QuoteBreakdown = {
    inverterReference: quoteCop.inverterReference,
    inverterCount: quoteCop.inverterCount,
    panelReference: quoteCop.panelReference,
    batteryCount: quoteCop.batteryCount,
    lines: quoteCop.lines.map((l) => ({ concept: l.concept, cost: Math.round(fx(l.cost)), price: Math.round(fx(l.price)) })),
    installationSubtotal: Math.round(fx(quoteCop.installationSubtotalPrice)),
    preliminarySubtotal: Math.round(fx(quoteCop.preliminarySubtotal)),
    upmeCertificate: Math.round(fx(quoteCop.upmeCertificate)),
    liabilityInsurance: Math.round(fx(quoteCop.liabilityInsurance)),
    salesCommission: Math.round(fx(quoteCop.salesCommission)),
    subtotal: Math.round(fx(quoteCop.subtotal)),
    iva: Math.round(fx(quoteCop.iva)),
    total: Math.round(fx(quoteCop.subtotal)) + Math.round(fx(quoteCop.iva)),
    pricePerKwp: Math.round(fx(quoteCop.pricePerKwp)),
  };

  const estimatedGrossCost = quote.subtotal; // Subtotal sin IVA
  const ivaAmount = quote.iva;
  const netInvestmentCost = quote.total; // Total con IVA (Excel: COTIZACIÓN!D47)

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
  // Excel: COTIZACIÓN!E3 (CO2 = kWh * 0.677 / 1000) y C3 (árboles = 0.018 * kWh)
  const annualCo2TonsAvoided = Number(((annualGenerationKwh * QUOTE_PARAMS.co2TonsPerMwh) / 1000).toFixed(2));
  const treesEquivalentCount = Math.round(QUOTE_PARAMS.treesPerKwh * annualGenerationKwh);
  const carsKmAvoided = Math.round((annualCo2TonsAvoided * 1000) / 0.192);
  const homesPoweredEquivalent = Number((annualGenerationKwh / 3600).toFixed(1));

  return {
    monthlyConsumptionKwh: Math.round(monthlyConsumptionKwh),
    targetMonthlyOffsetKwh: Math.round(targetMonthlyOffsetKwh),
    annualConsumptionKwh: Math.round(annualConsumptionKwh),
    exactPanelCount: Number(exactPanelCount.toFixed(3)),
    systemEfficiency: effectivePr,
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
    ivaAmount,
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

    quote,
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
