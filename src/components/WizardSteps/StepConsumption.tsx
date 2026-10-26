import React from 'react';
import { Home, Building2, Zap } from 'lucide-react';
import { CURRENCIES, SECTORS } from '../../constants/solarData';
import { SectorType, SolarInputs } from '../../types/solar';

interface StepConsumptionProps {
  inputs: SolarInputs;
  onChange: (updates: Partial<SolarInputs>) => void;
  onNext: () => void;
}

export const StepConsumption: React.FC<StepConsumptionProps> = ({
  inputs,
  onChange,
  onNext,
}) => {
  const currency = CURRENCIES[inputs.currencyCode] || CURRENCIES.USD;
  const tariff = currency.defaultRatesPerKwh[inputs.sector];

  const kwhPresets = [250, 500, 1000, 2500];
  const calculatedKwh = inputs.monthlyKwh || 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header of the step */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center justify-center">
            1
          </span>
          ¿Cuánto consumes de energía eléctrica?
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingresa tus kWh consumidos al mes para calcular el tamaño exacto de tu sistema.
        </p>
      </div>

      {/* 1. Sector Picker */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          Tipo de Tarifa / Sector
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTORS.map((sector) => {
            const isSelected = inputs.sector === sector.id;
            const sectorTariff = currency.defaultRatesPerKwh[sector.id as SectorType];
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => onChange({ sector: sector.id as SectorType })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer relative ${isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    {sector.id === 'residencial' && <Home className="w-5 h-5" />}
                    {sector.id === 'comercial' && <Building2 className="w-5 h-5" />}
                  </div>
                  <span className="text-xs text-slate-400">
                    Tarifa: {currency.symbol} {sectorTariff} / kWh
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sector.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sector.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Consumo en kWh */}
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Consumo Eléctrico Mensual (kWh)
        </label>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Consumo eléctrico promedio al mes:
            </span>
            <div className="relative max-w-xs">
              <input
                type="number"
                min="0"
                step="20"
                value={inputs.monthlyKwh > 0 ? inputs.monthlyKwh : ''}
                placeholder="Ej: 400"
                onChange={(e) => {
                  const val = e.target.value.trim();
                  onChange({ monthlyKwh: val === '' ? 0 : Math.max(0, Number(val)) });
                }}
                className="w-full px-4 py-2.5 text-lg font-black font-display text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                kWh / mes
              </span>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min="50"
            max="5000"
            step="25"
            value={inputs.monthlyKwh || 0}
            onChange={(e) => onChange({ monthlyKwh: Number(e.target.value) })}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Consumos típicos:</span>
            {kwhPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ monthlyKwh: val })}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                {val} kWh / mes
              </button>
            ))}
          </div>
        </div>

        {/* Live Estimation Feed */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Consumo base calculado: <strong className="tabular-nums font-bold">{new Intl.NumberFormat().format(calculatedKwh)} kWh/mes</strong>
            </span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 hidden sm:inline">
            Tarifa estimada: {currency.symbol} {tariff}/kWh
          </span>
        </div>
      </div>

      {/* Step Actions */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <span>Siguiente: Ubicación y Techo</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
