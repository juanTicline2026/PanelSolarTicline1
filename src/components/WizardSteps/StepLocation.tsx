import React, { useState } from 'react';
import { MapPin, Sun, Compass, Layers, Check } from 'lucide-react';
import { CITIES, ROOF_TYPES } from '../../constants/solarData';
import { RoofType, SolarInputs } from '../../types/solar';

interface StepLocationProps {
  inputs: SolarInputs;
  onChange: (updates: Partial<SolarInputs>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  inputs,
  onChange,
  onPrev,
  onNext,
}) => {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('todos');
  const [useCustomHsp, setUseCustomHsp] = useState<boolean>(inputs.customHsp !== null);

  const countries = ['todos', 'México', 'Colombia', 'España', 'EE.UU.', 'Chile', 'Perú', 'Argentina'];

  const filteredCities = selectedCountryFilter === 'todos'
    ? CITIES
    : CITIES.filter((c) => c.country === selectedCountryFilter);

  const activeCity = CITIES.find((c) => c.id === inputs.cityId) || CITIES[0];
  const effectiveHsp = useCustomHsp && inputs.customHsp ? inputs.customHsp : activeCity.hsp;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Step Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center justify-center">
            2
          </span>
          Ubicación Geográfica y Tipo de Techo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          La radiación solar (Horas de Sol Pico - HSP) y el tipo de techo determinan el rendimiento de los módulos fotovoltaicos.
        </p>
      </div>

      {/* Country Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
            Selecciona tu Ciudad o Región
          </label>
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {countries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setSelectedCountryFilter(country)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap ${
                  selectedCountryFilter === country
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {filteredCities.map((city) => {
            const isSelected = inputs.cityId === city.id && !useCustomHsp;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => {
                  setUseCustomHsp(false);
                  onChange({
                    cityId: city.id,
                    latitude: city.lat,
                    longitude: city.lon,
                    customHsp: null,
                  });
                }}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{city.countryFlag}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{city.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {city.country} · Lat {city.lat.toFixed(1)}°
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black font-display text-amber-500 dark:text-amber-400 tabular-nums">
                    {city.hsp} HSP
                  </span>
                  <span className="block text-[10px] text-slate-400">NASA POWER</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom HSP Switcher */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomHsp}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseCustomHsp(checked);
                  onChange({ customHsp: checked ? (inputs.customHsp || 5.0) : null });
                }}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 border-slate-300"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Ajustar manualmente Horas de Sol Pico (HSP)
              </span>
            </label>
            <span className="text-xs font-black text-amber-500 font-display tabular-nums">
              {effectiveHsp.toFixed(1)} kWh/m²/día
            </span>
          </div>

          {useCustomHsp && (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <input
                type="range"
                min="3.0"
                max="6.8"
                step="0.1"
                value={effectiveHsp}
                onChange={(e) => onChange({ customHsp: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>3.0 (Zona baja / templada)</span>
                <span>5.0 (Promedio latinoamericano)</span>
                <span>6.8 (Desértico / Ultra solar)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roof Type Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          Tipo de Techo y Estructura
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROOF_TYPES.map((roof) => {
            const isSelected = inputs.roofType === roof.id;
            return (
              <button
                key={roof.id}
                type="button"
                onClick={() => onChange({ roofType: roof.id as RoofType })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{roof.name}</h4>
                  {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{roof.description}</p>
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
          ← Volver a Consumo
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <span>Siguiente: Tecnología y Cobertura</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
