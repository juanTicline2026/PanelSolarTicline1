import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Zap,
  DollarSign,
  TrendingUp,
  User,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  Save,
  Clock,
  Leaf,
  Layers,
} from 'lucide-react';

export interface CotizacionItem {
  id: number;
  usuarioId?: number;
  usuarioNombre?: string;
  creadoPor?: string;
  cliente: string;
  proyecto: string;
  ciudad: string;
  departamento: string;
  consumoKwh: number;
  potenciaPanelW?: number;
  paneles: number;
  kwp: number;
  areaRequeridaM2?: number;
  produccionMensualKwh?: number;
  radiacionHsp?: number;
  trm?: number;
  inversionCop: number;
  ahorroMensualCop: number;
  retornoAnios?: number;
  tirPct?: number;
  ahorroCo2Ton?: number;
  datosCotizacion?: any;
  fechaCreacion: string;
}

interface Props {
  currentUser?: { email: string; nombre: string; rol?: string } | null;
}

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

const cop = (v: number) => `$ ${nf(v)} COP`;

export const GestionCotizacionesView: React.FC<Props> = ({ currentUser }) => {
  const [cotizaciones, setCotizaciones] = useState<CotizacionItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modales del CRUD
  const [modalVer, setModalVer] = useState<CotizacionItem | null>(null);
  const [modalEliminar, setModalEliminar] = useState<CotizacionItem | null>(null);
  const [modalEditar, setModalEditar] = useState<CotizacionItem | null>(null);
  const [modalCrear, setModalCrear] = useState(false);

  // Estados para formulario Crear / Editar
  const [form, setForm] = useState({
    cliente: '',
    proyecto: '',
    ciudad: 'Medellín',
    departamento: 'Antioquia',
    consumoKwh: 350,
    potenciaPanelW: 585,
    paneles: 6,
    kwp: 3.51,
    inversionCop: 14500000,
    ahorroMensualCop: 280000,
    retornoAnios: 4.2,
    tirPct: 24.5,
  });

  const [guardando, setGuardando] = useState(false);

  const esAdmin = currentUser?.rol?.toLowerCase().includes('admin') ?? false;

  const getAuthToken = () =>
    sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');

  const cargarCotizaciones = () => {
    const token = getAuthToken();
    setLoading(true);
    setError(null);

    fetch('/api/cotizaciones', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Error cargando cotizaciones');
        }
        return res.json();
      })
      .then((data) => {
        setCotizaciones(data.cotizaciones || []);
      })
      .catch((err: any) => {
        setError(err.message || 'Error al conectar con la base de datos de cotizaciones.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarCotizaciones();
  }, []);

  // Limpiar mensaje de éxito después de 4s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // C: CREATE
  const handleOpenCrear = () => {
    setForm({
      cliente: '',
      proyecto: 'Sistema Solar Residencial / Comercial',
      ciudad: 'Medellín',
      departamento: 'Antioquia',
      consumoKwh: 450,
      potenciaPanelW: 585,
      paneles: 8,
      kwp: 4.68,
      inversionCop: 18900000,
      ahorroMensualCop: 360000,
      retornoAnios: 4.1,
      tirPct: 25.2,
    });
    setModalCrear(true);
  };

  const handleCrearCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cliente.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al crear la cotización');
      }

      setSuccess(`Cotización para "${form.cliente}" creada y guardada en PostgreSQL.`);
      setModalCrear(false);
      cargarCotizaciones();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la cotización');
    } finally {
      setGuardando(false);
    }
  };

  // U: UPDATE
  const handleOpenEditar = (cot: CotizacionItem) => {
    setForm({
      cliente: cot.cliente || '',
      proyecto: cot.proyecto || '',
      ciudad: cot.ciudad || '',
      departamento: cot.departamento || '',
      consumoKwh: Number(cot.consumoKwh) || 0,
      potenciaPanelW: Number(cot.potenciaPanelW) || 585,
      paneles: Number(cot.paneles) || 0,
      kwp: Number(cot.kwp) || 0,
      inversionCop: Number(cot.inversionCop) || 0,
      ahorroMensualCop: Number(cot.ahorroMensualCop) || 0,
      retornoAnios: Number(cot.retornoAnios) || 0,
      tirPct: Number(cot.tirPct) || 0,
    });
    setModalEditar(cot);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEditar) return;

    setGuardando(true);
    setError(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/cotizaciones/${modalEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar la cotización');
      }

      setSuccess(`Cotización #${modalEditar.id} actualizada correctamente.`);
      setModalEditar(null);
      cargarCotizaciones();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la cotización');
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
      const res = await fetch(`/api/cotizaciones/${modalEliminar.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al eliminar la cotización');
      }

      setSuccess(`Cotización #${modalEliminar.id} (${modalEliminar.cliente}) eliminada de la base de datos.`);
      setModalEliminar(null);
      setCotizaciones((prev) => prev.filter((c) => c.id !== modalEliminar.id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la cotización');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrado en vivo
  const filtradas = cotizaciones.filter((c) => {
    const term = filtro.toLowerCase();
    return (
      (c.cliente && c.cliente.toLowerCase().includes(term)) ||
      (c.proyecto && c.proyecto.toLowerCase().includes(term)) ||
      (c.ciudad && c.ciudad.toLowerCase().includes(term)) ||
      (c.departamento && c.departamento.toLowerCase().includes(term)) ||
      (c.usuarioNombre && c.usuarioNombre.toLowerCase().includes(term)) ||
      String(c.id).includes(term)
    );
  });

  // Métricas generales
  const totalKwp = cotizaciones.reduce((acc, c) => acc + (Number(c.kwp) || 0), 0);
  const totalInversion = cotizaciones.reduce((acc, c) => acc + (Number(c.inversionCop) || 0), 0);
  const totalAhorroMensual = cotizaciones.reduce((acc, c) => acc + (Number(c.ahorroMensualCop) || 0), 0);

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
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Módulo de Propuestas Solares
            </span>
            <span className="text-xs text-slate-400">• CRUD Completo en PostgreSQL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Gestionar Cotizaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Crea, consulta, actualiza y elimina cotizaciones almacenadas en la base de datos de producción.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={cargarCotizaciones}
            disabled={loading}
            title="Recargar cotizaciones"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCrear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Cotizaciones</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {cotizaciones.length}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Potencia Total</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {nf(totalKwp, 2)} <span className="text-xs font-semibold text-slate-400">kWp</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Inversión Total</div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {cop(totalInversion)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Ahorro Mensual Acum.</div>
            <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
              {cop(totalAhorroMensual)}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por cliente, proyecto, ciudad o creador..."
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
          Mostrando <span className="font-bold text-slate-900 dark:text-slate-200">{filtradas.length}</span> de {cotizaciones.length} cotizaciones
        </div>
      </div>

      {/* Tabla / Lista CRUD de Cotizaciones */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-semibold">Cargando cotizaciones desde PostgreSQL...</p>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No se encontraron cotizaciones
            </h3>
            <p className="text-xs max-w-sm text-slate-400">
              {filtro ? 'Intenta buscar con otros términos.' : 'Aún no hay cotizaciones registradas. Crea una nueva cotización con el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Cliente & Proyecto</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Capacidad</th>
                  <th className="py-3.5 px-4">Inversión (COP)</th>
                  <th className="py-3.5 px-4">Ahorro Mensual</th>
                  <th className="py-3.5 px-4">Creado Por</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-right">Acciones (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filtradas.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      #{c.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {c.cliente}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {c.proyecto || 'Proyecto Solar'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{c.ciudad || 'No especificada'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">{c.departamento}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>{nf(c.kwp, 2)} kWp</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4">
                        {c.paneles} paneles ({c.potenciaPanelW || 585}W)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {cop(c.inversionCop)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {cop(c.ahorroMensualCop)}
                      </div>
                      {c.retornoAnios ? (
                        <div className="text-[10px] text-slate-400">
                          Retorno: {nf(c.retornoAnios, 1)} años
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                        <User className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{c.usuarioNombre || 'Sistema'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4 truncate max-w-[140px]">
                        {c.creadoPor || ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {c.fechaCreacion
                        ? new Date(c.fechaCreacion).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Reciente'}
                    </td>

                    {/* Acciones CRUD */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* R: Read Detail */}
                        <button
                          type="button"
                          onClick={() => setModalVer(c)}
                          title="Ver detalle completo"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* U: Update */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditar(c)}
                          title="Editar cotización"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 hover:border-teal-500/40 hover:bg-teal-500/10 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* D: Delete */}
                        <button
                          type="button"
                          onClick={() => setModalEliminar(c)}
                          title="Eliminar cotización"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VER DETALLE (R)                                                  */}
      {/* ========================================================================= */}
      {modalVer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Detalle de Cotización #{modalVer.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Creada por {modalVer.usuarioNombre} el{' '}
                    {new Date(modalVer.fechaCreacion).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalVer(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Cliente</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                  {modalVer.cliente}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Proyecto</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                  {modalVer.proyecto}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Ubicación</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                  {modalVer.ciudad}, {modalVer.departamento}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Potencia Pico (kWp)</div>
                <div className="font-bold text-sm text-amber-500 mt-1">
                  {nf(modalVer.kwp, 2)} kWp ({modalVer.paneles} paneles)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Inversión Estimada</div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                  {cop(modalVer.inversionCop)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Ahorro Mensual Estimado</div>
                <div className="font-bold text-sm text-emerald-500 mt-1">
                  {cop(modalVer.ahorroMensualCop)}
                </div>
              </div>

              {modalVer.retornoAnios ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400">Retorno de Inversión</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {nf(modalVer.retornoAnios, 1)} años
                  </div>
                </div>
              ) : null}

              {modalVer.tirPct ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400">TIR Estimada</div>
                  <div className="font-bold text-sm text-teal-500 mt-1">
                    {nf(modalVer.tirPct, 1)}%
                  </div>
                </div>
              ) : null}

              {modalVer.consumoKwh ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-400">Consumo Mensual Base</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {nf(modalVer.consumoKwh, 0)} kWh/mes
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
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
      {/* MODAL 2: FORMULARIO CREAR / EDITAR (C y U)                                */}
      {/* ========================================================================= */}
      {(modalCrear || modalEditar) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  {modalCrear ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalCrear ? 'Crear Nueva Cotización' : `Editar Cotización #${modalEditar?.id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {modalCrear
                      ? 'Ingresa los datos para registrar la propuesta en PostgreSQL.'
                      : 'Modifica los valores técnicos y financieros de la cotización.'}
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
              onSubmit={modalCrear ? handleCrearCotizacion : handleGuardarEdicion}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cliente / Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.cliente}
                    onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    placeholder="Ej: Inversiones Los Andes SAS"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Proyecto
                  </label>
                  <input
                    type="text"
                    value={form.proyecto}
                    onChange={(e) => setForm({ ...form, proyecto: e.target.value })}
                    placeholder="Ej: Techo Solar Fase 1"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                    placeholder="Ej: Medellín"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                    placeholder="Ej: Antioquia"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consumo Mensual (kWh)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.consumoKwh}
                    onChange={(e) => setForm({ ...form, consumoKwh: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad de Paneles
                  </label>
                  <input
                    type="number"
                    value={form.paneles}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const pot = form.potenciaPanelW || 585;
                      const kwp = Number(((p * pot) / 1000).toFixed(2));
                      setForm({ ...form, paneles: p, kwp });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Potencia Pico (kWp)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.kwp}
                    onChange={(e) => setForm({ ...form, kwp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inversión Total (COP)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.inversionCop}
                    onChange={(e) => setForm({ ...form, inversionCop: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ahorro Mensual (COP)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.ahorroMensualCop}
                    onChange={(e) => setForm({ ...form, ahorroMensualCop: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Retorno Estimado (Años)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.retornoAnios}
                    onChange={(e) => setForm({ ...form, retornoAnios: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{modalCrear ? 'Crear Cotización' : 'Guardar Cambios'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR ELIMINAR (D)                                           */}
      {/* ========================================================================= */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                ¿Eliminar Cotización #{modalEliminar.id}?
              </h3>
              <p className="text-xs text-slate-400">
                Esta acción es irreversible y eliminará el registro de PostgreSQL para{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {modalEliminar.cliente}
                </strong>{' '}
                ({modalEliminar.proyecto}).
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95 transition-all"
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
