import { useMemo, useState, useEffect } from 'react';
import {
  Loader2,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Sun,
  Check,
  Award,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import {
  Cotizador2FormInputs,
  Cotizador2Results,
  RadiacionTipo,
  calculateCotizador2,
  tamanoPanelM2,
} from '../utils/cotizador2Engine';
import { generateProposalPdf } from '../utils/pdfGenerator';
import { fetchLiveTrm } from '../services/trmService';
import { fetchSolarRadiation } from '../services/solarRadiationService';
import { COLOMBIAN_CITIES, ColombianCity } from '../constants/colombianCities';
import { ColombiaMapPicker, MapLocation } from './ColombiaMapPicker';
import { Cotizador2LiveSummary } from './Cotizador2LiveSummary';
import { Cotizador2ResultsView } from './Cotizador2ResultsView';

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

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
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [trmLoading, setTrmLoading] = useState<boolean>(true);
  const [trmSource, setTrmSource] = useState<string>('');
  const [trmDate, setTrmDate] = useState<string>('');

  // Ubicación seleccionada en el mapa con HSP oficial (NASA POWER vía Backend)
  const [mapLocation, setMapLocation] = useState<(ColombianCity & { lat: number; lng: number; direccion: string }) | null>(null);
  const [hspLoading, setHspLoading] = useState(false);
  const [hspError, setHspError] = useState('');

  const handleMapSelect = async (loc: MapLocation) => {
    setHspLoading(true);
    setHspError('');
    try {
      const rad = await fetchSolarRadiation(loc.lat, loc.lng);
      setMapLocation({
        id: 'mapa',
        nombre: loc.municipio,
        departamento: loc.departamento,
        hsp: rad.hsp,
        hspMin: rad.hspMin,
        hspMax: rad.hspMax,
        lat: loc.lat,
        lng: loc.lng,
        direccion: loc.direccion,
      });
    } catch {
      setHspError('No se pudo consultar la radiación solar (NASA POWER). Intenta de nuevo.');
    } finally {
      setHspLoading(false);
    }
  };

  const selectedCity = useMemo<ColombianCity>(
    () => mapLocation || COLOMBIAN_CITIES.find((c) => c.id === 'medellin') || COLOMBIAN_CITIES[1],
    [mapLocation]
  );

  const hspPromedio = selectedCity.hsp;
  const hspMinimo = selectedCity.hspMin;
  const hspMaximo = selectedCity.hspMax;
  const currentCityHsp =
    inp.radiacionTipo === 'Minimo' ? hspMinimo : inp.radiacionTipo === 'Maximo' ? hspMaximo : hspPromedio;

  // Consumir TRM en vivo desde el Backend al iniciar
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

  const localResult = useMemo(() => {
    return calculateCotizador2({
      ...inp,
      beneficioTributario: true,
      financiacion: false,
      ciudad: selectedCity.nombre,
      departamento: selectedCity.departamento,
      radiacionPersonalizada: currentCityHsp,
    });
  }, [inp, selectedCity, currentCityHsp]);

  const [backendResult, setBackendResult] = useState<Cotizador2Results | null>(null);

  // Ejecutar los cálculos en el Backend usando la tabla public.formulas_sistema de PostgreSQL
  useEffect(() => {
    let active = true;
    fetch('/api/cotizaciones/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...inp,
        beneficioTributario: true,
        financiacion: false,
        ciudad: selectedCity.nombre,
        departamento: selectedCity.departamento,
        radiacionPersonalizada: currentCityHsp,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && data.activo) {
          setBackendResult(data);
        }
      })
      .catch(() => {
        if (active) setBackendResult(null);
      });

    return () => {
      active = false;
    };
  }, [inp, selectedCity, currentCityHsp]);

  const r = backendResult || localResult;
  const sis = r.activo;

  const handleGeneratePdf = async () => {
    if (!inp.consumoKwh || !inp.trm) {
      alert('Por favor completa al menos el consumo (kWh) y TRM para generar la cotización.');
      return;
    }
    try {
      setIsGeneratingPdf(true);

      // Guardar la cotización en PostgreSQL (public.cotizaciones)
      const token = localStorage.getItem('ticline_jwt_token');
      fetch('/api/cotizaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cliente: clientName.trim() || 'Cliente Solar',
          proyecto: projectName.trim() || 'Proyecto Solar',
          ciudad: selectedCity.nombre,
          departamento: selectedCity.departamento,
          consumoKwh: inp.consumoKwh,
          paneles: sis.paneles,
          kwp: sis.kwp,
          inversionCop: r.costoSolucionFinal,
          ahorroMensualCop: r.ahorroMensualCop,
        }),
      }).catch(() => {});

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
        costoSolucionCop: r.costoSolucionFinal,
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
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm transition-all duration-300 shadow-sm ${
                    isDone
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
                    className={`text-xs font-bold transition-colors ${
                      isCurrent
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

        <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {currentStep < 5 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Ubicación del Proyecto en Colombia
                    </label>
                  </div>

                  <ColombiaMapPicker
                    value={mapLocation ? { lat: mapLocation.lat, lng: mapLocation.lng } : null}
                    onSelect={handleMapSelect}
                  />
                  {hspLoading && (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> Consultando radiación solar de la ubicación...
                    </div>
                  )}
                  {hspError && <div className="text-xs text-red-500">{hspError}</div>}
                  {mapLocation && !hspLoading && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-700 dark:text-slate-200">
                      <b>
                        {mapLocation.nombre}, {mapLocation.departamento}
                      </b>{' '}
                      — {mapLocation.direccion} ({mapLocation.lat.toFixed(5)}, {mapLocation.lng.toFixed(5)})
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 pt-1">
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
                        Radiación aplicada: {r.radiacion.toFixed(2)} Horas Sol Pico (HSP).
                      </span>
                    </div>
                  </div>
                </div>

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
                        Factura estimada:{' '}
                        <strong className="text-slate-700 dark:text-slate-200">
                          $ {nf((inp.consumoKwh ?? 0) * r.valorKwhFactura)} COP/mes
                        </strong>
                      </span>
                    </div>

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

                  <div className="pt-1">
                    <span className="text-[11px] text-slate-400 block mb-1.5">
                      O pulsa un consumo de referencia rápida:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[150, 250, 400, 800, 1500, 3000].map((kwhVal) => (
                        <button
                          key={kwhVal}
                          type="button"
                          onClick={() => set({ consumoKwh: kwhVal })}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            inp.consumoKwh === kwhVal
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
                      PostgreSQL
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Dependiendo de la <strong>potencia del panel</strong> ({inp.potenciaPanel}W) se calcula el{' '}
                    <strong>número de paneles</strong> necesarios ({r.requerido.paneles} paneles), y dependiendo del número de paneles y del{' '}
                    <strong>tamaño de cada panel</strong> ({tamanoPanelM2(inp.potenciaPanel ?? 620)} m²), se calcula el{' '}
                    <strong>área requerida</strong> en cubierta ({nf(r.requerido.areaRequerida, 1)} m²).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          1. Potencia del Panel
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                          1
                        </span>
                      </div>
                      <div className="text-xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                        {inp.potenciaPanel} <span className="text-xs font-bold text-slate-400">Watts</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                        Tamaño: {tamanoPanelM2(inp.potenciaPanel ?? 620)} m² / panel
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          2. Nro. de Paneles
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                          2
                        </span>
                      </div>
                      <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                        {r.requerido.paneles} <span className="text-xs font-bold text-slate-400">Paneles</span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 font-mono">
                        REDONDEAR.PAR({nf(r.requerido.potenciaRequeridaW ?? 0, 0)}W / {inp.potenciaPanel}W)
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          3. Área Requerida
                        </span>
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center">
                          3
                        </span>
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

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dimensionamiento resultante en Wp
                  </label>
                  <div className="h-[42px] px-3.5 flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-extrabold text-sm tabular-nums">
                    <span>
                      {r.requerido.paneles} paneles de {inp.potenciaPanel}W = {nf(r.requerido.wpInstalados)} Wp (
                      {nf(r.requerido.kwp, 2)} kWp)
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">
                      Capacidad suficiente para generar el {pct(r.requerido.ahorro)} de tu consumo.
                    </span>
                  </div>
                </div>

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

          <Cotizador2LiveSummary r={r} selectedCity={selectedCity} />
        </div>
      ) : (
        <Cotizador2ResultsView
          r={r}
          inp={inp}
          selectedCity={selectedCity}
          projectName={projectName}
          clientName={clientName}
          isGeneratingPdf={isGeneratingPdf}
          onGeneratePdf={handleGeneratePdf}
          onModifyData={() => setCurrentStep(1)}
        />
      )}
    </div>
  );
}
