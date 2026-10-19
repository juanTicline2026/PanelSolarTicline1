import React, { useState } from 'react';
import { Zap, Sun, DollarSign, TrendingUp, Clock, Satellite, ArrowRight, ShieldCheck, Calculator, ChevronDown, ChevronUp, FileDown, Loader2 } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';
import { formatCurrencyValue, formatCompactCurrency } from '../utils/solarCalculator';
import { generateProposalPdf } from '../utils/pdfGenerator';
import { CITIES } from '../constants/solarData';

interface LiveReflectionSidebarProps {
  results: SolarCalculationResults;
  inputs: SolarInputs;
  onOpenQuoteModal: () => void;
  onJumpToResults: () => void;
}

export const LiveReflectionSidebar: React.FC<LiveReflectionSidebarProps> = ({
  results,
  inputs,
  onOpenQuoteModal,
  onJumpToResults,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const cashflow = results.thirtyYearCashflow || results.twentyFiveYearCashflow;
  const maxCost = Math.max(...cashflow.map((d) => Math.max(d.costWithoutSolar, d.costWithSolar)), 1);

  const cityName = CITIES.find((c) => c.id === inputs.cityId)?.name || 'Antioquia';

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateProposalPdf({
        projectName: 'Proyecto Solar Residencial',
        clientName: 'Cliente Solar',
        department: cityName,
        consumoKwh: results.monthlyConsumptionKwh,
        costoKwhBase: results.effectiveTariffPerKwh,
        radiacion: results.effectiveHspUsed,
        potenciaPanel: results.panelWattage,
        panelCount: results.panelCount,
        kwp: results.actualInstalledKwp,
        areaRequeridaM2: results.roofAreaRequiredM2,
        produccionMensualKwh: results.monthlyGenerationKwh,
        produccionAnualKwh: results.annualGenerationKwh,
        ahorroPct: results.savingsPercentage,
        ahorroCo2Ton: results.annualCo2TonsAvoided,
        arboles: results.treesEquivalentCount,
        costoSolucionCop: results.netInvestmentCost,
        ahorroMensualCop: results.monthlySavingsAmount,
        ahorro30AniosCop: results.cumulative30YearSavings,
        retornoMeses: Math.round(results.paybackYears * 12),
        retornoAnios: results.paybackYears,
        tirPct: results.estimatedRoiPercentage,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Ocurrió un error al generar el PDF de cotización.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="sticky top-20 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-5 sm:p-6 text-white shadow-2xl space-y-5 overflow-hidden relative animate-fadeIn">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
            Reflejo en Vivo del Proyecto
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          NASA {results.effectiveHspUsed} HSP
        </span>
      </div>

      {/* Main Metric Spotlight */}
      <div className="relative z-10 space-y-3">
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Potencia Recomendada
            </span>
            <div className="text-2xl sm:text-3xl font-black font-display text-white tabular-nums mt-0.5">
              {results.actualInstalledKwp} <span className="text-base font-bold text-emerald-400">kWp</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Módulos Solares
            </span>
            <div className="text-2xl sm:text-3xl font-black font-display text-emerald-400 tabular-nums mt-0.5">
              {results.panelCount} <span className="text-xs font-bold text-slate-300">paneles</span>
            </div>
            <span className="text-[10px] text-slate-400">{results.panelWattage}W c/u</span>
          </div>
        </div>

        {/* 2 Grid Mini KPIs */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Ahorro Mensual
            </span>
            <div className="text-base sm:text-lg font-black font-display text-emerald-400 tabular-nums mt-0.5 truncate">
              {formatCompactCurrency(results.monthlySavingsAmount, inputs.currencyCode)}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold block">
              {results.savingsPercentage}% de reducción
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Retorno (ROI)
            </span>
            <div className="text-base sm:text-lg font-black font-display text-amber-400 tabular-nums mt-0.5">
              {results.paybackYears} <span className="text-xs font-bold text-white">Años</span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium block">
              TIR: {results.estimatedRoiPercentage}%
            </span>
          </div>
        </div>

        {/* Fórmula Andrés (NASA POWER) 100% Integrada */}
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 p-2.5 transition-all">
          <button
            type="button"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="w-full flex items-center justify-between text-left cursor-pointer group"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fórmula Andrés (NASA 100% Integrada)</span>
            </span>
            {showFormulaDetails ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showFormulaDetails && (
            <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-2 text-[10.5px] animate-fadeIn">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                <div className="text-emerald-400 font-bold mb-0.5">① E_consumoAnual = ConsumoMensual × 12</div>
                <div className="text-slate-300">
                  {results.monthlyConsumptionKwh.toLocaleString()} kWh × 12 = <span className="text-white font-bold">{results.annualConsumptionKwh.toLocaleString()} kWh/año</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                <div className="text-emerald-400 font-bold mb-0.5">② NroPaneles = E_consumo / (PotPanel × 365 × Irrad × 80%)</div>
                <div className="text-slate-400 text-[9.5px]">
                  {results.annualConsumptionKwh.toLocaleString()} / ({(results.panelWattage / 1000).toFixed(3)} kWp × 365 × {results.effectiveHspUsed} × 0.8)
                </div>
                <div className="text-slate-300 mt-0.5">
                  = {results.exactPanelCount} → <span className="text-emerald-400 font-bold">{results.panelCount} paneles ({results.actualInstalledKwp} kWp)</span>
                </div>
              </div>

              <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                <div className="text-emerald-400 font-bold mb-0.5">③ E_genAnual = NroPaneles × PotPanel × 365 × Irrad × 80%</div>
                <div className="text-slate-400 text-[9.5px]">
                  {results.panelCount} × {(results.panelWattage / 1000).toFixed(3)} kWp × 365 × {results.effectiveHspUsed} × 0.8
                </div>
                <div className="text-slate-300 mt-0.5">
                  = <span className="text-white font-bold">{results.annualGenerationKwh.toLocaleString()} kWh/año</span> ({results.monthlyGenerationKwh.toLocaleString()} kWh/mes)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Mini 30-Year Chart Preview (matching user image) */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-sky-400" /> Comparativa 30 Años en Vivo
            </span>
            <span className="text-[10px] text-emerald-400 font-bold tabular-nums">
              Punto de Equilibrio: Año {results.paybackYears}
            </span>
          </div>

          {/* Mini SVG Sparkline comparing conventional grid (cyan area) vs solar (orange bars) */}
          <div className="w-full h-18 relative pt-1">
            <svg viewBox="0 0 240 60" className="w-full h-full overflow-visible">
              {/* Cyan area for conventional grid */}
              {(() => {
                const pts = cashflow.map((d, i) => {
                  const x = (i / (cashflow.length - 1)) * 240;
                  const y = 58 - (d.costWithoutSolar / maxCost) * 50;
                  return `${x},${y}`;
                });
                const dArea = `M 0,58 L ${pts.join(' L ')} L 240,58 Z`;
                const dLine = `M ${pts.join(' L ')}`;
                return (
                  <>
                    <path d={dArea} fill="rgba(165, 243, 252, 0.45)" />
                    <path d={dLine} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                  </>
                );
              })()}

              {/* Orange bars for solar system cost */}
              {cashflow.map((d, i) => {
                const x = (i / cashflow.length) * 240;
                const bHeight = Math.max(2, (d.costWithSolar / maxCost) * 50);
                const y = 58 - bHeight;
                return (
                  <rect
                    key={d.year}
                    x={x + 1}
                    y={y}
                    width="4.5"
                    height={bHeight}
                    fill={d.year <= 6 ? '#f97316' : '#fdba74'}
                    rx="0.5"
                  />
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#38bdf8] inline-block" /> Red Convencional
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-[#f97316] inline-block" /> Sistema Solar
            </span>
          </div>
        </div>

        {/* Financial Net Investment */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400">Inversión Neta Estimada:</span>
          <span className="font-extrabold text-white font-mono tabular-nums">
            {formatCurrencyValue(results.netInvestmentCost, inputs.currencyCode)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            id="btn-generar-pdf-sidebar"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full py-3 px-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando PDF Oficial (8 Págs)...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generar PDF de Cotización</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onJumpToResults}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ver Resultados & Desglose Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenQuoteModal}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Solicitar Cotización Formal</span>
          </button>
        </div>

      </div>

    </div>
  );
};
