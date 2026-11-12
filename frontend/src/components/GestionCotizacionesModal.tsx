import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Search, 
  Calendar, 
  MapPin, 
  Zap, 
  DollarSign, 
  Loader2, 
  RefreshCw, 
  User, 
  ExternalLink,
  Layers,
  ArrowRight
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
  paneles: number;
  kwp: number;
  inversionCop: number;
  ahorroMensualCop: number;
  retornoAnios?: number;
  tirPct?: number;
  fechaCreacion: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectCotizacion?: (cot: CotizacionItem) => void;
}

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

const cop = (v: number) => `$ ${nf(v)} COP`;

export const GestionCotizacionesModal: React.FC<Props> = ({ isOpen, onClose, onSelectCotizacion }) => {
  const [cotizaciones, setCotizaciones] = useState<CotizacionItem[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarCotizaciones = () => {
    const token = sessionStorage.getItem('solar_auth_token') || localStorage.getItem('solar_auth_token');
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
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Error cargando cotizaciones');
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
    if (isOpen) {
      cargarCotizaciones();
    }
  }, [isOpen]);

  const filtradas = cotizaciones.filter((c) => {
    const term = filtro.toLowerCase();
    return (
      (c.cliente && c.cliente.toLowerCase().includes(term)) ||
      (c.proyecto && c.proyecto.toLowerCase().includes(term)) ||
      (c.ciudad && c.ciudad.toLowerCase().includes(term)) ||
      (c.usuarioNombre && c.usuarioNombre.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gestionar tus Cotizaciones
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Historial Guardado
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consulta y gestiona las propuestas solares registradas en PostgreSQL
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={cargarCotizaciones}
              title="Recargar cotizaciones"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro y Búsqueda */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por cliente, proyecto, ciudad o asesor..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
            />
          </div>
          <span className="text-xs text-slate-400 self-end sm:self-auto font-medium">
            Total: <strong className="text-emerald-500">{filtradas.length}</strong> cotizaciones
          </span>
        </div>

        {/* Listado de Cotizaciones */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
              <span className="text-sm">Cargando cotizaciones desde PostgreSQL...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 text-center">
              {error}
            </div>
          ) : filtradas.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-slate-400">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">No se encontraron cotizaciones</p>
              <p className="text-xs text-slate-500">
                Al descargar una propuesta en PDF desde la calculadora, quedará automáticamente guardada aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filtradas.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {c.proyecto || 'Proyecto Solar'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                        {c.cliente || 'Cliente General'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ID #{c.id}
                    </span>
                  </div>

                  {/* Detalles Técnicos Clave */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{c.ciudad}, {c.departamento}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{c.kwp} kWp ({c.paneles} paneles)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cop(Number(c.inversionCop))}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.usuarioNombre || c.creadoPor || 'Sistema'}</span>
                    </div>
                  </div>

                  {/* Pie de tarjeta con Fecha */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.fechaCreacion).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-emerald-500 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Ahorro: {cop(Number(c.ahorroMensualCop))}/mes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

