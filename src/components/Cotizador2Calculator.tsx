import { useMemo, useState, useEffect } from 'react';
import {
  FileDown,
  Loader2,
  Calculator,
  Zap,
  CheckCircle2,
  Leaf,
  DollarSign,
  Layers,
  ArrowRight,
  ArrowLeft,
  MapPin,
  RotateCcw,
  Sun,
  TrendingUp,
  Check,
  Award,
  Sparkles,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  Cotizador2FormInputs,
  RadiacionTipo,
  calculateCotizador2,
  tamanoPanelM2,
} from '../utils/cotizador2Engine';
import { generateProposalPdf } from '../utils/pdfGenerator';
import { fetchLiveTrm } from '../services/trmService';
import { COLOMBIAN_CITIES } from '../constants/colombianCities';

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

const cop = (v: number) => `$ ${nf(v)} COP`;
const pct = (v: number) => (Number.isFinite(v) && v > 0 ? `${nf(v * 100, 2)}%` : '0%');

const fieldStyle =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all';

export const SMART_INITIAL_INPUTS: Cotizador2FormInputs = {
  ciudad: 'medellin',
  departamento: 'Antioquia',
  trm: 0,
  consumoKwh: 0,
  transformador: 75,
  ahorroDeseado: 1,
  areaDisponible: 54,
  criterioDimensionamiento: 'consumo',
  radiacionTipo: 'Promedio',
  potenciaPanel: 620,
  turnosOperacion: 2,
  beneficioTributario: true,
  financiacion: false,
  mantenimientoGratis: true,
  valorCredito: 0,
  plazoMeses: 120,
  tasaMensual: 0.013,
  ivaPct: 0.11,
  mantenimientoPct: 0.012,
  inflacion: 0.05,
  beneficioFiscal: 0.5,
  depreciacionAcelerada: 0.2,
  tasaImpositiva: 0.35,
};

export function Cotizador2Calculator() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [inp, setInp] = useState<Cotizador2FormInputs>(SMART_INITIAL_INPUTS);
  const [selectedCityId, setSelectedCityId] = useState<string>('medellin');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeResultsTab, setActiveResultsTab] = useState<'formulas' | 'comparativa' | 'ambiental' | 'financiero'>('formulas');
  const [trmLoading, setTrmLoading] = useState<boolean>(true);
  const [trmSource, setTrmSource] = useState<string>('');
  const [trmDate, setTrmDate] = useState<string>('');

  // Ciudad seleccionada de Colombia
  const selectedCity = useMemo(() => {
    return COLOMBIAN_CITIES.find((c) => c.id === selectedCityId) || COLOMBIAN_CITIES[1];
  }, [selectedCityId]);

  const hspPromedio = selectedCity.hsp;
  const hspMinimo = selectedCity.hspMin;
  const hspMaximo = selectedCity.hspMax;
  const currentCityHsp = inp.radiacionTipo === 'Minimo' ? hspMinimo : inp.radiacionTipo === 'Maximo' ? hspMaximo : hspPromedio;

  // Consumir API de TRM oficial en vivo al iniciar
  useEffect(() => {
    let isMounted = true;
    async function loadTrm() {
      setTrmLoading(true);
      try {
        const res = await fetchLiveTrm();
        if (isMounted) {
          setInp((prev) => ({ ...prev, trm: res.valor }));
          setTrmSource(res.fuente);
          setTrmDate(res.fecha);
        }
      } catch (err) {
        console.error('Error al consultar TRM en vivo:', err);
      } finally {
        if (isMounted) {
          setTrmLoading(false);
        }
      }
    }
    loadTrm();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReloadTrm = async () => {
    setTrmLoading(true);
    try {
      const res = await fetchLiveTrm();
      setInp((prev) => ({ ...prev, trm: res.valor }));
      setTrmSource(res.fuente);
      setTrmDate(res.fecha);
    } catch (err) {
      console.error('Error al recargar TRM:', err);
    } finally {
      setTrmLoading(false);
    }
  };

  const set = (u: Partial<Cotizador2FormInputs>) => setInp((p) => ({ ...p, ...u }));

  const r = useMemo(() => {
    return calculateCotizador2({
      ...inp,
      beneficioTributario: true,
      financiacion: false,
      ciudad: selectedCity.nombre,
      departamento: selectedCity.departamento,
      radiacionPersonalizada: currentCityHsp,
    });
  }, [inp, selectedCity, currentCityHsp]);

  const sis = r.activo;

  const handleGeneratePdf = async () => {
    if (!inp.consumoKwh || !inp.trm) {
      alert('Por favor completa al menos el consumo (kWh) y TRM para generar la cotización.');
      return;
    }
    try {
      setIsGeneratingPdf(true);
      await generateProposalPdf({
        projectName: projectName.trim() || 'Proyecto Solar',
        clientName: clientName.trim() || 'Cliente Solar',
        city: selectedCity.nombre,
        department: selectedCity.departamento,
        trm: inp.trm,
        consumoKwh: inp.consumoKwh,
        costoKwhBase: r.valorKwhFactura,
        valorKwhFactura: r.valorKwhFactura,
        radiacion: r.radiacion,
        potenciaPanel: inp.potenciaPanel || 620,
        panelCount: sis.paneles,
        kwp: sis.kwp,
        areaRequeridaM2: sis.areaRequerida,
        produccionMensualKwh: sis.produccionMensual,
        produccionAnualKwh: sis.produccionMensual * 12,
        ahorroPct: sis.ahorro,
        ahorroCo2Ton: r.ahorroCo2,
        arboles: r.arboles,
        costoSolucionCop: r.costoSolucion,
        costoVatioCop: r.costoVatio * inp.trm,
        ahorroMensualCop: r.ahorroMensualCop,
        ahorro30AniosCop: r.ahorro30Anios,
        retornoMeses: r.retornoMeses,
        retornoAnios: r.retornoAnios,
        tirPct: r.tir,
        flujoAnual: r.flujoAnual,
      });
    } catch (err) {
      console.error('Error generating proposal PDF:', err);
      alert('Ocurrió un error al generar el PDF. Por favor verifique los datos e intente nuevamente.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Proyecto y Ubicación', desc: 'Ciudad de Colombia' },
    { num: 2, title: 'Consumo y Factura', desc: 'Energía mensual' },
    { num: 3, title: 'Tecnología y Techo', desc: 'Paneles y Área' },
    { num: 4, title: 'Finanzas y Ley 1715', desc: 'TRM y Beneficios' },
    { num: 5, title: 'Estudio y Propuesta', desc: 'Resultados y PDF' },
  ];

  return (
    <div className="space-y-8">
      {/* Stepper Superior Interactivo */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none">
          {stepsList.map((st) => {
            const isDone = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer min-w-[130px] sm:min-w-0 flex-1"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 shadow-sm ${isDone
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-500/20'
                    : isCurrent
                      ? 'bg-gradient-to-tr from-emerald-400 via-teal-400 to-amber-300 text-slate-950 ring-4 ring-emerald-400/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                >
                  {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : st.num}
                </div>
                <div className="hidden md:block">
                  <div
                    className={`text-xs font-bold transition-colors ${isCurrent
                      ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                      }`}
                  >
                    {st.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{st.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra de progreso animada */}
        <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Cuerpo Principal del Asistente */}
      {currentStep < 5 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario Guiado por Pasos */}
          <div className="lg:col-span-8 space-y-6">
            {/* PASO 1: PROYECTO Y UBICACIÓN */}
            {currentStep === 1 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Paso 1 de 5
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Datos del Proyecto y Ciudad de Colombia
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingresa los datos identificadores y selecciona la ciudad de Colombia para calibrar automáticamente la radiación solar satelital (HSP).
                  </p>
                </div>

                {/* Nombres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre del Proyecto
                    </label>
                    <input
                      type="text"
                      className={fieldStyle}
                      value={projectName}
                      placeholder="Ej: Finca Bolombolo / Casa Campestre"
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nombre del Cliente / Empresa
                    </label>
                    <input
                      type="text"
                      className={fieldStyle}
                      value={clientName}
                      placeholder="Ej: Juan Pérez / Inversiones S.A.S."
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Selección Exclusiva de Ciudades de Colombia */}
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Ciudad de Colombia (Exclusivo Territorio Nacional)
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {COLOMBIAN_CITIES.length} ciudades y municipios disponibles
                    </span>
                  </div>

                  {/* Dropdown completo con todas las ciudades de Colombia */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Seleccionar Municipio o Ciudad de Colombia
                      </label>
                      <select
                        className={fieldStyle}
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                      >
                        {COLOMBIAN_CITIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} ({c.departamento}) — {c.hsp.toFixed(2)} HSP
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Radiación solar satelital oficial IDEAM / UPME para {selectedCity.nombre}.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Criterio de Radiación Solar (HSP)
                      </label>
                      <select
                        className={fieldStyle}
                        value={inp.radiacionTipo}
                        onChange={(e) => set({ radiacionTipo: e.target.value as RadiacionTipo })}
                      >
                        <option value="Promedio">Promedio ({hspPromedio.toFixed(2)} HSP - Recomendado)</option>
                        <option value="Minimo">Mínimo / Época Lluviosa ({hspMinimo.toFixed(2)} HSP)</option>
                        <option value="Maximo">Máximo / Época Seca ({hspMaximo.toFixed(2)} HSP)</option>
                      </select>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold block">
                        Radiación aplicada al dimensionamiento: {r.radiacion.toFixed(2)} Horas Sol Pico (HSP).
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Siguiente */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <span>Siguiente: Consumo y Factura</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: CONSUMO Y FACTURA */}
            {currentStep === 2 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Paso 2 de 5
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Consumo Energético Mensual
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Indica cuántos kWh consumes al mes según tu factura de servicios públicos.
                  </p>
                </div>

                {/* Consumo Input + Slider */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                        Consumo promedio mensual
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-display">
                          {nf(inp.consumoKwh ?? 0)}
                        </span>
                        <span className="text-sm font-bold text-slate-500">kWh/mes</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Factura estimada: <strong className="text-slate-700 dark:text-slate-200">$ {nf((inp.consumoKwh ?? 0) * r.valorKwhFactura)} COP/mes</strong>
                      </span>
                    </div>

                    {/* Entrada numérica directa */}
                    <div className="w-full sm:w-56">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ingresa el valor exacto (kWh):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          step="1"
                          placeholder="0"
                          value={inp.consumoKwh === undefined || inp.consumoKwh === 0 ? '' : inp.consumoKwh}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0);
                            set({ consumoKwh: val });
                          }}
                          className={`${fieldStyle} pr-12 text-base font-extrabold`}
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                          kWh
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Slider interactivo que arranca en 0 */}
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="25"
                    value={inp.consumoKwh ?? 0}
                    onChange={(e) => set({ consumoKwh: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>0 kWh (Inicial)</span>
                    <span>1.500 kWh (Comercio medio)</span>
                    <span>5.000 kWh (Industrial)</span>
                  </div>

                  {/* Selector de Chips Rápidos de Referencia */}
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 block mb-1.5">O pulsa un consumo de referencia rápida:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[150, 250, 400, 800, 1500, 3000].map((kwhVal) => (
                        <button
                          key={kwhVal}
                          type="button"
                          onClick={() => set({ consumoKwh: kwhVal })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${inp.consumoKwh === kwhVal
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                        >
                          {kwhVal} kWh
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ahorro deseado y Transformador */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Porcentaje de Ahorro Deseado
                      </label>
                      <span className="text-xs font-extrabold text-emerald-500">
                        {Math.round((inp.ahorroDeseado ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="1.0"
                      step="0.05"
                      value={inp.ahorroDeseado ?? 1}
                      onChange={(e) => set({ ahorroDeseado: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Por defecto se busca cubrir el 100% del consumo.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Capacidad Transformador Existente (kVA)
                    </label>
                    <input
                      type="number"
                      className={fieldStyle}
                      value={inp.transformador ?? 75}
                      onChange={(e) => set({ transformador: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Capacidad del transformador de conexión eléctrica (estándar 75 kVA).
                    </span>
                  </div>
                </div>

                {/* Botones de Navegación y Enlace Visor EPM */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="order-2 sm:order-1 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <a
                    href="https://maps.epm.com.co/ETER/Visor/Visor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-1 sm:order-2 inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-sm group"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Consultar Visor de Red EPM (ETER)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="order-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <span>Siguiente: Tecnología y Techo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: TECNOLOGÍA Y TECHO */}
            {currentStep === 3 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Paso 3 de 5
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Tecnología Fotovoltaica y Espacio en Techo
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingresa manualmente la potencia de los módulos solares en Watts (W) y verifica el área requerida en cubierta (calculada siempre a 3.2 m² por panel).
                  </p>
                </div>

                {/* Apartado Manual de Potencia del Panel */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label htmlFor="potencia-panel-input" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                        Potencia del Módulo Solar (Watts)
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Ingresa manualmente el número en Watts (W) de cada panel fotovoltaico.
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cálculo fijado a 3.2 m² por panel</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="relative">
                      <input
                        id="potencia-panel-input"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ej: 620"
                        className={`${fieldStyle} pr-16 text-lg font-black tabular-nums`}
                        value={inp.potenciaPanel ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          set({ potenciaPanel: val });
                        }}
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                        Watts (W)
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm">
                        3.2
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          Superficie fijada por módulo
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          El dimensionamiento y el área de cubierta siempre se calculan sobre 3.2 m² por panel.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cadena de Cálculo Explicada: Potencia -> Nro Paneles -> Área Requerida */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-emerald-950/40 dark:via-slate-950/80 dark:to-teal-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                        Cálculo Dinámico: Potencia → Nro. Paneles → Área Requerida
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Excel Oficial
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Dependiendo de la <strong>potencia del panel</strong> ({inp.potenciaPanel}W) se calcula el <strong>número de paneles</strong> necesarios ({r.requerido.paneles} paneles), y dependiendo del número de paneles y del <strong>tamaño de cada panel</strong> ({tamanoPanelM2(inp.potenciaPanel ?? 620)} m²), se calcula el <strong>área requerida</strong> en cubierta ({nf(r.requerido.areaRequerida, 1)} m²).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Paso 1: Potencia */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          1. Potencia del Panel
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">1</span>
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {inp.potenciaPanel} <span className="text-xs font-bold text-slate-400">Watts</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        Tamaño: {tamanoPanelM2(inp.potenciaPanel ?? 620)} m² / panel
                      </span>
                    </div>

                    {/* Paso 2: Paneles */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          2. Nro. de Paneles
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">2</span>
                      </div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                        {r.requerido.paneles} <span className="text-xs font-bold text-slate-400">Paneles</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 font-mono">
                        REDONDEAR.PAR({nf(r.requerido.potenciaRequeridaW ?? 0, 0)}W / {inp.potenciaPanel}W)
                      </span>
                    </div>

                    {/* Paso 3: Área */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          3. Área Requerida
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">3</span>
                      </div>
                      <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
                        {nf(r.requerido.areaRequerida, 1)} <span className="text-xs font-bold text-slate-400">m²</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 font-mono">
                        {r.requerido.paneles} paneles × {tamanoPanelM2(inp.potenciaPanel ?? 620)} m²
                      </span>
                    </div>
                  </div>
                </div>


                {/* Dimensionamiento resultante en Wp */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dimensionamiento resultante en Wp
                  </label>
                  <div className="h-[42px] px-3.5 flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-extrabold text-sm tabular-nums">
                    <span>{r.requerido.paneles} paneles de {inp.potenciaPanel}W = {nf(r.requerido.wpInstalados)} Wp ({nf(r.requerido.kwp, 2)} kWp)</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                      Capacidad suficiente para generar el {pct(r.requerido.ahorro)} de tu consumo.
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block sm:hidden mt-1">
                    Capacidad suficiente para generar el {pct(r.requerido.ahorro)} de tu consumo.
                  </span>
                </div>

                {/* Botones de Navegación */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <span>Siguiente: Finanzas y Ley 1715</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4: FINANZAS Y LEY 1715 */}
            {currentStep === 4 && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Paso 4 de 5
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Parámetros Financieros y Ley 1715
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Configura la tasa de cambio TRM y conoce los incentivos tributarios de la Ley 1715.
                  </p>
                </div>

                {/* TRM Oficial del Día */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      TRM Oficial del Día (COP / USD)
                    </label>
                    <button
                      type="button"
                      onClick={handleReloadTrm}
                      disabled={trmLoading}
                      title="Actualizar TRM en vivo desde la API"
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${trmLoading ? 'animate-spin' : ''}`} />
                      <span>{trmLoading ? 'Consultando...' : 'Actualizar'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className={`${fieldStyle} font-extrabold pr-16`}
                      value={inp.trm === 0 || inp.trm === undefined ? '' : inp.trm}
                      placeholder={trmLoading ? 'Consultando API...' : '0'}
                      onChange={(e) => set({ trm: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                      COP
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    {trmLoading ? (
                      <span className="text-amber-500 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Consultando API en vivo...
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        API en vivo: {trmSource || 'Superintendencia Financiera'}
                      </span>
                    )}
                    <span className="text-slate-400">
                      {trmDate ? new Date(trmDate).toLocaleDateString('es-CO') : ''}
                    </span>
                  </div>
                </div>

                {/* Tarjeta de Beneficio Tributario Ley 1715 */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-slate-50/50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-slate-900/40 border border-emerald-500/30 dark:border-emerald-500/25 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Incentivos Tributarios Ley 1715 de 2014
                        </h4>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          Deducción especial de renta (50%) + Depreciación acelerada
                        </span>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-xs shrink-0 self-start sm:self-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Beneficio aplicado correctamente</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Permite descontar hasta el 50% de la inversión de la renta líquida durante los primeros 15 años y depreciar aceleradamente los equipos hasta un 20% anual, reduciendo drásticamente el tiempo de retorno de inversión.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-500/20 dark:border-emerald-500/15">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 px-3 py-2 rounded-xl border border-emerald-500/15">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Deducción 50% en Renta</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 px-3 py-2 rounded-xl border border-emerald-500/15">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Depreciación acelerada (20%)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 px-3 py-2 rounded-xl border border-emerald-500/15">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Exención Aranceles e IVA</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Navegación */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ver Estudio y Resultados Finales</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Tarjeta Lateral de Resumen Dinámico en Tiempo Real */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${r.requerido.paneles > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Dimensionamiento en Vivo
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Cotizador2.xlsx
                </span>
              </div>

              {/* Badges de Estado */}
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Ciudad y Radiación (Colombia)</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {selectedCity.nombre}, {selectedCity.departamento}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {r.radiacion.toFixed(2)} HSP
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Potencia y Paneles Requeridos</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {r.requerido.paneles} paneles
                    </span>
                    <span className="text-sm font-extrabold text-emerald-500">
                      {nf(r.requerido.kwp, 2)} kWp
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Área requerida en cubierta: {nf(r.requerido.areaRequerida, 1)} m²
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Ahorro Mensual Estimado</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {cop(r.ahorroMensualCop)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Generación: {nf(r.requerido.produccionMensual, 1)} kWh/mes ({pct(r.requerido.ahorro)} de cobertura)
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Inversión Llave en Mano</span>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {cop(r.costoSolucion)}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Retorno: {nf(r.retornoAnios)} años ({nf(r.retornoMeses)} meses)</span>
                    <span className="font-bold text-amber-500">TIR: {pct(r.tir)}</span>
                  </div>
                </div>

                {/* Notificación Dinámica en Vivo */}
                {r.requerido.paneles === 0 ? (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Inicia en cero. Al ingresar tus datos en el formulario se calculará automáticamente en tiempo real.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Dimensionamiento actualizado en vivo con tus datos.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PASO 5: ESTUDIO COMPLETO Y PROPUESTA COMERCIAL FINAL */
        <div className="space-y-8 animate-fadeIn">
          {/* Banner de Éxito y Resumen del Proyecto */}
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Estudio Fotovoltaico Dimensionado con Éxito
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  {projectName || 'Proyecto Solar Fotovoltaico'}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Cliente: <strong className="text-white">{clientName || 'Cliente Propietario'}</strong> · Ciudad: <strong className="text-emerald-400">{selectedCity.nombre}, {selectedCity.departamento}</strong> ({r.radiacion.toFixed(2)} HSP) · Colombia
                </p>
              </div>

              {/* Botón Principal de Descarga de PDF */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  id="btn-generar-pdf-cotizacion"
                  onClick={handleGeneratePdf}
                  disabled={isGeneratingPdf}
                  className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generando Propuesta Oficial (8 Páginas)...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-5 h-5 stroke-[2.5]" />
                      <span>Descargar Cotización Oficial en PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Modificar Datos</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPIs Gigantes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Sun className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 block">
                {sis.criterio === 'area' ? 'Sistema por Techo' : 'Sistema Recomendado'}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {sis.paneles} <span className="text-sm font-bold text-slate-400">Paneles</span>
              </div>
              <div className="text-xs font-extrabold text-emerald-500 mt-1">
                {nf(sis.kwp, 2)} kWp ({nf(sis.wpInstalados)} Wp)
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Área cubierta: {nf(sis.areaRequerida, 1)} m² ({inp.potenciaPanel}W c/u)
              </span>
            </div>

            {/* KPI 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 block">Producción de Energía</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {nf(sis.produccionMensual, 1)} <span className="text-sm font-bold text-slate-400">kWh/mes</span>
              </div>
              <div className="text-xs font-extrabold text-blue-500 mt-1">
                {pct(sis.ahorro)} Cobertura de Consumo
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Generación anual: {nf(sis.produccionMensual * 12)} kWh/año
              </span>
            </div>

            {/* KPI 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 block">Inversión Llave en Mano</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {cop(r.costoSolucion)}
              </div>
              <div className="text-xs font-extrabold text-amber-500 mt-1">
                $ {r.costoVatio} USD/Wp (TRM ${nf(inp.trm ?? 0)})
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Ahorro mensual: {cop(r.ahorroMensualCop)}
              </span>
            </div>

            {/* KPI 4 */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 block">Retorno de Inversión (ROI)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                {nf(r.retornoAnios)} <span className="text-sm font-bold text-slate-400">Años ({nf(r.retornoMeses)} meses)</span>
              </div>
              <div className="text-xs font-extrabold text-purple-500 mt-1">
                TIR estimada: {pct(r.tir)}
              </div>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Ahorro acumulado 30 años: {cop(r.ahorro30Anios)}
              </span>
            </div>
          </div>

          {/* Pestañas Interactivas de Detalles */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
            {/* Barra de Pestañas */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
              {[
                { id: 'formulas', label: 'Memoria de Cálculo y Fórmulas', icon: Calculator },
                { id: 'comparativa', label: 'Comparativa por Área vs Consumo', icon: Layers },
                { id: 'ambiental', label: 'Impacto Ambiental y CO₂', icon: Leaf },
                { id: 'financiero', label: 'Proyección Financiera 30 Años', icon: TrendingUp },
              ].map((tb) => {
                const Icon = tb.icon;
                const isActive = activeResultsTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    type="button"
                    onClick={() => setActiveResultsTab(tb.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: FÓRMULAS PASO A PASO EXCEL OFICIAL */}
            {activeResultsTab === 'formulas' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Desglose Matemático de Fórmulas (Cotizador2.xlsx)
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fórmulas directas de ingeniería ejecutadas con tus datos en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Paso 1 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">1</span>
                        Potencia Requerida (P)
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {nf(r.requerido.potenciaRequeridaW ?? 0, 1)} W
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      P = (Consumo × 1000) / (Radiación × 30) = ({inp.consumoKwh ?? 0} × 1000) / ({nf(r.radiacion, 2)} × 30)
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">2</span>
                        Cantidad de Paneles (Redondeo Par)
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {r.requerido.paneles} paneles
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Paneles = REDONDEAR.PAR(P / CapacidadPanel) = REDONDEAR.PAR({nf(r.requerido.potenciaRequeridaW ?? 0, 1)} / {inp.potenciaPanel ?? 620})
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">3</span>
                        Potencia Pico Ofrecida y kWp
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {nf(r.requerido.wpInstalados)} Wp ({nf(r.requerido.kwp, 2)} kWp)
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Potencia = {r.requerido.paneles} paneles × {inp.potenciaPanel ?? 620} W | kWp = {nf(r.requerido.wpInstalados)} / 1000
                    </div>
                  </div>

                  {/* Paso 4 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">4</span>
                        Área Requerida en Cubierta
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {nf(r.requerido.areaRequerida, 1)} m²
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Área = REDONDEAR.PAR({r.requerido.paneles} × {tamanoPanelM2(inp.potenciaPanel ?? 620)}) = {nf(r.requerido.areaRequerida, 1)} m²
                    </div>
                  </div>

                  {/* Paso 5 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">5</span>
                        Producción Mensual Estimada
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {nf(r.requerido.produccionMensual, 1)} kWh/mes
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Producción = ({r.requerido.paneles} × {inp.potenciaPanel ?? 620} × {nf(r.radiacion, 2)} × 30) / 1000
                    </div>
                  </div>

                  {/* Paso 6 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">6</span>
                        Tarifa Factura y Ahorro Mensual
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {cop(r.ahorroMensualCop)}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Tarifa: ${nf(r.valorKwhFactura, 2)} COP/kWh | Ahorro = {nf(r.generacionMensualConsumir)} kWh × ${nf(r.valorKwhFactura, 2)}
                    </div>
                  </div>

                  {/* Paso 7 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">7</span>
                        Costo de la Solución (Inversión)
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {cop(r.costoSolucion)}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Inversión = {nf(r.requerido.wpInstalados)} Wp × ${r.costoVatio} USD/Wp × ${nf(inp.trm ?? 0)} COP
                    </div>
                  </div>

                  {/* Paso 8 */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">8</span>
                        Retorno de Inversión y TIR Ley 1715
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {nf(r.retornoAnios)} años ({nf(r.retornoMeses)} meses) · TIR: {pct(r.tir)}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      Modelo 30 años con ahorro de energía, deducción de renta (50%) y depreciación acelerada
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMPARATIVA SISTEMAS */}
            {activeResultsTab === 'comparativa' && (
              <div className="space-y-4">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Comparativa de Sistemas: Requerido por Consumo vs Disponible por Área de Techo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tarjeta Requerido */}
                  <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        Sistema Requerido por Consumo
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                        Óptimo 100%
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-emerald-500/10">
                        <span className="text-slate-500">Paneles recomendados:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{r.requerido.paneles} paneles</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-500/10">
                        <span className="text-slate-500">Potencia Pico (kWp):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.requerido.kwp, 2)} kWp</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-500/10">
                        <span className="text-slate-500">Área requerida en cubierta:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.requerido.areaRequerida, 1)} m²</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-emerald-500/10">
                        <span className="text-slate-500">Producción mensual:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.requerido.produccionMensual, 1)} kWh</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Porcentaje de ahorro:</span>
                        <span className="font-extrabold text-emerald-500">{pct(r.requerido.ahorro)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tarjeta Por Área */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
                        Sistema Limitado por Área Ingresada ({inp.areaDisponible} m²)
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400">
                        Capacidad de Techo
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                        <span className="text-slate-500">Paneles que caben:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{r.porArea.paneles} paneles</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                        <span className="text-slate-500">Potencia en área (kW):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.porArea.kwp, 2)} kWp</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                        <span className="text-slate-500">Área ocupada:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.porArea.areaRequerida, 1)} m²</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/80">
                        <span className="text-slate-500">Producción mensual máxima:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{nf(r.porArea.produccionMensual, 1)} kWh</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Ahorro alcanzable:</span>
                        <span className="font-extrabold text-blue-500">{pct(r.porArea.ahorro)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: IMPACTO AMBIENTAL */}
            {activeResultsTab === 'ambiental' && (
              <div className="space-y-4">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Beneficios Ecológicos y Reducción de Emisiones
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Leaf className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Emisiones de CO₂ Evitadas</span>
                      <div className="text-3xl font-black text-white mt-1 tabular-nums">
                        {nf(r.ahorroCo2, 2)} <span className="text-sm font-bold text-emerald-400">ton/año</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Equivalente a más de {nf(r.ahorroCo2 * 30, 1)} toneladas de CO₂ en 30 años de vida útil.
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-slate-900 to-slate-900 border border-teal-500/30 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                      <Sun className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Árboles Adultos Equivalentes</span>
                      <div className="text-3xl font-black text-white mt-1 tabular-nums">
                        {Math.round(r.arboles)} <span className="text-sm font-bold text-teal-400">árboles plantados</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Efecto de absorción de carbono en reforestación certificada.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MODELO FINANCIERO 30 AÑOS */}
            {activeResultsTab === 'financiero' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Flujo de Caja y Rentabilidad Financiera a 30 Años
                  </h4>
                  <span className="text-xs font-bold text-emerald-500">
                    Ahorro Acumulado Total: {cop(r.ahorro30Anios)}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold">
                      <tr>
                        <th className="py-3 px-4">Año</th>
                        <th className="py-3 px-4">Flujo Neto Anual (COP)</th>
                        <th className="py-3 px-4">Flujo Acumulado (COP)</th>
                        <th className="py-3 px-4">Beneficio Ley 1715</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(r.flujoAnual || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            Ingresa tu consumo en el Paso 2 para generar la tabla de flujo de caja y rentabilidad a 30 años.
                          </td>
                        </tr>
                      ) : (
                        (r.flujoAnual || []).slice(0, 10).map((fa) => (
                          <tr key={fa.anio} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                              Año {fa.anio}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {cop(fa.flujo)}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                              {cop(fa.acumulado)}
                            </td>
                            <td className="py-2.5 px-4 text-slate-400">
                              {fa.anio <= 5 ? 'Deducción Renta Activa' : 'Ahorro Eléctrico Puro'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-400">
                  * Mostrando los primeros 10 años del modelo financiero de 30 años. Se incluye inflación energética proyectada del 5% anual y degradación del panel fotovoltaico del 0.5% anual.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
