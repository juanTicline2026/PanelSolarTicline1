/**
 * Servicio para consultar la TRM (Tasa Representativa del Mercado) oficial de Colombia en vivo.
 * Consume la API oficial de la Superintendencia Financiera (vía DolarApi) con respaldo a ExchangeRate-API.
 */

export interface TrmResult {
  valor: number;
  fecha: string;
  fuente: string;
  isLive: boolean;
}

export async function fetchLiveTrm(): Promise<TrmResult> {
  // 1. Fuente Primaria: Superintendencia Financiera de Colombia (DolarApi)
  try {
    const response = await fetch('https://co.dolarapi.com/v1/trm', {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (typeof data.valor === 'number' && data.valor > 0) {
        return {
          valor: Math.round(data.valor * 100) / 100,
          fecha: data.fechaActualizacion || new Date().toISOString(),
          fuente: 'Superintendencia Financiera de Colombia',
          isLive: true,
        };
      }
    }
  } catch (error) {
    console.warn('Fallo al obtener TRM desde DolarApi Colombia, intentando API de respaldo...', error);
  }

  // 2. Fuente Secundaria de Respaldo: ExchangeRate-API
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.ok) {
      const data = await response.json();
      const cop = data?.rates?.COP;
      if (typeof cop === 'number' && cop > 0) {
        return {
          valor: Math.round(cop * 100) / 100,
          fecha: data.date || new Date().toISOString(),
          fuente: 'Tasa de Cambio Internacional (USD/COP)',
          isLive: true,
        };
      }
    }
  } catch (error) {
    console.warn('Fallo al obtener TRM desde API de respaldo...', error);
  }

  // 3. Valor de contingencia si no hay internet o ambas fallan
  return {
    valor: 3950,
    fecha: new Date().toISOString(),
    fuente: 'Tasa Referencial Estándar',
    isLive: false,
  };
}
