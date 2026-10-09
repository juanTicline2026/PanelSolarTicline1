import React, { useState } from 'react';
import { Sun, Maximize2, Zap, Shield, Sparkles } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';

interface RoofVisualizerProps {
  results: SolarCalculationResults;
  inputs: SolarInputs;
}

export const RoofVisualizer: React.FC<RoofVisualizerProps> = ({ results, inputs }) => {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'afternoon'>('noon');
  const [hoveredPanel, setHoveredPanel] = useState<number | null>(null);

  const panels = Array.from({ length: results.panelCount }, (_, i) => i + 1);

  // Layout arrangement: calculate number of columns based on total panels
  const cols = results.panelCount > 16 ? 6 : results.panelCount > 8 ? 4 : results.panelCount > 4 ? 3 : 2;

  // Sun conditions
  const sunPositions = {
    morning: { x: '15%', y: '25%', opacity: '0.7', label: 'Mañana (Sol Naciente)', eff: '75%' },
    noon: { x: '50%', y: '12%', opacity: '1.0', label: 'Mediodía (Pico Solar 100%)', eff: '100%' },
    afternoon: { x: '85%', y: '25%', opacity: '0.75', label: 'Tarde (Luz Rasante)', eff: '80%' },
  };

  const activeSun = sunPositions[timeOfDay];

  return (
    <div id="techo-solar" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white overflow-hidden shadow-2xl relative">
      
      {/* Visualizer Header */}
      <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Simulador de Cubierta & Orientación Solar
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
            Disposición Fotovoltaica Recomendada
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            {results.panelCount} módulos de {results.panelWattage}W ocupando aproximadamente {results.roofAreaRequiredM2} m² de techo.
          </p>
        </div>

        {/* Time of Day Sun Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeOfDay('morning')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeOfDay === 'morning' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mañana
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay('noon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeOfDay === 'noon' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mediodía (Pico)
          </button>
          <button
            type="button"
            onClick={() => setTimeOfDay('afternoon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              timeOfDay === 'afternoon' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tarde
          </button>
        </div>
      </div>

      {/* Interactive Canvas Stage */}
      <div className="relative min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950">
        
        {/* Dynamic Sun Orb */}
        <div
          className="absolute transition-all duration-700 ease-out flex flex-col items-center pointer-events-none z-0"
          style={{ left: activeSun.x, top: activeSun.y, transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 blur-sm flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.8)] animate-pulse" />
          <span className="text-[11px] font-bold text-amber-300/90 mt-2 bg-slate-950/70 px-2 py-0.5 rounded-full border border-amber-500/20 backdrop-blur-sm">
            {activeSun.label}
          </span>
        </div>

        {/* Ambient Roof Plane */}
        <div className="relative z-10 w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md">
          
          {/* Roof Ridge Marker */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              Orientación Óptima al Sur / Ecuador (Inclinación 15°-20°)
            </span>
            <span className="text-emerald-400 font-bold tabular-nums">
              Potencia: {results.actualInstalledKwp} kWp
            </span>
          </div>

          {/* Grid of Solar Modules */}
          <div
            className="grid gap-2.5 sm:gap-3 justify-center mx-auto"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              maxWidth: `${cols * 105}px`,
            }}
          >
            {panels.map((num) => {
              const isHovered = hoveredPanel === num;
              return (
                <div
                  key={num}
                  onMouseEnter={() => setHoveredPanel(num)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  className={`group relative h-20 sm:h-24 rounded-lg border cursor-pointer transition-all duration-300 flex flex-col justify-between p-1.5 overflow-hidden ${
                    isHovered
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 z-20'
                      : 'border-slate-700/80 bg-gradient-to-br from-slate-800 via-blue-950/40 to-slate-900 hover:border-emerald-500/80'
                  }`}
                >
                  {/* Photovoltaic wafer grid pattern */}
                  <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity pointer-events-none bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:10px_10px]" />
                  
                  {/* Solar reflection sheen */}
                  <div className="absolute -inset-full group-hover:inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent transition-all duration-500 pointer-events-none" />

                  {/* Panel Micro Header */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-300">
                      #{num}
                    </span>
                    <Zap className="w-2.5 h-2.5 text-amber-400 opacity-60 group-hover:opacity-100" />
                  </div>

                  {/* Panel Micro Footer */}
                  <div className="z-10 text-center">
                    <span className="text-[10px] font-bold text-white tracking-tight">
                      {results.panelWattage}W
                    </span>
                    <span className="block text-[8px] text-slate-400 group-hover:text-emerald-300">
                      Tier 1
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* System Components Status Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="block text-[11px] text-slate-400">Eficiencia Térmica</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">98.2%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="block text-[11px] text-slate-400">Área Techo Necesaria</span>
              <span className="text-xs sm:text-sm font-bold text-white tabular-nums">~{results.roofAreaRequiredM2} m²</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="block text-[11px] text-slate-400">Inversor Inteligente</span>
              <span className="text-xs sm:text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {inputs.systemType === 'hybrid' ? 'Híbrido + Batería' : 'String On-Grid'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="block text-[11px] text-slate-400">Garantía Producto</span>
              <span className="text-xs sm:text-sm font-bold text-blue-400 flex items-center justify-center gap-1">
                <Shield className="w-3.5 h-3.5" /> 25 Años
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
