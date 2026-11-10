export interface TrmResult {
  valor: number;
  fecha: string;
  fuente: string;
  isLive: boolean;
}

export async function fetchLiveTrm(): Promise<TrmResult> {
  // 1. Consultar primero al Backend (/api/cotizaciones/trm)
  try {
    const backendRes = await fetch('/api/cotizaciones/trm');
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (typeof data.valor === 'number' && data.valor > 0) {
        return data;
      }
    }
  } catch {
    // Respaldo directo si el backend está apagado
  }

  // 2. Respaldo directo desde navegador (DolarApi Colombia)
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
  } catch {
    // Fallback final
  }

  return {
    valor: 3950,
    fecha: new Date().toISOString(),
    fuente: 'Tasa Referencial Estándar',
    isLive: false,
  };
}
