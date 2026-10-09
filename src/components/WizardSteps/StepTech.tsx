import React from 'react';
import { BatteryCharging, Cpu, Check, Sliders, Shield } from 'lucide-react';
import { PANEL_OPTIONS, SYSTEM_TYPES } from '../../constants/solarData';
import { SolarInputs, SystemType } from '../../types/solar';

interface StepTechProps {
  inputs: SolarInputs;
  onChange: (updates: Partial<SolarInputs>) => void;
  onPrev: () => void;
  onCalculate: () => void;
}

export const StepTech: React.FC<StepTechProps> = ({
  inputs,
  onChange,
  onPrev,
  onCalculate,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center">
            3
          </span>
          Tecnología y Objetivo de Ahorro
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configura el nivel de compensación que deseas alcanzar y el tipo de equipamiento tecnológico.
        </p>
      </div>

      {/* Target Coverage Slider */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Porcentaje de Consumo a Compensar
            </span>
          </div>
          <span className="text-xl font-black font-display text-emerald-500 tabular-nums">
            {inputs.targetCoveragePct}%
          </span>
        </div>

        <input
          type="range"
          min="40"
          max="100"
          step="5"
          value={inputs.targetCoveragePct}
          onChange={(e) => onChange({ targetCoveragePct: Number(e.target.value) })}
          className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>50% (Ahorro parcial)</span>
          <span className="text-emerald-500 font-semibold">90% - 95% (Óptimo recomendado)</span>
          <span>100% (Cobertura total)</span>
        </div>
      </div>

      {/* System Type Selector (On-Grid vs Hybrid) */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
          Modalidad de Sistema
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SYSTEM_TYPES.map((sys) => {
            const isSelected = inputs.systemType === sys.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => onChange({ systemType: sys.id as SystemType })}
                className={`p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {sys.badge}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{sys.title}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{sys.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{sys.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Wattage Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          Potencia de Paneles Solares (Módulos)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PANEL_OPTIONS.map((panel) => {
            const isSelected = inputs.panelWattage === panel.wattage;
            return (
              <button
                key={panel.wattage}
                type="button"
                onClick={() => onChange({ panelWattage: panel.wattage })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-black font-display text-slate-900 dark:text-white">
                    {panel.wattage}W
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {panel.efficiency}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{panel.label}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{panel.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          ← Volver a Ubicación
        </button>
        <button
          type="button"
          onClick={onCalculate}
          className="px-7 py-3.5 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <span>Generar Resultados y ROI</span>
          <Shield className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
