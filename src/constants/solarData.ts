import { CityLocation, CurrencyConfig } from '../types/solar';
import { PANEL_CATALOG } from './quoteCatalog';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'USD - Dólar Estadounidense',
    toUsdRate: 1,
    formatDecimals: 0,
    defaultBillAmount: 250,
    defaultRatesPerKwh: {
      residencial: 0.18,
      comercial: 0.22,
      industrial: 0.15,
    },
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'MXN - Peso Mexicano',
    toUsdRate: 18.5,
    formatDecimals: 0,
    defaultBillAmount: 3800,
    defaultRatesPerKwh: {
      residencial: 3.5,
      comercial: 4.2,
      industrial: 2.9,
    },
  },
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'COP - Peso Colombiano',
    toUsdRate: 4100,
    formatDecimals: 0,
    defaultBillAmount: 650000,
    defaultRatesPerKwh: {
      residencial: 850,
      comercial: 1050,
      industrial: 750,
    },
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'EUR - Euro',
    toUsdRate: 0.92,
    formatDecimals: 0,
    defaultBillAmount: 180,
    defaultRatesPerKwh: {
      residencial: 0.24,
      comercial: 0.28,
      industrial: 0.19,
    },
  },
  CLP: {
    code: 'CLP',
    symbol: '$',
    name: 'CLP - Peso Chileno',
    toUsdRate: 940,
    formatDecimals: 0,
    defaultBillAmount: 140000,
    defaultRatesPerKwh: {
      residencial: 160,
      comercial: 195,
      industrial: 135,
    },
  },
  PEN: {
    code: 'PEN',
    symbol: 'S/',
    name: 'PEN - Sol Peruano',
    toUsdRate: 3.75,
    formatDecimals: 0,
    defaultBillAmount: 480,
    defaultRatesPerKwh: {
      residencial: 0.72,
      comercial: 0.85,
      industrial: 0.58,
    },
  },
};

export const CITIES: CityLocation[] = [
  // México
  { id: 'mx-cdmx', name: 'Ciudad de México', country: 'México', countryFlag: '🇲🇽', lat: 19.4326, lon: -99.1332, hsp: 5.51, solarZone: 'Alta' },
  { id: 'mx-mty', name: 'Monterrey', country: 'México', countryFlag: '🇲🇽', lat: 25.6866, lon: -100.3161, hsp: 5.38, solarZone: 'Alta' },
  { id: 'mx-gdl', name: 'Guadalajara', country: 'México', countryFlag: '🇲🇽', lat: 20.6597, lon: -103.3496, hsp: 5.62, solarZone: 'Alta' },
  { id: 'mx-hmo', name: 'Hermosillo (Sonora)', country: 'México', countryFlag: '🇲🇽', lat: 29.0729, lon: -110.9559, hsp: 6.24, solarZone: 'Excelente' },
  { id: 'mx-cun', name: 'Cancún / Riviera Maya', country: 'México', countryFlag: '🇲🇽', lat: 21.1619, lon: -86.8515, hsp: 5.25, solarZone: 'Alta' },
  
  // Colombia
  { id: 'co-bog', name: 'Bogotá D.C.', country: 'Colombia', countryFlag: '🇨🇴', lat: 4.7110, lon: -74.0721, hsp: 4.45, solarZone: 'Moderada' },
  { id: 'co-med', name: 'Medellín / Antioquia', country: 'Colombia', countryFlag: '🇨🇴', lat: 6.2442, lon: -75.5812, hsp: 4.65, solarZone: 'Alta' },
  { id: 'co-cal', name: 'Cali / Valle del Cauca', country: 'Colombia', countryFlag: '🇨🇴', lat: 3.4516, lon: -76.5320, hsp: 4.88, solarZone: 'Alta' },
  { id: 'co-baq', name: 'Barranquilla / Caribe', country: 'Colombia', countryFlag: '🇨🇴', lat: 10.9685, lon: -74.7813, hsp: 5.58, solarZone: 'Muy Alta' },
  { id: 'co-ctg', name: 'Cartagena', country: 'Colombia', countryFlag: '🇨🇴', lat: 10.3910, lon: -75.4794, hsp: 5.48, solarZone: 'Muy Alta' },
  
  // España
  { id: 'es-mad', name: 'Madrid', country: 'España', countryFlag: '🇪🇸', lat: 40.4168, lon: -3.7038, hsp: 5.08, solarZone: 'Alta' },
  { id: 'es-sev', name: 'Sevilla / Andalucía', country: 'España', countryFlag: '🇪🇸', lat: 37.3891, lon: -5.9845, hsp: 5.75, solarZone: 'Excelente' },
  { id: 'es-bcn', name: 'Barcelona / Cataluña', country: 'España', countryFlag: '🇪🇸', lat: 41.3879, lon: 2.1699, hsp: 4.78, solarZone: 'Alta' },
  { id: 'es-val', name: 'Valencia', country: 'España', countryFlag: '🇪🇸', lat: 39.4699, lon: -0.3763, hsp: 5.15, solarZone: 'Alta' },

  // Estados Unidos
  { id: 'us-la', name: 'Los Ángeles (California)', country: 'EE.UU.', countryFlag: '🇺🇸', lat: 34.0522, lon: -118.2437, hsp: 5.62, solarZone: 'Muy Alta' },
  { id: 'us-mia', name: 'Miami (Florida)', country: 'EE.UU.', countryFlag: '🇺🇸', lat: 25.7617, lon: -80.1918, hsp: 5.28, solarZone: 'Alta' },
  { id: 'us-hou', name: 'Houston (Texas)', country: 'EE.UU.', countryFlag: '🇺🇸', lat: 29.7604, lon: -95.3698, hsp: 5.12, solarZone: 'Alta' },
  { id: 'us-phx', name: 'Phoenix (Arizona)', country: 'EE.UU.', countryFlag: '🇺🇸', lat: 33.4484, lon: -112.0740, hsp: 6.35, solarZone: 'Excelente' },

  // Chile & Otros
  { id: 'cl-scl', name: 'Santiago de Chile', country: 'Chile', countryFlag: '🇨🇱', lat: -33.4489, lon: -70.6693, hsp: 5.35, solarZone: 'Alta' },
  { id: 'cl-anf', name: 'Antofagasta / Atacama', country: 'Chile', countryFlag: '🇨🇱', lat: -23.6509, lon: -70.3975, hsp: 6.48, solarZone: 'Excelente' },
  { id: 'pe-lim', name: 'Lima', country: 'Perú', countryFlag: '🇵🇪', lat: -12.0464, lon: -77.0428, hsp: 4.42, solarZone: 'Moderada' },
  { id: 'pe-aqp', name: 'Arequipa', country: 'Perú', countryFlag: '🇵🇪', lat: -16.4090, lon: -71.5375, hsp: 6.12, solarZone: 'Excelente' },
  { id: 'ar-bue', name: 'Buenos Aires', country: 'Argentina', countryFlag: '🇦🇷', lat: -34.6037, lon: -58.3816, hsp: 4.52, solarZone: 'Moderada' },
  { id: 'ar-mdz', name: 'Mendoza', country: 'Argentina', countryFlag: '🇦🇷', lat: -32.8895, lon: -68.8458, hsp: 5.58, solarZone: 'Muy Alta' },
];

export const PANEL_OPTIONS = PANEL_CATALOG.map((p) => ({
  wattage: p.wattage,
  label: p.label,
  brand: p.brand,
  description:
    p.technology === 'Bifacial'
      ? 'Captación por ambas caras, mayor generación en techos planos o suelo.'
      : 'Módulo monofacial, balance costo-beneficio para techos inclinados.',
  efficiency: p.technology,
}));

export const SYSTEM_TYPES = [
  {
    id: 'on_grid',
    title: 'Interconectado a Red (On-Grid)',
    subtitle: 'El más rentable y popular',
    description: 'Inyecta tus excedentes a la red eléctrica y reduce hasta el 95% de tu factura. Menor inversión inicial y retorno más rápido.',
    badge: 'Máximo ROI',
  },
  {
    id: 'hybrid',
    title: 'Híbrido con Batería (Respaldo)',
    subtitle: 'Autonomía y seguridad total',
    description: 'Genera tu energía y almacénala en baterías de litio para cortes de luz y consumo nocturno. Independencia energética avanzada.',
    badge: '100% Continuidad',
  },
];

export const ROOF_TYPES = [
  {
    id: 'inclinado',
    name: 'Teja o Lámina Inclinada',
    factorCost: 1.0,
    description: 'Estructura coplanar estándar, excelente orientación natural.',
  },
  {
    id: 'plano',
    name: 'Techo Plano / Losa de Concreto',
    factorCost: 1.08,
    description: 'Estructura triangular con inclinación óptima a 15°-25°.',
  },
  {
    id: 'lamina',
    name: 'Cubierta Metálica / Industrial',
    factorCost: 0.98,
    description: 'Fijación directa con pinzas mini-rail de rápida instalación.',
  },
];

export const SECTORS = [
  {
    id: 'residencial',
    name: 'Residencial',
    description: 'Hogares, condominios y casas unifamiliares.',
    icon: 'Home',
    typicalSavings: '85% - 95%',
  },
  {
    id: 'comercial',
    name: 'Comercial',
    description: 'Oficinas, locales, clínicas y restaurantes.',
    icon: 'Building2',
    typicalSavings: '80% - 92%',
  },
];
