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
const cache = new Map<string, SolarRadiationResult>();

export async function fetchSolarRadiation(lat: number, lng: number): Promise<SolarRadiationResult> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // 1. Consultar primero al Backend (/api/cotizaciones/radiacion)
  try {
    const backendRes = await fetch(`/api/cotizaciones/radiacion?lat=${lat}&lng=${lng}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (typeof data.hsp === 'number' && data.hsp > 0) {
        cache.set(key, data);
        return data;
      }
    }
  } catch {
    // Respaldo directo a NASA POWER si el backend está apagado
  }

  const url =
    'https://power.larc.nasa.gov/api/temporal/climatology/point' +
    `?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lng.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`NASA POWER respondió ${response.status}`);
  }
  const data = await response.json();
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
    fuente: 'NASA POWER (Climatología satelital de largo plazo)',
    lat,
    lng,
  };
  cache.set(key, result);
  return result;
}
