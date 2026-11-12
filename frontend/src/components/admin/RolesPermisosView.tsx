import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Save,
  Check,
  AlertCircle,
  Loader2,
  User,
  Mail,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  Lock,
  RefreshCw,
  Clock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export interface UsuarioPermiso {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  permisos: string[];
  ultimoLogin?: string;
  fechaCreacion?: string;
}

export interface PermisoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Props {
  currentUser?: { email: string; nombre: string; rol?: string } | null;
}

export const RolesPermisosView: React.FC<Props> = ({ currentUser }) => {
  const [usuarios, setUsuarios] = useState<UsuarioPermiso[]>([]);
  const [catalogo, setCatalogo] = useState<PermisoCatalogo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioPermiso | null>(null);
  const [currentRol, setCurrentRol] = useState<string>('Ingeniero de Proyectos');
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  const [filtroUsuario, setFiltroUsuario] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const esAdmin = currentUser?.rol?.toLowerCase().includes('admin') ?? false;

  const getAuthToken = () =>
    sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');

  const cargarDatos = () => {
    if (!esAdmin) return;
    const token = getAuthToken();
    setLoading(true);
    setError(null);

    fetch('/api/usuarios', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Error cargando usuarios y permisos');
        }
        return res.json();
      })
      .then((data) => {
        setUsuarios(data.usuarios || []);
        setCatalogo(data.catalogoPermisos || []);
        if (data.usuarios && data.usuarios.length > 0) {
          // Seleccionar por defecto el primer usuario si no hay uno seleccionado
          const u = selectedUser
            ? data.usuarios.find((x: UsuarioPermiso) => x.id === selectedUser.id) || data.usuarios[0]
            : data.usuarios[0];
          setSelectedUser(u);
          setCurrentRol(u.rol || 'Ingeniero de Proyectos');
          setSelectedPermisos(Array.isArray(u.permisos) ? u.permisos : []);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Error consultando usuarios en PostgreSQL.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatos();
  }, [currentUser]);

  // Manejo de cambio de usuario seleccionado
  const handleSelectUser = (u: UsuarioPermiso) => {
    setSelectedUser(u);
    setCurrentRol(u.rol || 'Ingeniero de Proyectos');
    setSelectedPermisos(Array.isArray(u.permisos) ? u.permisos : []);
    setError(null);
    setSuccess(null);
  };

  // Toggle de un permiso individual
  const togglePermiso = (idPermiso: string) => {
    if (selectedPermisos.includes(idPermiso)) {
      setSelectedPermisos(selectedPermisos.filter((p) => p !== idPermiso));
    } else {
      setSelectedPermisos([...selectedPermisos, idPermiso]);
    }
  };

  // Marcar todos los permisos
  const handleSelectAll = () => {
    setSelectedPermisos(catalogo.map((p) => p.id));
  };

  // Desmarcar todos los permisos
  const handleDeselectAll = () => {
    setSelectedPermisos([]);
  };

  // Asignar permisos recomendados según el rol seleccionado
  const handleApplyRoleDefaults = (rol: string) => {
    setCurrentRol(rol);
    if (rol === 'Administrador') {
      setSelectedPermisos(catalogo.map((p) => p.id));
    } else if (rol === 'Ingeniero de Proyectos') {
      setSelectedPermisos([
        'CALCULAR_PROYECTO',
        'DESCARGAR_COTIZACION_PDF',
        'VER_HISTORIAL_COTIZACIONES',
        'MODIFICAR_FORMULAS',
        'EXPORTAR_REPORTES',
        'AJUSTAR_PARAMETROS_FINANCIEROS',
      ]);
    } else {
      // Asesor Comercial Solar
      setSelectedPermisos([
        'CALCULAR_PROYECTO',
        'DESCARGAR_COTIZACION_PDF',
        'VER_HISTORIAL_COTIZACIONES',
        'APLICAR_DESCUENTOS',
      ]);
    }
  };

  // Guardar en la base de datos
  const handleGuardar = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = getAuthToken();

    try {
      const res = await fetch(`/api/usuarios/${selectedUser.id}/permisos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rol: currentRol,
          permisos: selectedPermisos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error guardando permisos en PostgreSQL');
      }

      setSuccess(`Permisos y rol actualizados exitosamente para ${selectedUser.nombre}.`);

      // Actualizar estado local
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, rol: currentRol, permisos: selectedPermisos } : u
        )
      );
      setSelectedUser({ ...selectedUser, rol: currentRol, permisos: selectedPermisos });
    } catch (err: any) {
      setError(err.message || 'Error al persistir cambios en PostgreSQL.');
    } finally {
      setSaving(false);
    }
  };

  // Si no es Administrador, bloquear vista completamente
  if (!esAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Acceso Restringido a Administradores
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            El módulo de <strong>Roles y Permisos</strong> solo está disponible para usuarios con rol de Administrador. Si requieres acceso, solicita permisos al administrador de la plataforma.
          </p>
        </div>
      </div>
    );
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = filtroUsuario.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Seguridad & Accesos
            </span>
            <span className="text-xs text-slate-400">• Control de Acceso por Usuario</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Roles y Permisos de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Asigna roles oficiales y activa o desactiva facultades del sistema almacenadas en PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={cargarDatos}
            disabled={loading}
            title="Recargar usuarios"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleGuardar}
            disabled={saving || !selectedUser}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en BD...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar Permisos</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded-lg">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            ×
          </button>
        </div>
      )}

      {/* Layout de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Lista de Usuarios (4 de 12) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Usuarios ({usuarios.length})</span>
            </div>
            <span className="text-[10px] text-slate-400">PostgreSQL</span>
          </div>

          {/* Buscador de usuarios */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
            />
          </div>

          {/* Lista de usuarios */}
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Cargando usuarios...</span>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No se encontraron usuarios coincidentes.
              </div>
            ) : (
              usuariosFiltrados.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{u.nombre}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold uppercase bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          #{u.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{u.email}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            u.rol === 'Administrador'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : u.rol === 'Ingeniero de Proyectos'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                          }`}
                        >
                          {u.rol}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {u.permisos ? u.permisos.length : 0} permisos
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Columna Derecha: Asignación de Rol y Permisos (8 de 12) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedUser ? (
            <>
              {/* Tarjeta de Usuario Activo y Rol */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-lg">
                      {selectedUser.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {selectedUser.nombre}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>{selectedUser.email}</span>
                        <span>•</span>
                        <span>ID #{selectedUser.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Rol Asignado:</span>
                    <select
                      value={currentRol}
                      onChange={(e) => handleApplyRoleDefaults(e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Ingeniero de Proyectos">Ingeniero de Proyectos</option>
                      <option value="Asesor Comercial Solar">Asesor Comercial Solar</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Permisos Otorgados:
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {selectedPermisos.length} de {catalogo.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-[11px] font-semibold text-slate-400 hover:underline"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>
              </div>

              {/* Grilla de Permisos del Sistema */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catalogo.map((perm) => {
                  const activo = selectedPermisos.includes(perm.id);
                  return (
                    <div
                      key={perm.id}
                      onClick={() => togglePermiso(perm.id)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                        activo
                          ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {perm.nombre}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                            {perm.descripcion}
                          </div>
                        </div>

                        <div className="mt-0.5">
                          {activo ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-400 uppercase truncate max-w-[150px]">
                          {perm.id}
                        </span>
                        <span
                          className={`font-bold ${
                            activo
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {activo ? 'ACTIVADO' : 'INACTIVO'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 space-y-2">
              <UserCheck className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold">Selecciona un usuario de la lista izquierda</p>
              <p className="text-xs text-slate-500">
                Podrás inspeccionar y configurar sus facultades en el sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
