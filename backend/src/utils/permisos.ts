export const PERMISOS_SISTEMA = [
  { id: 'cotizaciones:crear', nombre: 'Crear y calcular cotizaciones', descripcion: 'Permite ingresar consumos y generar propuestas solares' },
  { id: 'cotizaciones:ver', nombre: 'Ver historial de cotizaciones', descripcion: 'Consultar cotizaciones guardadas en la base de datos' },
  { id: 'cotizaciones:descargar_pdf', nombre: 'Descargar cotización oficial en PDF', descripcion: 'Descargar el reporte comercial en PDF' },
  { id: 'cotizaciones:eliminar', nombre: 'Eliminar cotizaciones', descripcion: 'Borrar cotizaciones existentes de la base de datos' },
  { id: 'roles:administrar', nombre: 'Administrar Roles y Permisos', descripcion: 'Asignar y modificar roles y permisos a otros usuarios' },
  { id: 'usuarios:ver', nombre: 'Ver usuarios registrados', descripcion: 'Listar usuarios registrados en PostgreSQL' },
  { id: 'usuarios:crear', nombre: 'Crear nuevos usuarios', descripcion: 'Registrar nuevos usuarios desde el panel de control' },
  { id: 'usuarios:editar', nombre: 'Editar datos de usuarios', descripcion: 'Modificar nombre, cargo y estado de usuarios' },
  { id: 'precios:editar', nombre: 'Modificar costos y tarifas', descripcion: 'Editar costos por vatio y parámetros de cálculo' },
];

export const PERMISOS_DEFAULT_POR_ROL: Record<string, string[]> = {
  'Administrador': [
    'cotizaciones:crear',
    'cotizaciones:ver',
    'cotizaciones:descargar_pdf',
    'cotizaciones:eliminar',
    'roles:administrar',
    'usuarios:ver',
    'usuarios:crear',
    'usuarios:editar',
    'precios:editar',
  ],
  'Ingeniero de Proyectos': [
    'cotizaciones:crear',
    'cotizaciones:ver',
    'cotizaciones:descargar_pdf',
    'usuarios:ver',
  ],
  'Asesor Comercial Solar': [
    'cotizaciones:crear',
    'cotizaciones:ver',
    'cotizaciones:descargar_pdf',
  ],
};
