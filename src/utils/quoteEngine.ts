import {
  BATTERY,
  BATTERY_CONTROL_BOX,
  HYBRID_INVERTERS,
  InverterCatalogItem,
  ON_GRID_RESIDENTIAL_INVERTERS,
  ON_GRID_THREE_PHASE_INVERTERS,
  PANEL_CATALOG,
  QUOTE_PARAMS,
  SMART_METER,
} from '../constants/quoteCatalog';
import { SystemType } from '../types/solar';

/**
 * Motor de cotización que replica las fórmulas de la hoja "COTIZACIÓN" del Excel
 * "Plantilla de Cotizaciones - V11 MAY 2026.xlsx". Todos los valores en COP.
 */

export interface QuoteCopLine {
  concept: string;
  cost: number;
  price: number;
}

export interface QuoteCopResult {
  inverterReference: string;
  inverterCount: number;
  panelReference: string;
  batteryCount: number;
  kwp: number;
  lines: QuoteCopLine[];
  installationSubtotalCost: number;
  installationSubtotalPrice: number; // D22
  preliminarySubtotal: number; // D31
  upmeCertificate: number; // D35
  liabilityInsurance: number; // D38
  salesCommission: number; // D41
  subtotal: number; // D45
  iva: number; // D46
  total: number; // D47
  pricePerKwp: number; // E49
}

/** Excel: COTIZACIÓN!C35 (Certificado UPME) */
export function calculateUpmeCertificate(preliminarySubtotal: number, liabilityInsurancePrice: number): number {
  const uvt = QUOTE_PARAMS.uvt;
  const d31 = preliminarySubtotal;
  const ratio = d31 / uvt;

  let raw = 0;
  if ((d31 + liabilityInsurancePrice) / uvt > 0 && ratio < 275) {
    raw = 1.2 * uvt;
  } else if (ratio >= 274.99 && ratio < 826) {
    raw = 3.4 * uvt;
  } else if (ratio >= 826 && ratio < 1652) {
    raw = 6.7 * uvt;
  } else if (ratio >= 1652 && ratio < 3305) {
    raw = 13.4 * uvt;
  } else if (d31 >= 3305) {
    raw = Math.min(13.4 * uvt + (d31 - 3305 * uvt) * 0.405 * 0.005, 275 * uvt);
  }
  // ROUNDUP(x, -5)
  return Math.ceil(raw / 100_000) * 100_000;
}

function pickInverter(
  kwp: number,
  catalog: InverterCatalogItem[]
): { item: InverterCatalogItem; count: number } {
  const ratio = QUOTE_PARAMS.maxDcAcRatio;
  const sorted = [...catalog].sort((a, b) => a.kw - b.kw);
  const single = sorted.find((inv) => inv.kw * ratio >= kwp);
  if (single) return { item: single, count: 1 };

  // Ningún inversor individual alcanza: se usa el de mayor potencia en paralelo
  const largest = sorted[sorted.length - 1];
  return { item: largest, count: Math.ceil(kwp / (largest.kw * ratio)) };
}

export interface QuoteCopInput {
  panelCount: number;
  panelWattage: number;
  systemType: SystemType;
  /** Consumo mensual en kWh, para dimensionar el banco de baterías (híbrido) */
  monthlyConsumptionKwh: number;
  batteryCapacityKwh?: number;
}

export function calculateQuoteCop(input: QuoteCopInput): QuoteCopResult {
  const P = QUOTE_PARAMS;
  const panel = PANEL_CATALOG.find((p) => p.wattage === input.panelWattage) ?? PANEL_CATALOG[0];
  const n = input.panelCount;
  const kwp = (n * panel.wattage) / 1000; // C5
  const isHybrid = input.systemType === 'hybrid';

  // Inversor
  const inverterCatalog = isHybrid
    ? HYBRID_INVERTERS
    : kwp <= 10 * P.maxDcAcRatio
    ? ON_GRID_RESIDENTIAL_INVERTERS
    : ON_GRID_THREE_PHASE_INVERTERS;
  const inv = pickInverter(kwp, inverterCatalog);

  // Baterías (solo híbrido)
  let batteryCount = 0;
  if (isHybrid) {
    const targetKwh = input.batteryCapacityKwh ?? Math.max(BATTERY.kwh, (input.monthlyConsumptionKwh / 30) * 0.5);
    batteryCount = Math.max(1, Math.ceil(targetKwh / BATTERY.kwh));
  }

  // Costos sin margen (columna C del Excel)
  const c9 = inv.count * inv.item.priceCop; // Inversor
  const c10 = n * panel.priceCop; // Paneles
  const c11 = SMART_METER.priceCop; // Smart meter GM3000
  const c12 = batteryCount * BATTERY.priceCop; // Baterías
  const c13 = isHybrid ? BATTERY_CONTROL_BOX.priceCop : 0; // Unidad de control
  const c15 = P.frontierAdequacy; // Adecuación Frontera
  const c16 = P.rackingPerKwp * kwp; // Racking
  const c17 = P.counterweightPerPanel * n; // Contrapesos
  const c20 = P.installationPerKwp * kwp; // Instalación
  const c18 = P.electricalMaterialPct * (c9 + c10 + c11 + c12 + c13 + c15 + c16 + c17 + c20); // Material eléctrico
  const c19 = P.marking; // Marcación
  const c21 = P.contingencyPct * (c9 + c10 + c11 + c12 + c13 + c15 + c16 + c17 + c18 + c19 + c20); // Imprevistos

  const withMargin = (cost: number) => cost / (1 - P.margin);

  const rawLines: { concept: string; cost: number }[] = [
    { concept: `Inversor ${inv.item.reference}${inv.count > 1 ? ` x${inv.count}` : ''}`, cost: c9 },
    { concept: `${panel.label} x${n}`, cost: c10 },
    { concept: `Smart Meter ${SMART_METER.reference}`, cost: c11 },
  ];
  if (isHybrid) {
    rawLines.push({ concept: `Baterías ${BATTERY.reference} x${batteryCount}`, cost: c12 });
    rawLines.push({ concept: 'Unidad de control de batería', cost: c13 });
  }
  rawLines.push(
    { concept: 'Adecuación Frontera', cost: c15 },
    { concept: 'Racking estructura paneles', cost: c16 },
    { concept: 'Contrapesos', cost: c17 },
    { concept: 'Material eléctrico', cost: c18 },
    { concept: 'Marcación', cost: c19 },
    { concept: 'Instalación (subcontratista)', cost: c20 },
    { concept: 'Imprevistos', cost: c21 }
  );

  const lines: QuoteCopLine[] = rawLines.map((l) => ({ ...l, price: withMargin(l.cost) }));

  const installationSubtotalCost = c9 + c10 + c11 + c12 + c13 + c15 + c16 + c17 + c18 + c19 + c20 + c21; // C22
  const d22 = lines.reduce((acc, l) => acc + l.price, 0); // D22

  const d25 = withMargin(P.retieCertification);
  const d28 = withMargin(P.travelAndFood);
  const d31 = d22 + d25 + d28; // Subtotal preliminar
  const d38 = withMargin(P.liabilityInsurance);
  const d35 = withMargin(calculateUpmeCertificate(d31, d38));
  const d41 = (d31 + d35 + d38) * P.salesCommission;
  const d45 = d31 + d41 + d35 + d38;

  // IVA: se excluyen inversor, paneles, imprevistos, UPME y comisión (Excel: D46)
  const d9 = withMargin(c9);
  const d10 = withMargin(c10);
  const d21 = withMargin(c21);
  const d46 = (d45 - d9 - d10 - d21 - d35 - d41) * P.iva;
  const d47 = d45 + d46;

  return {
    inverterReference: inv.item.reference,
    inverterCount: inv.count,
    panelReference: panel.label,
    batteryCount,
    kwp,
    lines,
    installationSubtotalCost,
    installationSubtotalPrice: d22,
    preliminarySubtotal: d31,
    upmeCertificate: d35,
    liabilityInsurance: d38,
    salesCommission: d41,
    subtotal: d45,
    iva: d46,
    total: d47,
    pricePerKwp: kwp > 0 ? d47 / kwp : 0,
  };
}
