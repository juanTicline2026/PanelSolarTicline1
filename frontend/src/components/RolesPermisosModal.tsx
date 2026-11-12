import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  X, 
  Save, 
  Check, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  CheckSquare, 
  Square,
  Sparkles
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
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { email: string; nombre: string; rol?: string } | null;
}

export const RolesPermisosModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [usuarios, setUsuarios] = useState<UsuarioPermiso[]>([]);
  const [catalogo, setCatalogo] = useState<PermisoCatalogo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioPermiso | null>(null);
  const [currentRol, setCurrentRol] = useState<string>('Ingeniero de Proyectos');
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar usuarios y catálogo de permisos desde el Backend
  useEffect(() => {
    if (!isOpen) return;

    const token = sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');
    setLoading(true);
    setError(null);
    setSuccess(null);

    fetch('/api/usuarios', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Error consultando usuarios en el servidor');
        }
        return res.json();
      })
      .then((data) => {
        const uList = data.usuarios || [];
        setUsuarios(uList);
        setCatalogo(data.catalogoPermisos || []);
        if (uList.length > 0) {
          // Seleccionar el primer usuario o el actual
          const match = uList.find((u: UsuarioPermiso) => u.email === currentUser?.email) || uList[0];
          selectUser(match);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'No se pudieron cargar los roles y permisos.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, currentUser]);

  const selectUser = (u: UsuarioPermiso) => {
    setSelectedUser(u);
    setCurrentRol(u.rol || 'Ingeniero de Proyectos');
    setSelectedPermisos([...(u.permisos || [])]);
    setError(null);
    setSuccess(null);
  };

  const togglePermiso = (permisoId: string) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId) ? prev.filter((p) => p !== permisoId) : [...prev, permisoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermisos.length === catalogo.length) {
      setSelectedPermisos([]);
    } else {
      setSelectedPermisos(catalogo.map((c) => c.id));
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const token = sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');
    setSaving(true);
    setError(null);
    setSuccess(null);

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
        throw new Error(data.message || 'Error al guardar los permisos');
      }

      setSuccess(`¡Permisos de ${selectedUser.nombre} actualizados con éxito en PostgreSQL!`);

      // Actualizar la lista local
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, rol: currentRol, permisos: selectedPermisos } : u
        )
      );
      setSelectedUser((prev) =>
        prev ? { ...prev, rol: currentRol, permisos: selectedPermisos } : null
      );
    } catch (err: any) {
      setError(err.message || 'Error actualizando los permisos');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Asignación de Roles y Permisos
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona un usuario y define los permisos específicos que tendrá en la plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes de Alerta */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300 flex items-center gap-2.5">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Cuerpo del Modal con División en 2 Columnas */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            <span className="text-sm">Consultando usuarios en PostgreSQL...</span>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
            
            {/* Columna Izquierda: Lista de Usuarios (4 cols) */}
            <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 p-4 overflow-y-auto space-y-2 bg-slate-50/30 dark:bg-slate-950/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                Usuarios Registrados ({usuarios.length})
              </span>
              <div className="space-y-1.5">
                {usuarios.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 text-slate-900 dark:text-white shadow-sm'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center justify-between">
                          <span>{u.nombre}</span>
                          {u.rol === 'Administrador' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{u.email}</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                          {u.permisos?.length || 0} permisos asignados
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Columna Derecha: Recuadro para Asignar Permisos y Rol (8 cols) */}
            <div className="md:col-span-8 p-6 overflow-y-auto space-y-6">
              {selectedUser ? (
                <>
                  {/* Fila del Usuario Seleccionado */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Usuario a Configurar
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {selectedUser.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedUser.email}
                      </p>
                    </div>

                    {/* Selector de Rol */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                        Rol en la Plataforma
                      </label>
                      <select
                        value={currentRol}
                        onChange={(e) => setCurrentRol(e.target.value)}
                        className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all cursor-pointer"
                      >
                        <option value="Administrador">Administrador</option>
                        <option value="Ingeniero de Proyectos">Ingeniero de Proyectos</option>
                        <option value="Asesor Comercial Solar">Asesor Comercial Solar</option>
                      </select>
                    </div>
                  </div>

                  {/* Recuadro de Selección de Permisos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        Permisos del Sistema ({selectedPermisos.length} de {catalogo.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {selectedPermisos.length === catalogo.length ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    </div>

                    {/* Grid de Permisos con Estilo de Tarjeta */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {catalogo.map((perm) => {
                        const isChecked = selectedPermisos.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermiso(perm.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold block">
                                {perm.nombre}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                                {perm.descripcion}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Selecciona un usuario a la izquierda para gestionar sus permisos.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Pie de Página con Botones de Acción */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Los cambios se guardan directamente en la tabla usuarios de PostgreSQL</span>
          </div>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedUser}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Permisos</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

