import { useState } from 'react';
import {
  FileDown,
  Loader2,
  Calculator,
  Zap,
  CheckCircle2,
  Leaf,
  DollarSign,
  Layers,
  RotateCcw,
  Sun,
  TrendingUp,
} from 'lucide-react';
import {
  Cotizador2FormInputs,
  Cotizador2Results,
  tamanoPanelM2,
} from '../utils/cotizador2Engine';
import { ColombianCity } from '../constants/colombianCities';

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

const cop = (v: number) => `$ ${nf(v)} COP`;
const pct = (v: number) => (Number.isFinite(v) && v > 0 ? `${nf(v * 100, 2)}%` : '0%');

interface Props {
  r: Cotizador2Results;
  inp: Cotizador2FormInputs;
  selectedCity: ColombianCity;
  projectName: string;
  clientName: string;
  isGeneratingPdf: boolean;
  saveStatus?: { type: 'ok' | 'error'; text: string } | null;
  onGeneratePdf: () => void;
  onModifyData: () => void;
}

export function Cotizador2ResultsView({
  r,
  inp,
  selectedCity,
  projectName,
  clientName,
  isGeneratingPdf,
  saveStatus,
  onGeneratePdf,
  onModifyData,
}: Props) {
  const [activeResultsTab, setActiveResultsTab] = useState<'formulas' | 'comparativa' | 'ambiental' | 'financiero'>('formulas');
  const sis = r.activo;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner de Éxito y Resumen del Proyecto */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Estudio Fotovoltaico Dimensionado con Éxito (PostgreSQL)
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {projectName || 'Proyecto Solar Fotovoltaico'}
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Cliente: <strong className="text-white">{clientName || 'Cliente Propietario'}</strong> · Ciudad:{' '}
              <strong className="text-emerald-400">
                {selectedCity.nombre}, {selectedCity.departamento}
              </strong>{' '}
              ({r.radiacion.toFixed(2)} HSP) · Colombia
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              id="btn-generar-pdf-cotizacion"
              onClick={onGeneratePdf}
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
              onClick={onModifyData}
              className="px-4 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Modificar Datos</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div
            className={`relative mt-5 p-3 rounded-xl text-xs font-semibold border ${
              saveStatus.type === 'ok'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            {saveStatus.type === 'ok' ? '✅ ' : '⚠️ '}
            {saveStatus.text}
          </div>
        )}
      </div>

      {/* 4 KPIs Gigantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 block">Inversión Llave en Mano (+0,5%)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {cop(r.costoSolucionFinal)}
          </div>
          <div className="text-[11px] font-semibold text-slate-400 mt-1 tabular-nums">
            Sin 0,5%: <span className="text-slate-600 dark:text-slate-300 font-bold">{cop(r.costoSolucion)}</span>
          </div>
          <div className="text-xs font-extrabold text-amber-500 mt-1">
            $ {r.costoVatio} USD/Wp (TRM ${nf(inp.trm ?? 0)})
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Ahorro mensual: {cop(r.ahorroMensualCop)}
          </span>
        </div>

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
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
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

        {activeResultsTab === 'formulas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Desglose Matemático de Fórmulas (Tabla PostgreSQL: public.formulas_sistema)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fórmulas directas de ingeniería ejecutadas desde el Backend y PostgreSQL.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 inline-flex items-center justify-center text-xs">7</span>
                    Costo de la Solución (Inversión)
                  </span>
                  <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                    {cop(r.costoSolucionFinal)}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <div>
                    Base = {nf(r.requerido.wpInstalados)} Wp × ${r.costoVatio} USD/Wp × ${nf(inp.trm ?? 0)} COP = {cop(r.costoSolucion)}
                  </div>
                  <div>
                    Final = Base × 1,005 = {cop(r.costoSolucion)} + {cop(r.ajusteInversion)} (0,5%)
                  </div>
                </div>
              </div>

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

        {activeResultsTab === 'comparativa' && (
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Comparativa de Sistemas: Requerido por Consumo vs Disponible por Área de Techo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">Año {fa.anio}</td>
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
  );
}

