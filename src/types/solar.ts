export type SectorType = 'residencial' | 'comercial' | 'industrial';
export type SystemType = 'on_grid' | 'hybrid';
export type RoofType = 'inclinado' | 'plano' | 'lamina';
export type CalculationMode = 'bill' | 'kwh';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  toUsdRate: number; // 1 USD = X in this currency
  formatDecimals: number;
  defaultBillAmount: number;
  defaultRatesPerKwh: {
    residencial: number;
    comercial: number;
    industrial: number;
  };
}

export interface NasaMonthlyData {
  JAN: number;
  FEB: number;
  MAR: number;
  APR: number;
  MAY: number;
  JUN: number;
  JUL: number;
  AUG: number;
  SEP: number;
  OCT: number;
  NOV: number;
  DEC: number;
  ANN: number;
}

export interface NasaPowerData {
  latitude: number;
  longitude: number;
  elevation?: number;
  source: string;
  irradianceGhi: NasaMonthlyData; // ALLSKY_SFC_SW_DWN in kW-hr/m²/day
  temperatureC: NasaMonthlyData;   // T2M in °C
  fetchedAt: string;
}

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  lat: number;
  lon: number;
  hsp: number; // Horas de Sol Pico (kWh/m²/día)
  solarZone: 'Excelente' | 'Muy Alta' | 'Alta' | 'Moderada';
}

export interface SolarInputs {
  calculationMode: CalculationMode;
  billAmount: number;
  monthlyKwh: number;
  sector: SectorType;
  cityId: string;
  latitude: number;
  longitude: number;
  sizingBasis: 'annual' | 'worst_month' | 'best_month';
  customHsp: number | null;
  targetCoveragePct: number; // 50 to 100
  panelWattage: number; // 500, 550, 580
  systemType: SystemType;
  roofType: RoofType;
  currencyCode: string;
  batteryCapacityKwh?: number; // for hybrid
  nasaPowerData?: NasaPowerData;
}

export interface YearProjection {
  year: number;
  costWithoutSolar: number; // Costo de la energía de la red convencional
  costWithSolar: number;    // Costo del sistema solar
  annualSavings: number;    // Ahorro anual
  netCumulativeSavings: number; // Ahorro neto acumulado
}

export interface MonthGenerationDetail {
  monthKey: keyof NasaMonthlyData;
  monthName: string;
  nasaHsp: number; // kWh/m²/day from NASA POWER
  nasaTempC: number; // °C from NASA POWER T2M
  generationKwh: number;
  savingsMoney: number;
}

export interface QuoteLine {
  concept: string;
  cost: number;  // sin margen, en la moneda seleccionada
  price: number; // con margen, en la moneda seleccionada
}

export interface QuoteBreakdown {
  inverterReference: string;
  inverterCount: number;
  panelReference: string;
  batteryCount: number;
  lines: QuoteLine[];
  installationSubtotal: number;
  preliminarySubtotal: number;
  upmeCertificate: number;
  liabilityInsurance: number;
  salesCommission: number;
  subtotal: number;
  iva: number;
  total: number;
  pricePerKwp: number;
}

export interface SolarCalculationResults {
  monthlyConsumptionKwh: number;
  targetMonthlyOffsetKwh: number;
  recommendedKwp: number;
  panelCount: number;
  panelWattage: number;
  actualInstalledKwp: number;
  monthlyGenerationKwh: number;
  annualGenerationKwh: number;
  roofAreaRequiredM2: number;

  // Fórmula Oficial Andrés (Dimensionamiento e Integración NASA POWER)
  annualConsumptionKwh: number; // E_consumoAnual = ConsumoMensual * 12
  exactPanelCount: number;      // NroPaneles antes del redondeo
  systemEfficiency: number;     // Eficiencia del sistema (0.80 = 80%)
  
  // NASA POWER specific engineering outputs
  effectiveHspUsed: number;
  effectivePr: number;
  averageAmbientTempC: number;
  nasaDataSource: string;
  worstMonthHsp: number;
  bestMonthHsp: number;
  monthlyDetails: MonthGenerationDetail[];
  
  // Financials
  effectiveTariffPerKwh: number;
  monthlyCurrentBill: number;
  monthlySavingsAmount: number;
  newEstimatedMonthlyBill: number;
  savingsPercentage: number;
  annualSavingsAmount: number;
  
  estimatedGrossCost: number;
  ivaAmount: number;
  netInvestmentCost: number;
  paybackYears: number;
  estimatedRoiPercentage: number;
  cumulative25YearSavings: number;
  cumulative30YearSavings: number;

  // Environmental
  annualCo2TonsAvoided: number;
  treesEquivalentCount: number;
  carsKmAvoided: number;
  homesPoweredEquivalent: number;

  // Projections
  twentyFiveYearCashflow: YearProjection[];
  thirtyYearCashflow: YearProjection[];

  // Cotización detallada (fórmulas del Excel)
  quote: QuoteBreakdown;
}
