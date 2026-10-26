export interface ColombianCity {
  id: string;
  nombre: string;
  departamento: string;
  hsp: number;
  hspMin: number;
  hspMax: number;
}

/**
 * Catálogo exclusivo de ciudades y municipios principales de Colombia
 * con valores oficiales de radiación solar (Horas Sol Pico - HSP) según IDEAM / Atlas Solar de Colombia.
 */
export const COLOMBIAN_CITIES: ColombianCity[] = [
  // Principales Capitales
  { id: 'bogota', nombre: 'Bogotá D.C.', departamento: 'Bogotá', hsp: 4.45, hspMin: 3.33, hspMax: 5.60 },
  { id: 'medellin', nombre: 'Medellín', departamento: 'Antioquia', hsp: 4.65, hspMin: 3.93, hspMax: 5.90 },
  { id: 'cali', nombre: 'Cali', departamento: 'Valle del Cauca', hsp: 4.88, hspMin: 3.47, hspMax: 5.60 },
  { id: 'barranquilla', nombre: 'Barranquilla', departamento: 'Atlántico', hsp: 5.58, hspMin: 4.07, hspMax: 7.05 },
  { id: 'cartagena', nombre: 'Cartagena', departamento: 'Bolívar', hsp: 5.48, hspMin: 3.75, hspMax: 7.70 },
  { id: 'bucaramanga', nombre: 'Bucaramanga', departamento: 'Santander', hsp: 4.72, hspMin: 3.93, hspMax: 6.50 },
  { id: 'cucuta', nombre: 'Cúcuta', departamento: 'Norte de Santander', hsp: 4.95, hspMin: 3.97, hspMax: 6.00 },
  { id: 'pereira', nombre: 'Pereira', departamento: 'Risaralda', hsp: 4.25, hspMin: 3.33, hspMax: 4.13 },
  { id: 'santa-marta', nombre: 'Santa Marta', departamento: 'Magdalena', hsp: 5.65, hspMin: 4.10, hspMax: 6.73 },
  { id: 'ibague', nombre: 'Ibagué', departamento: 'Tolima', hsp: 4.60, hspMin: 3.67, hspMax: 6.43 },
  { id: 'manizales', nombre: 'Manizales', departamento: 'Caldas', hsp: 4.10, hspMin: 3.67, hspMax: 5.30 },
  { id: 'pasto', nombre: 'Pasto', departamento: 'Nariño', hsp: 3.80, hspMin: 2.84, hspMax: 4.53 },
  { id: 'neiva', nombre: 'Neiva', departamento: 'Huila', hsp: 4.80, hspMin: 3.31, hspMax: 5.80 },
  { id: 'villavicencio', nombre: 'Villavicencio', departamento: 'Meta', hsp: 4.20, hspMin: 3.15, hspMax: 6.27 },
  { id: 'armenia', nombre: 'Armenia', departamento: 'Quindío', hsp: 4.15, hspMin: 3.37, hspMax: 4.67 },
  { id: 'valledupar', nombre: 'Valledupar', departamento: 'Cesar', hsp: 5.40, hspMin: 4.23, hspMax: 7.57 },
  { id: 'monteria', nombre: 'Montería', departamento: 'Córdoba', hsp: 4.90, hspMin: 3.97, hspMax: 6.50 },
  { id: 'sincelejo', nombre: 'Sincelejo', departamento: 'Sucre', hsp: 5.10, hspMin: 4.17, hspMax: 7.40 },
  { id: 'popayan', nombre: 'Popayán', departamento: 'Cauca', hsp: 4.20, hspMin: 3.47, hspMax: 5.40 },
  { id: 'tunja', nombre: 'Tunja', departamento: 'Boyacá', hsp: 4.50, hspMin: 3.73, hspMax: 7.43 },
  { id: 'riohacha', nombre: 'Riohacha', departamento: 'La Guajira', hsp: 5.85, hspMin: 4.53, hspMax: 7.13 },
  { id: 'florencia', nombre: 'Florencia', departamento: 'Caquetá', hsp: 4.10, hspMin: 2.89, hspMax: 5.97 },
  { id: 'yopal', nombre: 'Yopal', departamento: 'Casanare', hsp: 4.40, hspMin: 3.40, hspMax: 7.03 },
  { id: 'quibdo', nombre: 'Quibdó', departamento: 'Chocó', hsp: 3.20, hspMin: 3.32, hspMax: 4.10 },
  { id: 'arauca', nombre: 'Arauca', departamento: 'Arauca', hsp: 4.30, hspMin: 3.40, hspMax: 6.67 },
  { id: 'san-andres', nombre: 'San Andrés', departamento: 'San Andrés y Providencia', hsp: 5.20, hspMin: 4.10, hspMax: 6.07 },
  { id: 'mocoa', nombre: 'Mocoa', departamento: 'Putumayo', hsp: 3.70, hspMin: 2.83, hspMax: 5.37 },
  { id: 'san-jose-guaviare', nombre: 'San José del Guaviare', departamento: 'Guaviare', hsp: 4.00, hspMin: 3.01, hspMax: 5.93 },
  { id: 'leticia', nombre: 'Leticia', departamento: 'Amazonas', hsp: 3.90, hspMin: 2.76, hspMax: 5.10 },
  { id: 'inirida', nombre: 'Inírida', departamento: 'Guanía', hsp: 3.95, hspMin: 3.16, hspMax: 5.57 },
  { id: 'mitu', nombre: 'Mitú', departamento: 'Vaupés', hsp: 3.75, hspMin: 2.91, hspMax: 5.23 },
  { id: 'puerto-carreno', nombre: 'Puerto Carreño', departamento: 'Vichada', hsp: 4.85, hspMin: 3.50, hspMax: 6.80 },

  // Ciudades y Municipios Relevantes de Antioquia
  { id: 'bello', nombre: 'Bello', departamento: 'Antioquia', hsp: 4.65, hspMin: 3.93, hspMax: 5.90 },
  { id: 'itagui', nombre: 'Itagüí', departamento: 'Antioquia', hsp: 4.65, hspMin: 3.93, hspMax: 5.90 },
  { id: 'envigado', nombre: 'Envigado', departamento: 'Antioquia', hsp: 4.65, hspMin: 3.93, hspMax: 5.90 },
  { id: 'rionegro', nombre: 'Rionegro', departamento: 'Antioquia', hsp: 4.50, hspMin: 3.90, hspMax: 5.80 },
  { id: 'apartado', nombre: 'Apartadó', departamento: 'Antioquia', hsp: 4.30, hspMin: 3.80, hspMax: 5.60 },
  { id: 'caucasia', nombre: 'Caucasia', departamento: 'Antioquia', hsp: 4.50, hspMin: 3.90, hspMax: 6.00 },
  { id: 'sabaneta', nombre: 'Sabaneta', departamento: 'Antioquia', hsp: 4.60, hspMin: 3.90, hspMax: 5.80 },
  { id: 'la-estrella', nombre: 'La Estrella', departamento: 'Antioquia', hsp: 4.55, hspMin: 3.90, hspMax: 5.80 },
  { id: 'copacabana', nombre: 'Copacabana', departamento: 'Antioquia', hsp: 4.60, hspMin: 3.90, hspMax: 5.80 },
  { id: 'marinilla', nombre: 'Marinilla', departamento: 'Antioquia', hsp: 4.45, hspMin: 3.85, hspMax: 5.75 },
  { id: 'la-ceja', nombre: 'La Ceja', departamento: 'Antioquia', hsp: 4.40, hspMin: 3.80, hspMax: 5.70 },
  { id: 'el-retiro', nombre: 'El Retiro', departamento: 'Antioquia', hsp: 4.35, hspMin: 3.80, hspMax: 5.60 },
  { id: 'guarne', nombre: 'Guarne', departamento: 'Antioquia', hsp: 4.45, hspMin: 3.85, hspMax: 5.75 },
  { id: 'santa-fe-antioquia', nombre: 'Santa Fe de Antioquia', departamento: 'Antioquia', hsp: 4.70, hspMin: 4.00, hspMax: 6.10 },
  { id: 'turbo', nombre: 'Turbo', departamento: 'Antioquia', hsp: 4.40, hspMin: 3.80, hspMax: 5.70 },

  // Cundinamarca y Alrededores
  { id: 'soacha', nombre: 'Soacha', departamento: 'Cundinamarca', hsp: 4.40, hspMin: 3.30, hspMax: 5.50 },
  { id: 'chia', nombre: 'Chía', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.60 },
  { id: 'zipaquira', nombre: 'Zipaquirá', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.60 },
  { id: 'facatativa', nombre: 'Facatativá', departamento: 'Cundinamarca', hsp: 4.40, hspMin: 3.30, hspMax: 5.50 },
  { id: 'fusagasuga', nombre: 'Fusagasugá', departamento: 'Cundinamarca', hsp: 4.30, hspMin: 3.25, hspMax: 5.40 },
  { id: 'girardot', nombre: 'Girardot', departamento: 'Cundinamarca', hsp: 4.90, hspMin: 3.65, hspMax: 6.20 },
  { id: 'mosquera', nombre: 'Mosquera', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.55 },
  { id: 'madrid', nombre: 'Madrid', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.55 },
  { id: 'funza', nombre: 'Funza', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.55 },
  { id: 'cajica', nombre: 'Cajicá', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.60 },
  { id: 'cota', nombre: 'Cota', departamento: 'Cundinamarca', hsp: 4.45, hspMin: 3.35, hspMax: 5.60 },
  { id: 'sopo', nombre: 'Sopó', departamento: 'Cundinamarca', hsp: 4.40, hspMin: 3.30, hspMax: 5.50 },
  { id: 'villeta', nombre: 'Villeta', departamento: 'Cundinamarca', hsp: 4.60, hspMin: 3.40, hspMax: 5.80 },
  { id: 'anapoima', nombre: 'Anapoima', departamento: 'Cundinamarca', hsp: 4.70, hspMin: 3.50, hspMax: 5.90 },
  { id: 'la-mesa', nombre: 'La Mesa', departamento: 'Cundinamarca', hsp: 4.60, hspMin: 3.45, hspMax: 5.80 },

  // Valle del Cauca
  { id: 'palmira', nombre: 'Palmira', departamento: 'Valle del Cauca', hsp: 4.88, hspMin: 3.47, hspMax: 5.60 },
  { id: 'buenaventura', nombre: 'Buenaventura', departamento: 'Valle del Cauca', hsp: 3.50, hspMin: 2.80, hspMax: 4.50 },
  { id: 'tulua', nombre: 'Tuluá', departamento: 'Valle del Cauca', hsp: 4.70, hspMin: 3.40, hspMax: 5.50 },
  { id: 'buga', nombre: 'Guadalajara de Buga', departamento: 'Valle del Cauca', hsp: 4.70, hspMin: 3.40, hspMax: 5.50 },
  { id: 'cartago', nombre: 'Cartago', departamento: 'Valle del Cauca', hsp: 4.50, hspMin: 3.35, hspMax: 5.40 },
  { id: 'jamundi', nombre: 'Jamundí', departamento: 'Valle del Cauca', hsp: 4.85, hspMin: 3.45, hspMax: 5.60 },
  { id: 'yumbo', nombre: 'Yumbo', departamento: 'Valle del Cauca', hsp: 4.85, hspMin: 3.45, hspMax: 5.60 },
  { id: 'candelaria', nombre: 'Candelaria', departamento: 'Valle del Cauca', hsp: 4.80, hspMin: 3.40, hspMax: 5.55 },

  // Caribe (Atlántico, Bolívar, Cesar, Córdoba, Magdalena, Sucre, La Guajira)
  { id: 'soledad', nombre: 'Soledad', departamento: 'Atlántico', hsp: 5.58, hspMin: 4.07, hspMax: 7.05 },
  { id: 'malambo', nombre: 'Malambo', departamento: 'Atlántico', hsp: 5.55, hspMin: 4.05, hspMax: 7.00 },
  { id: 'sabanalarga', nombre: 'Sabanalarga', departamento: 'Atlántico', hsp: 5.50, hspMin: 4.00, hspMax: 6.95 },
  { id: 'puerto-colombia', nombre: 'Puerto Colombia', departamento: 'Atlántico', hsp: 5.60, hspMin: 4.10, hspMax: 7.10 },
  { id: 'turbaco', nombre: 'Turbaco', departamento: 'Bolívar', hsp: 5.40, hspMin: 3.75, hspMax: 7.60 },
  { id: 'magangue', nombre: 'Magangué', departamento: 'Bolívar', hsp: 5.20, hspMin: 3.70, hspMax: 7.40 },
  { id: 'cienaga', nombre: 'Ciénaga', departamento: 'Magdalena', hsp: 5.50, hspMin: 4.05, hspMax: 6.70 },
  { id: 'fundacion', nombre: 'Fundación', departamento: 'Magdalena', hsp: 5.30, hspMin: 3.90, hspMax: 6.50 },
  { id: 'aguachica', nombre: 'Aguachica', departamento: 'Cesar', hsp: 5.10, hspMin: 4.00, hspMax: 7.20 },
  { id: 'maicao', nombre: 'Maicao', departamento: 'La Guajira', hsp: 5.80, hspMin: 4.50, hspMax: 7.10 },
  { id: 'uribia', nombre: 'Uribia', departamento: 'La Guajira', hsp: 6.00, hspMin: 4.60, hspMax: 7.30 },
  { id: 'cerete', nombre: 'Cereté', departamento: 'Córdoba', hsp: 4.90, hspMin: 3.95, hspMax: 6.50 },
  { id: 'lorica', nombre: 'Lorica', departamento: 'Córdoba', hsp: 4.90, hspMin: 3.95, hspMax: 6.50 },
  { id: 'sahagun', nombre: 'Sahagún', departamento: 'Córdoba', hsp: 4.90, hspMin: 3.95, hspMax: 6.50 },

  // Santanderes y Boyacá
  { id: 'floridablanca', nombre: 'Floridablanca', departamento: 'Santander', hsp: 4.72, hspMin: 3.93, hspMax: 6.50 },
  { id: 'giron', nombre: 'Girón', departamento: 'Santander', hsp: 4.72, hspMin: 3.93, hspMax: 6.50 },
  { id: 'piedecuesta', nombre: 'Piedecuesta', departamento: 'Santander', hsp: 4.72, hspMin: 3.93, hspMax: 6.50 },
  { id: 'barrancabermeja', nombre: 'Barrancabermeja', departamento: 'Santander', hsp: 4.80, hspMin: 3.90, hspMax: 6.40 },
  { id: 'san-gil', nombre: 'San Gil', departamento: 'Santander', hsp: 4.60, hspMin: 3.85, hspMax: 6.30 },
  { id: 'ocana', nombre: 'Ocaña', departamento: 'Norte de Santander', hsp: 4.50, hspMin: 3.80, hspMax: 5.90 },
  { id: 'pamplona', nombre: 'Pamplona', departamento: 'Norte de Santander', hsp: 4.40, hspMin: 3.75, hspMax: 5.80 },
  { id: 'villa-rosario', nombre: 'Villa del Rosario', departamento: 'Norte de Santander', hsp: 4.95, hspMin: 3.97, hspMax: 6.00 },
  { id: 'los-patios', nombre: 'Los Patios', departamento: 'Norte de Santander', hsp: 4.95, hspMin: 3.97, hspMax: 6.00 },
  { id: 'duitama', nombre: 'Duitama', departamento: 'Boyacá', hsp: 4.50, hspMin: 3.70, hspMax: 7.40 },
  { id: 'sogamoso', nombre: 'Sogamoso', departamento: 'Boyacá', hsp: 4.50, hspMin: 3.70, hspMax: 7.40 },
  { id: 'chiquinquira', nombre: 'Chiquinquirá', departamento: 'Boyacá', hsp: 4.30, hspMin: 3.60, hspMax: 7.00 },
  { id: 'villa-leyva', nombre: 'Villa de Leyva', departamento: 'Boyacá', hsp: 4.60, hspMin: 3.80, hspMax: 7.30 },

  // Eje Cafetero y Tolima
  { id: 'dosquebradas', nombre: 'Dosquebradas', departamento: 'Risaralda', hsp: 4.25, hspMin: 3.33, hspMax: 4.13 },
  { id: 'santa-rosa-cabal', nombre: 'Santa Rosa de Cabal', departamento: 'Risaralda', hsp: 4.20, hspMin: 3.30, hspMax: 4.10 },
  { id: 'la-dorada', nombre: 'La Dorada', departamento: 'Caldas', hsp: 4.80, hspMin: 3.70, hspMax: 5.80 },
  { id: 'chinchina', nombre: 'Chinchiná', departamento: 'Caldas', hsp: 4.15, hspMin: 3.65, hspMax: 5.25 },
  { id: 'villamaria', nombre: 'Villamaría', departamento: 'Caldas', hsp: 4.05, hspMin: 3.60, hspMax: 5.20 },
  { id: 'calarca', nombre: 'Calarcá', departamento: 'Quindío', hsp: 4.15, hspMin: 3.35, hspMax: 4.65 },
  { id: 'espinal', nombre: 'Espinal', departamento: 'Tolima', hsp: 4.80, hspMin: 3.70, hspMax: 6.40 },
  { id: 'melgar', nombre: 'Melgar', departamento: 'Tolima', hsp: 4.80, hspMin: 3.70, hspMax: 6.40 },

  // Huila y Nariño
  { id: 'pitalito', nombre: 'Pitalito', departamento: 'Huila', hsp: 4.40, hspMin: 3.20, hspMax: 5.60 },
  { id: 'garzon', nombre: 'Garzón', departamento: 'Huila', hsp: 4.50, hspMin: 3.25, hspMax: 5.70 },
  { id: 'ipiales', nombre: 'Ipiales', departamento: 'Nariño', hsp: 3.80, hspMin: 2.80, hspMax: 4.50 },
  { id: 'tumaco', nombre: 'Tumaco', departamento: 'Nariño', hsp: 3.50, hspMin: 2.70, hspMax: 4.30 },

  // Meta, Casanare y Llanos
  { id: 'acacias', nombre: 'Acacías', departamento: 'Meta', hsp: 4.20, hspMin: 3.15, hspMax: 6.20 },
  { id: 'granada', nombre: 'Granada', departamento: 'Meta', hsp: 4.20, hspMin: 3.15, hspMax: 6.20 },
  { id: 'aguazul', nombre: 'Aguazul', departamento: 'Casanare', hsp: 4.30, hspMin: 3.35, hspMax: 6.90 },
  { id: 'villanueva-casanare', nombre: 'Villanueva', departamento: 'Casanare', hsp: 4.40, hspMin: 3.40, hspMax: 7.00 },
];
