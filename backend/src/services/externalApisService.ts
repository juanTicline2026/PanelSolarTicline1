export interface TrmResult {
  valor: number;
  fecha: string;
  fuente: string;
  isLive: boolean;
}

export interface SolarRadiationResult {
  hsp: number;
  hspMin: number;
  hspMax: number;
  mensual: number[];
  fuente: string;
  lat: number;
  lng: number;
}

const MESES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const radiationCache = new Map<string, SolarRadiationResult>();

/**
 * Consulta la TRM oficial en vivo desde el Backend
 */
export async function getLiveTrmFromBackend(): Promise<TrmResult> {
  try {
    const response = await fetch('https://co.dolarapi.com/v1/trm', {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = (await response.json()) as any;
      if (typeof data.valor === 'number' && data.valor > 0) {
        return {
          valor: Math.round(data.valor * 100) / 100,
          fecha: data.fechaActualizacion || new Date().toISOString(),
          fuente: 'Superintendencia Financiera de Colombia (Backend)',
          isLive: true,
        };
      }
    }
  } catch {
    // Fallback a API secundaria
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = (await response.json()) as any;
      const cop = data?.rates?.COP;
      if (typeof cop === 'number' && cop > 0) {
        return {
          valor: Math.round(cop * 100) / 100,
          fecha: data.date || new Date().toISOString(),
          fuente: 'Tasa de Cambio Internacional USD/COP (Backend)',
          isLive: true,
        };
      }
    }
  } catch {
    // Fallback local
  }

  return {
    valor: 3950,
    fecha: new Date().toISOString(),
    fuente: 'Tasa Referencial Estándar',
    isLive: false,
  };
}

/**
 * Consulta la Radiación Solar (NASA POWER) desde el Backend con caché en memoria
 */
export async function getSolarRadiationFromBackend(lat: number, lng: number): Promise<SolarRadiationResult> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = radiationCache.get(key);
  if (cached) return cached;

  const url =
    'https://power.larc.nasa.gov/api/temporal/climatology/point' +
    `?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lng.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`NASA POWER respondió ${response.status}`);
  }
  const data = (await response.json()) as any;
  const serie: Record<string, number> | undefined = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN;
  if (!serie) throw new Error('Respuesta de NASA POWER sin datos de radiación.');

  const mensual = MESES.map((m) => serie[m]).filter((v) => typeof v === 'number' && v > 0);
  if (mensual.length === 0) throw new Error('NASA POWER no tiene datos para esta ubicación.');

  const anual =
    typeof serie.ANN === 'number' && serie.ANN > 0
      ? serie.ANN
      : mensual.reduce((a, b) => a + b, 0) / mensual.length;

  const round2 = (v: number) => Math.round(v * 100) / 100;
  const result: SolarRadiationResult = {
    hsp: round2(anual),
    hspMin: round2(Math.min(...mensual)),
    hspMax: round2(Math.max(...mensual)),
    mensual: mensual.map(round2),
    fuente: 'NASA POWER (Climatología satelital vía Backend)',
    lat,
    lng,
  };
  radiationCache.set(key, result);
  return result;
}
