import React from 'react';
import { Zap, Sun, DollarSign, Clock, ShieldCheck, ArrowRight, Download, CheckCircle, Award } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';
import { formatCurrencyValue } from '../utils/solarCalculator';

interface ResultsDashboardProps {
  results: SolarCalculationResults;
  inputs: SolarInputs;
  onOpenQuoteModal: () => void;
  onResetOrEdit: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  inputs,
  onOpenQuoteModal,
  onResetOrEdit,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner with Major Metrics */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sun className="w-3.5 h-3.5" />
                Dimensionamiento Fotovoltaico Recomendado
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                Tu Sistema Óptimo: {results.actualInstalledKwp} kWp
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetOrEdit}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Ajustar Parámetros
              </button>
            </div>
          </div>

          {/* 4 Main Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Output 1: System Size & Panels */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
              <span className="text-xs text-slate-400 font-medium">Capacidad & Módulos</span>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-black font-display text-emerald-400 tabular-nums">
                  {results.panelCount} <span className="text-lg font-bold text-white">Paneles</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  {results.actualInstalledKwp} kWp ({results.panelWattage}W c/u)
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Ocupa ~{results.roofAreaRequiredM2} m² de techo
              </span>
            </div>

            {/* Output 2: Savings Percentage & Monthly $ */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
              <span className="text-xs text-slate-400 font-medium">Ahorro en Factura</span>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-black font-display text-emerald-400 tabular-nums">
                  {results.savingsPercentage}%
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  {formatCurrencyValue(results.monthlySavingsAmount, inputs.currencyCode)} / mes
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Ahorro anual: {formatCurrencyValue(results.annualSavingsAmount, inputs.currencyCode)}
              </span>
            </div>

            {/* Output 3: Return on Investment (ROI Payback) */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between group hover:border-amber-500/50 transition-all">
              <span className="text-xs text-slate-400 font-medium">Retorno de Inversión</span>
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-black font-display text-amber-400 tabular-nums">
                  {results.paybackYears} <span className="text-lg font-bold text-white">Años</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-semibold">
                  ROI Anual: {results.estimatedRoiPercentage}%
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Vida útil del sistema: 25+ Años
              </span>
            </div>

            {/* Output 4: New Monthly Bill & Net Cost */}
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <span className="text-xs text-slate-400 font-medium">Tu Nueva Factura Estimada</span>
              <div className="my-2">
                <div className="text-2xl sm:text-3xl font-black font-display text-white tabular-nums">
                  {formatCurrencyValue(results.newEstimatedMonthlyBill, inputs.currencyCode)}
                </div>
                <p className="text-xs text-emerald-400 mt-1 font-semibold">
                  Antes pagabas: {formatCurrencyValue(results.monthlyCurrentBill, inputs.currencyCode)}
                </p>
              </div>
              <span className="text-[11px] text-slate-400">
                Solo cargos fijos mínimos de red
              </span>
            </div>

          </div>

          {/* Cost and Investment Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Inversión Llave en Mano (Equipos + Obra):</span>
              <span className="text-lg font-bold text-slate-200 tabular-nums">
                {formatCurrencyValue(results.estimatedGrossCost, inputs.currencyCode)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Beneficio Fiscal Estimado (-20%):
              </span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                - {formatCurrencyValue(results.taxIncentiveAmount, inputs.currencyCode)}
              </span>
            </div>

            <div className="flex flex-col md:text-right">
              <span className="text-xs text-slate-400">Inversión Neta Final Estimada:</span>
              <span className="text-xl sm:text-2xl font-black font-display text-white tabular-nums">
                {formatCurrencyValue(results.netInvestmentCost, inputs.currencyCode)}
              </span>
            </div>
          </div>

          {/* NASA POWER Verified Source Badge */}
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded font-extrabold uppercase tracking-wider text-[10px] bg-blue-600 text-white">
                NASA POWER
              </span>
              <span className="text-slate-300">
                Radiación satelital GHI: <strong className="text-white font-mono">{results.effectiveHspUsed} HSP</strong> ({results.nasaDataSource}) · Temp media: <strong className="text-white font-mono">{results.averageAmbientTempC}°C</strong>
              </span>
            </div>
            <a
              href="https://power.larc.nasa.gov/data-access-viewer/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1 self-start sm:self-auto"
            >
              Consultar visor NASA oficial ↗
            </a>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Incluye ingeniería de detalle, trámites ante la empresa de energía y montaje profesional.</span>
            </div>

            <button
              type="button"
              onClick={onOpenQuoteModal}
              className="px-6 py-3.5 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Descargar Propuesta Técnica & Cotizar</span>
            </button>
          </div>

        </div>

      </div>

      {/* Itemized Kit Breakdown */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Componentes Incluidos en la Propuesta "Llave en Mano"
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {results.panelCount} Módulos Fotovoltaicos de {results.panelWattage}W Tier 1
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Celdas N-Type con recubrimiento anti-reflejo y 25 años de garantía lineal de producción al 85%.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Inversor {inputs.systemType === 'hybrid' ? 'Híbrido' : 'On-Grid Interconectado'} de Alta Eficiencia
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Eficiencia de conversión 98.6%, doble seguidor MPPT y monitoreo Wi-Fi en tiempo real desde app móvil.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Estructura de Montaje en Aluminio Anodizado AL6005-T5
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tornillería en acero inoxidable SUS304, resistente a vientos de hasta 140 km/h y corrosión salina.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-bold">4</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Tablero de Protecciones Eléctricas DC/AC & Legalización
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakers termo-magnéticos, descargadores de sobretensión (SPD Clase II), puesta a tierra y trámite de inyección a red.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
