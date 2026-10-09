import React from 'react';
import { Leaf, Trees, Car, Home, Globe2, Sparkles } from 'lucide-react';
import { SolarCalculationResults } from '../types/solar';

interface EnvironmentalImpactProps {
  results: SolarCalculationResults;
}

export const EnvironmentalImpact: React.FC<EnvironmentalImpactProps> = ({ results }) => {
  return (
    <div id="impacto-verde" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Globe2 className="w-3.5 h-3.5" />
            Compromiso de Sostenibilidad & Huella de Carbono
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            Tu Impacto Positivo en el Planeta
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Equivalencias calculadas según factores de la Agencia Internacional de Energía (IEA)
        </span>
      </div>

      {/* Grid of 4 Environmental Proof Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: CO2 Avoided */}
        <div className="p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between group hover:border-emerald-500/50 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Anual</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
              {results.annualCo2TonsAvoided} <span className="text-base font-bold">Ton</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Dióxido de Carbono (CO2) Evitado</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Gas de efecto invernadero no emitido a la atmósfera cada año.
            </p>
          </div>
        </div>

        {/* Card 2: Trees Planted */}
        <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 flex flex-col justify-between group hover:border-amber-500/50 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trees className="w-5 h-5" />
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Equivalente</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-display text-amber-600 dark:text-amber-400 tabular-nums">
              {new Intl.NumberFormat().format(results.treesEquivalentCount)} <span className="text-base font-bold">Árboles</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Bosque Equivalente Plantado</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Capacidad de absorción de carbono equivalente a árboles maduros creciendo durante 10 años.
            </p>
          </div>
        </div>

        {/* Card 3: Car Km Avoided */}
        <div className="p-5 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 flex flex-col justify-between group hover:border-blue-500/50 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Movilidad</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-display text-blue-600 dark:text-blue-400 tabular-nums">
              {new Intl.NumberFormat().format(results.carsKmAvoided)} <span className="text-base font-bold">Km</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Kilómetros en Auto a Gasolina</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Emisiones vehiculares eliminadas del transporte tradicional por año.
            </p>
          </div>
        </div>

        {/* Card 4: Clean Energy Generated */}
        <div className="p-5 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 flex flex-col justify-between group hover:border-teal-500/50 hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">Hogares</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-display text-teal-600 dark:text-teal-400 tabular-nums">
              {results.homesPoweredEquivalent} <span className="text-base font-bold">Hogares</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Energía Limpia Anual</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Generas {new Intl.NumberFormat().format(results.annualGenerationKwh)} kWh/año de energía renovable.
            </p>
          </div>
        </div>

      </div>

      {/* Motivational marketing banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <strong>Sello de Empresa / Hogar Sostenible:</strong> Instalar energía solar no solo te independiza de las tarifas eléctricas, sino que certifica tu compromiso con la descarbonización del planeta.
          </p>
        </div>
      </div>

    </div>
  );
};
