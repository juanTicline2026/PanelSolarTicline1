/**
 * Catálogo y parámetros de cotización extraídos de la hoja de cálculo
 * "Plantilla de Cotizaciones - V11 MAY 2026.xlsx".
 *
 * Todos los precios están en Pesos Colombianos (COP) SIN margen ni IVA,
 * tal como aparecen en la columna "Precio Pesos Colombianos sin Margen" del Excel.
 */

export const QUOTE_PARAMS = {
  /** Eficiencia global del sistema (Excel: COTIZACIÓN!G9) */
  systemEfficiency: 0.8,
  /** Días del año usados en el cálculo de generación (Excel: 365) */
  daysPerYear: 365,
  /** Margen comercial (Excel: COTIZACIÓN!E5). Precio = costo / (1 - margen) */
  margin: 0.3,
  /** IVA (Excel: COTIZACIÓN!D46) */
  iva: 0.19,
  /** Comisión comercial (Excel: COTIZACIÓN!C41) */
  salesCommission: 0.03,
  /** Relación DC/AC máxima admitida al dimensionar el inversor */
  maxDcAcRatio: 1.3,

  // Rubros fijos / unitarios (COP, sin margen)
  frontierAdequacy: 1_500_000, // Adecuación Frontera
  rackingPerKwp: 185_000, // Racking estructura paneles (por kWp)
  counterweightPerPanel: 2 * 20_000, // Contrapesos (por panel)
  electricalMaterialPct: 0.3, // Material eléctrico: 30% de (C9:C17 + C20)
  marking: 100_000, // Marcación
  installationPerKwp: 600_000, // Instalación subcontratista (por kWp)
  contingencyPct: 0.03, // Imprevistos: 3% de (C9:C20)
  retieCertification: 1_700_000, // Certificación RETIE
  travelAndFood: 2_000_000, // Transporte y alimentación
  liabilityInsurance: 800_000, // Póliza de responsabilidad civil

  // Certificado UPME (Excel: COTIZACIÓN!C35)
  uvt: 52_374,

  // Impacto ambiental (Excel: COTIZACIÓN!C3 y E3)
  treesPerKwh: 0.018,
  co2TonsPerMwh: 0.677,

  // Área (Excel: COTIZACIÓN!E4) = (panelArea + spacingFactor * spacingWidth) * kWp
  areaPanelM2: 2.382,
  areaSpacingFactor: 0.6,
  areaSpacingWidth: 1.134,
};

export interface PanelCatalogItem {
  wattage: number;
  label: string;
  brand: string;
  technology: string;
  /** Precio unitario por panel, COP sin margen */
  priceCop: number;
}

export const PANEL_CATALOG: PanelCatalogItem[] = [
  { wattage: 550, label: 'Eco Green - Panel 550 Monofacial', brand: 'Eco Green', technology: 'Monofacial', priceCop: 274_808 },
  { wattage: 570, label: 'Trina - Panel 570 Bifacial', brand: 'Trina', technology: 'Bifacial', priceCop: 284_802 },
  { wattage: 580, label: 'Astronergy - Panel 580 Bifacial', brand: 'Astronergy', technology: 'Bifacial', priceCop: 273_583.891391326 },
  { wattage: 615, label: 'Astronergy - Panel 615 Bifacial', brand: 'Astronergy', technology: 'Bifacial', priceCop: 293_866.101638805 },
  { wattage: 620, label: 'Trina - Panel 620 Monofacial', brand: 'Trina', technology: 'Monofacial', priceCop: 298_879 },
  { wattage: 630, label: 'Trina - Panel 630 Bifacial', brand: 'Trina', technology: 'Bifacial', priceCop: 291_522.100273106 },
  { wattage: 710, label: 'Trina - Panel 710 Bifacial', brand: 'Trina', technology: 'Bifacial', priceCop: 322_439.075588487 },
  { wattage: 715, label: 'Trina - Panel 715 Bifacial', brand: 'Trina', technology: 'Bifacial', priceCop: 323_670.529767993 },
  { wattage: 720, label: 'Trina - Panel 720 Bifacial', brand: 'Trina', technology: 'Bifacial', priceCop: 325_665.959953701 },
];

export interface InverterCatalogItem {
  reference: string;
  kw: number;
  priceCop: number;
}

/** Inversores On-Grid monofásicos / bifásicos (hasta 10 kW) */
export const ON_GRID_RESIDENTIAL_INVERTERS: InverterCatalogItem[] = [
  { reference: 'GW3000-DNS-30', kw: 3, priceCop: 1_402_501.6468411328 },
  { reference: 'GW5000-MS-30', kw: 5, priceCop: 2_160_567.525122439 },
  { reference: 'GW7000-MS-30', kw: 7, priceCop: 2_371_394.534947158 },
  { reference: 'GW8500-MS-30', kw: 8.5, priceCop: 2_507_868.188935514 },
  { reference: 'GW10K-MS-30', kw: 10, priceCop: 2_660_332.5395692224 },
];

/** Inversores On-Grid trifásicos */
export const ON_GRID_THREE_PHASE_INVERTERS: InverterCatalogItem[] = [
  { reference: 'GW12KLV-SDT-C30', kw: 12, priceCop: 2_865_206.510733267 },
  { reference: 'GW17KLV-SDT-C30T', kw: 17, priceCop: 3_198_722.277744503 },
  { reference: 'GW20KLV-MT', kw: 20, priceCop: 6_517_453.94497678 },
  { reference: 'GW30KLS-MT', kw: 30, priceCop: 7_530_774.636734082 },
  { reference: '35KLS-MT', kw: 35, priceCop: 8_809_529 },
  { reference: 'GW80K-SMT', kw: 80, priceCop: 12_264_645.928077905 },
  { reference: 'GW100K-GT', kw: 100, priceCop: 12_351_347.826724278 },
  { reference: '250K-HT', kw: 250, priceCop: 24_929_280.23191011 },
];

/** Inversores híbridos (con batería) GoodWe ES-US20 */
export const HYBRID_INVERTERS: InverterCatalogItem[] = [
  { reference: 'GW5000-ES-US20', kw: 5, priceCop: 6_230_094.34582172 },
  { reference: 'GW6000-ES-US20', kw: 6, priceCop: 6_678_778.632221724 },
  { reference: 'GW7600-ES-US20', kw: 7.6, priceCop: 7_510_609.050828465 },
  { reference: 'GW 9600-ES-US20', kw: 9.6, priceCop: 7_980_160.965393258 },
  { reference: 'GW 11K4-ES-US20', kw: 11.4, priceCop: 8_720_061.61977528 },
];

/** Smart Meter GM3000 (Excel: COTIZACIÓN!C11) */
export const SMART_METER = { reference: 'GM3000', priceCop: 807_941.92426758 };

/** Batería de litio Lxu 5,4-20 (Excel: Hoja4!B52) */
export const BATTERY = { reference: 'Lxu5,4-20', kwh: 5.4, priceCop: 6_147_558 };

/** Unidad de control de batería (Excel: Hoja4!B83) */
export const BATTERY_CONTROL_BOX = { reference: 'Control BOX REF - BHF-C01ZYR25001', priceCop: 2_306_312 };
