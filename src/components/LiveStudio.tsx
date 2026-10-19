import React from 'react';
import { Sliders, Sun, DollarSign, Zap, MapPin, Layers, BatteryCharging, Download } from 'lucide-react';
import { CITIES, CURRENCIES, PANEL_OPTIONS, ROOF_TYPES, SECTORS, SYSTEM_TYPES } from '../constants/solarData';
import { CalculationMode, RoofType, SectorType, SolarCalculationResults, SolarInputs, SystemType } from '../types/solar';
import { formatCurrencyValue } from '../utils/solarCalculator';

interface LiveStudioProps {
  inputs: SolarInputs;
  results: SolarCalculationResults;
  onChange: (updates: Partial<SolarInputs>) => void;
  onOpenQuoteModal: () => void;
}

export const LiveStudio: React.FC<LiveStudioProps> = ({
  inputs,
  results,
  onChange,
  onOpenQuoteModal,
}) => {
  const currency = CURRENCIES[inputs.currencyCode] || CURRENCIES.USD;
  const isHighValue = currency.toUsdRate > 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
      
      {/* Left Column: Interactive Controls Console */}
      <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl space-y-6">
        
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
            <Sliders className="w-3.5 h-3.5" />
            Consola de Simulación en Vivo
          </div>
          <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Parámetros del Proyecto
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mueve los controles para ver el impacto inmediato en el tamaño del sistema y el ROI.
          </p>
        </div>

        {/* 1. Sector Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sector / Tarifa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SECTORS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ sector: s.id as SectorType })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  inputs.sector === s.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Bill Amount / kWh Slider */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              Factura Mensual
            </div>
            <span className="text-base sm:text-lg font-black font-display text-emerald-500 tabular-nums">
              {formatCurrencyValue(inputs.billAmount, inputs.currencyCode)}
            </span>
          </div>

          <input
            type="range"
            min={isHighValue ? 50000 : 20}
            max={isHighValue ? 5000000 : 3500}
            step={isHighValue ? 25000 : 25}
            value={inputs.billAmount}
            onChange={(e) => onChange({ billAmount: Number(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Consumo equivalente: <strong className="text-slate-700 dark:text-slate-300 tabular-nums">{results.monthlyConsumptionKwh} kWh/mes</strong></span>
            <span>Tarifa: {currency.symbol} {currency.defaultRatesPerKwh[inputs.sector]}/kWh</span>
          </div>
        </div>

        {/* 3. Location Dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              Ubicación (NASA POWER)
            </label>
            <span className="text-xs font-bold text-amber-500 tabular-nums">
              {results.effectiveHspUsed} HSP
            </span>
          </div>

          <select
            value={inputs.cityId}
            onChange={(e) => {
              const selected = CITIES.find((c) => c.id === e.target.value);
              if (selected) {
                onChange({
                  cityId: selected.id,
                  latitude: selected.lat,
                  longitude: selected.lon,
                  customHsp: null,
                });
              }
            }}
            aria-label="Seleccionar ciudad o región"
            className="w-full p-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900">
                {c.countryFlag} {c.name} ({c.country}) — {c.hsp} HSP (NASA)
              </option>
            ))}
          </select>

          {/* Sizing Basis mini buttons */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'annual' })}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                inputs.sizingBasis === 'annual'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Promedio Anual
            </button>
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'worst_month' })}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                inputs.sizingBasis === 'worst_month'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes Crítico
            </button>
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'best_month' })}
              className={`py-1 px-1.5 text-[10px] font-bold rounded-lg transition-all ${
                inputs.sizingBasis === 'best_month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes Pico
            </button>
          </div>
        </div>

        {/* 4. Target Coverage Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cobertura Deseada
            </label>
            <span className="text-sm font-black text-emerald-500 tabular-nums">
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
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 5. System Type Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tipo de Sistema
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SYSTEM_TYPES.map((sys) => (
              <button
                key={sys.id}
                type="button"
                onClick={() => onChange({ systemType: sys.id as SystemType })}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  inputs.systemType === sys.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sys.id === 'on_grid' ? 'On-Grid (Red)' : 'Híbrido + Batería'}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Panel Wattage */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Módulos (Potencia)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PANEL_OPTIONS.map((p) => (
              <button
                key={p.wattage}
                type="button"
                onClick={() => onChange({ panelWattage: p.wattage })}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  inputs.panelWattage === p.wattage
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p.wattage}W
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Live Dynamic Executive Cockpit */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Dynamic Big Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Potencia del Sistema
            </span>
            <div className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tabular-nums mt-1">
              {results.actualInstalledKwp} <span className="text-base font-bold text-emerald-500">kWp</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              {results.panelCount} módulos de {results.panelWattage}W
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Retorno (ROI)
            </span>
            <div className="text-2xl sm:text-3xl font-black font-display text-amber-500 tabular-nums mt-1">
              {results.paybackYears} <span className="text-base font-bold text-slate-900 dark:text-white">Años</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
              TIR anual: {results.estimatedRoiPercentage}%
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Ahorro Mensual
            </span>
            <div className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white tabular-nums mt-1 truncate">
              {formatCurrencyValue(results.monthlySavingsAmount, inputs.currencyCode)}
            </div>
            <span className="text-xs text-emerald-500 font-semibold mt-0.5 block">
              {results.savingsPercentage}% de reducción
            </span>
          </div>
        </div>

        {/* Live System Specs Summary Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" /> Resumen Técnico en Vivo
            </h4>
            <span className="text-xs text-emerald-500 font-semibold">Generación: ~{results.monthlyGenerationKwh} kWh/mes</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block">Área de Techo</span>
              <strong className="text-slate-900 dark:text-white text-sm font-bold tabular-nums">~{results.roofAreaRequiredM2} m²</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block">Generación Anual</span>
              <strong className="text-slate-900 dark:text-white text-sm font-bold tabular-nums">{new Intl.NumberFormat().format(results.annualGenerationKwh)} kWh</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block">Inversión Neta</span>
              <strong className="text-slate-900 dark:text-white text-sm font-bold tabular-nums">{formatCurrencyValue(results.netInvestmentCost, inputs.currencyCode)}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-400 block">CO2 Evitado</span>
              <strong className="text-emerald-500 text-sm font-bold tabular-nums">{results.annualCo2TonsAvoided} Ton/año</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenQuoteModal}
            className="w-full py-3.5 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Solicitar Cotización Formal de Este Proyecto</span>
          </button>
        </div>

      </div>

    </div>
  );
};
