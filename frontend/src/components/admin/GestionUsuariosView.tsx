import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Mail,
  User,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Save,
  Calendar,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { hasPermission, PermissionUser } from '../../utils/permissions';

export interface UsuarioItem {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  permisos: string[];
  ultimoLogin?: string;
  fechaCreacion?: string;
}

interface Props {
  currentUser?: PermissionUser | null;
}

export const GestionUsuariosView: React.FC<Props> = ({ currentUser }) => {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales del CRUD
  const [modalVer, setModalVer] = useState<UsuarioItem | null>(null);
  const [modalEliminar, setModalEliminar] = useState<UsuarioItem | null>(null);
  const [modalEditar, setModalEditar] = useState<UsuarioItem | null>(null);
  const [modalCrear, setModalCrear] = useState(false);

  // Formulario Crear / Editar
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Ingeniero de Proyectos',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const canViewUsuarios = hasPermission(currentUser, 'usuarios:ver');
  const canCreateUsuarios = hasPermission(currentUser, 'usuarios:crear');
  const canEditUsuarios = hasPermission(currentUser, 'usuarios:editar');

  const getAuthToken = () =>
    sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');

  const cargarUsuarios = () => {
    if (!canViewUsuarios) return;
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
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error cargando usuarios');
        }
        return res.json();
      })
      .then((data) => {
        setUsuarios(data.usuarios || []);
      })
      .catch((err: any) => {
        setError(err.message || 'Error al conectar con la base de datos de usuarios.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // C: CREATE
  const handleOpenCrear = () => {
    setForm({
      nombre: '',
      email: '',
      password: '',
      rol: 'Ingeniero de Proyectos',
    });
    setShowPassword(false);
    setError(null);
    setModalCrear(true);
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setError('El nombre del usuario es obligatorio.');
      return;
    }
    if (!form.email.includes('@') || !form.email.trim().toLowerCase().endsWith('.com')) {
      setError('El correo electrónico debe contener "@" y terminar en ".com".');
      return;
    }
    if (form.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear el usuario');
      }

      setSuccess(`Usuario "${form.nombre}" creado y guardado en PostgreSQL.`);
      setModalCrear(false);
      cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  // U: UPDATE
  const handleOpenEditar = (u: UsuarioItem) => {
    setForm({
      nombre: u.nombre || '',
      email: u.email || '',
      password: '',
      rol: u.rol || 'Ingeniero de Proyectos',
    });
    setShowPassword(false);
    setError(null);
    setModalEditar(u);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;
    setError(null);

    if (!form.nombre.trim()) {
      setError('El nombre del usuario es obligatorio.');
      return;
    }
    if (!form.email.includes('@') || !form.email.trim().toLowerCase().endsWith('.com')) {
      setError('El correo electrónico debe contener "@" y terminar en ".com".');
      return;
    }
    if (form.password && form.password.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      const token = getAuthToken();
      const payload: Record<string, string> = {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        rol: form.rol,
      };
      if (form.password) {
        payload.password = form.password;
      }

      const res = await fetch(`/api/usuarios/${modalEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el usuario');
      }

      setSuccess(`Usuario #${modalEditar.id} (${form.nombre}) actualizado correctamente.`);
      setModalEditar(null);
      cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  // D: DELETE
  const handleConfirmarEliminar = async () => {
    if (!modalEliminar) return;

    setGuardando(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/usuarios/${modalEliminar.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar el usuario');
      }

      setSuccess(`Usuario #${modalEliminar.id} (${modalEliminar.nombre}) eliminado de PostgreSQL.`);
      setModalEliminar(null);
      setUsuarios((prev) => prev.filter((u) => u.id !== modalEliminar.id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado en vivo
  const filtrados = usuarios.filter((u) => {
    const term = filtro.toLowerCase();
    return (
      (u.nombre && u.nombre.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.rol && u.rol.toLowerCase().includes(term)) ||
      String(u.id).includes(term)
    );
  });

  const totalAdmins = usuarios.filter((u) => u.rol === 'Administrador').length;
  const totalIngenieros = usuarios.filter((u) => u.rol === 'Ingeniero de Proyectos').length;
  const totalAsesores = usuarios.filter((u) => u.rol === 'Asesor Comercial Solar').length;

  if (!canViewUsuarios) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Acceso Restringido a Usuarios
          </h2>
          <p className="text-xs text-slate-400 max-w-md">
            No tienes el permiso <strong>Ver usuarios registrados (usuarios:ver)</strong> habilitado. Solicítalo al administrador en Roles y Permisos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alertas Globales */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header del Módulo CRUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Módulo de Cuentas
            </span>
            <span className="text-xs text-slate-400">• CRUD Completo en PostgreSQL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Gestión de Usuarios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Crea, consulta, edita y elimina usuarios registrados en la base de datos con encriptación scrypt.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={cargarUsuarios}
            disabled={loading}
            title="Recargar usuarios"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {canCreateUsuarios && (
            <button
              type="button"
              onClick={handleOpenCrear}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Usuarios</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {usuarios.length}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Administradores</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {totalAdmins}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Ingenieros</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {totalIngenieros}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Asesores</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {totalAsesores}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por nombre, correo, rol o ID..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {filtro && (
            <button
              onClick={() => setFiltro('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Mostrando <span className="font-bold text-slate-900 dark:text-slate-200">{filtrados.length}</span> de {usuarios.length} usuarios
        </div>
      </div>

      {/* Tabla CRUD de Usuarios */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold">Cargando usuarios desde PostgreSQL...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron usuarios
            </h3>
            <p className="text-xs max-w-sm text-slate-400">
              {filtro ? 'Intenta buscar con otros términos.' : 'Aún no hay usuarios registrados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Correo Electrónico</th>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Permisos</th>
                  <th className="py-3.5 px-4">Último Acceso</th>
                  <th className="py-3.5 px-4 text-right">Acciones (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtrados.map((u) => {
                  const isSelf = currentUser?.email?.toLowerCase() === u.email.toLowerCase();
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        #{u.id}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                              <span>{u.nombre}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold">
                                  Tú
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                            u.rol === 'Administrador'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : u.rol === 'Ingeniero de Proyectos'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {Array.isArray(u.permisos) ? u.permisos.length : 0}
                        </span>{' '}
                        activos
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {u.ultimoLogin
                          ? new Date(u.ultimoLogin).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Sin registro'}
                      </td>

                      {/* Acciones CRUD */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setModalVer(u)}
                            title="Ver detalle del usuario"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEditUsuarios && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditar(u)}
                                title="Editar usuario"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 hover:border-teal-500/40 hover:bg-teal-500/10 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setModalEliminar(u)}
                                disabled={isSelf}
                                title={isSelf ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VER DETALLE DEL USUARIO (R)                                      */}
      {/* ========================================================================= */}
      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
                  {modalVer.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalVer.nombre}
                  </h3>
                  <p className="text-xs text-slate-400">Usuario #{modalVer.id} • {modalVer.rol}</p>
                </div>
              </div>
              <button
                onClick={() => setModalVer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Correo
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-1 break-all">
                  {modalVer.email}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Fecha Creación
                </div>
                <div className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {modalVer.fechaCreacion
                    ? new Date(modalVer.fechaCreacion).toLocaleDateString('es-CO')
                    : 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                <span>Permisos asignados ({modalVer.permisos?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(modalVer.permisos) && modalVer.permisos.length > 0 ? (
                  modalVer.permisos.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Sin permisos específicos</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalVer(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREAR / EDITAR USUARIO (C y U)                                   */}
      {/* ========================================================================= */}
      {(modalCrear || modalEditar) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  {modalCrear ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalCrear ? 'Crear Nuevo Usuario' : `Editar Usuario #${modalEditar?.id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {modalCrear
                      ? 'La contraseña se encriptará con scrypt en PostgreSQL.'
                      : 'Actualiza los datos del usuario seleccionado.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalCrear(false);
                  setModalEditar(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={modalCrear ? handleCrearUsuario : handleGuardarEdicion}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej: Laura Gómez"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico (@ y .com) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ej: usuario@ticline.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {modalCrear ? 'Contraseña *' : 'Nueva Contraseña (opcional)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={modalCrear}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={
                      modalCrear
                        ? 'Mínimo 4 caracteres'
                        : 'Dejar vacío para conservar la contraseña actual'
                    }
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol del Usuario *
                </label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold cursor-pointer"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Ingeniero de Proyectos">Ingeniero de Proyectos</option>
                  <option value="Asesor Comercial Solar">Asesor Comercial Solar</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalCrear(false);
                    setModalEditar(null);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{modalCrear ? 'Crear Usuario' : 'Guardar Cambios'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR ELIMINAR USUARIO (D)                                   */}
      {/* ========================================================================= */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Eliminar Usuario #{modalEliminar.id}?
              </h3>
              <p className="text-xs text-slate-400">
                Esta acción eliminará permanentemente de PostgreSQL a{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {modalEliminar.nombre}
                </strong>{' '}
                ({modalEliminar.email}).
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalEliminar(null)}
                disabled={guardando}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

