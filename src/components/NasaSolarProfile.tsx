import React, { useState } from 'react';
import { Sun, Satellite, ExternalLink, RefreshCw, Crosshair, MapPin, Thermometer, Info, BarChart3, AlertCircle } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';

interface NasaSolarProfileProps {
  inputs: SolarInputs;
  results: SolarCalculationResults;
  onChange: (updates: Partial<SolarInputs>) => void;
  onRefreshNasa: () => void;
  isLoadingNasa: boolean;
}

export const NasaSolarProfile: React.FC<NasaSolarProfileProps> = ({
  inputs,
  results,
  onChange,
  onRefreshNasa,
  isLoadingNasa,
}) => {
  const [showCoordinateEditor, setShowCoordinateEditor] = useState<boolean>(false);
  const [latInput, setLatInput] = useState<string>(inputs.latitude.toString());
  const [lonInput, setLonInput] = useState<string>(inputs.longitude.toString());
  const [geoError, setGeoError] = useState<string | null>(null);

  const handleApplyCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onChange({ latitude: lat, longitude: lon, customHsp: null });
      setGeoError(null);
    } else {
      setGeoError('Latitud debe estar entre -90 y 90, Longitud entre -180 y 180');
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no soportada en este navegador');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        setLatInput(lat.toString());
        setLonInput(lon.toString());
        onChange({ latitude: lat, longitude: lon, customHsp: null });
      },
      (err) => {
        setGeoError(`No se pudo obtener ubicación: ${err.message}`);
      },
      { timeout: 8000 }
    );
  };

  // Find max HSP for scaling chart
  const maxHsp = Math.max(...results.monthlyDetails.map((m) => m.nasaHsp), 7.0);

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Header with NASA Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1.5 shadow-sm">
              <Satellite className="w-3.5 h-3.5" /> NASA POWER
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Prediction Of Worldwide Energy Resources
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            Radiación Solar Satelital y Climatología
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Cálculo respaldado por el visor de datos oficial de la NASA (Langley Research Center), asimilación meteorológica satelital MERRA-2 y SYN1DEG a 20 años.
          </p>
        </div>

        {/* Action button to NASA Data Access Viewer */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://power.larc.nasa.gov/data-access-viewer/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Visor NASA POWER</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>

          <button
            type="button"
            onClick={onRefreshNasa}
            disabled={isLoadingNasa}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingNasa ? 'animate-spin' : ''}`} />
            <span>{isLoadingNasa ? 'Sincronizando...' : 'Recargar Satélite'}</span>
          </button>
        </div>
      </div>

      {/* Coordinates readout and Sizing Basis selector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* Coordinates status */}
        <div className="md:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                Coordenadas Satelitales Activas
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                Lat: {inputs.latitude.toFixed(4)}° / Lon: {inputs.longitude.toFixed(4)}°
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCoordinateEditor(!showCoordinateEditor)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {showCoordinateEditor ? 'Ocultar' : 'Personalizar GPS'}
          </button>
        </div>

        {/* Sizing Basis (Annual vs Worst Month vs Best Month) */}
        <div className="md:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Criterio de Dimensionamiento:
            </span>
            <span className="font-extrabold text-emerald-500 tabular-nums">
              {results.effectiveHspUsed} HSP usada
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'annual' })}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all text-center ${
                inputs.sizingBasis === 'annual'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Promedio Anual (ANN)
            </button>
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'worst_month' })}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all text-center ${
                inputs.sizingBasis === 'worst_month'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes Crítico ({results.worstMonthHsp})
            </button>
            <button
              type="button"
              onClick={() => onChange({ sizingBasis: 'best_month' })}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all text-center ${
                inputs.sizingBasis === 'best_month'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mes Pico ({results.bestMonthHsp})
            </button>
          </div>
        </div>

      </div>

      {/* Coordinate Editor Form */}
      {showCoordinateEditor && (
        <form onSubmit={handleApplyCoordinates} className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-blue-500" />
              Ingresa Coordenadas Decimales Exactas de tu Techo
            </h4>
            <button
              type="button"
              onClick={handleDetectGps}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Crosshair className="w-3 h-3" /> Usar GPS de este Dispositivo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Latitud (°N / °S)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="Ej. 19.4326"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Longitud (°E / °O)
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                placeholder="Ej. -99.1332"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {geoError && <p className="text-xs text-rose-500 font-semibold">{geoError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCoordinateEditor(false)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm cursor-pointer"
            >
              Consultar NASA POWER para estas Coordenadas
            </button>
          </div>
        </form>
      )}

      {/* Monthly NASA Irradiance & Generation Bar Chart */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Perfil Mensual de Irradiación Global Horizontal (GHI / HSP) & Generación Estimada
          </span>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> HSP NASA (kWh/m²/día)
            </span>
            <span className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-rose-400" /> Temp Media ({results.averageAmbientTempC}°C)
            </span>
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-4">
          {results.monthlyDetails.map((m) => {
            const hspHeightPct = Math.max(15, Math.min(100, (m.nasaHsp / maxHsp) * 100));
            const isWorst = m.nasaHsp === results.worstMonthHsp;
            const isBest = m.nasaHsp === results.bestMonthHsp;

            return (
              <div
                key={m.monthKey}
                className="flex flex-col items-center justify-end group relative"
              >
                {/* Value on hover tooltip */}
                <div className="text-[10px] font-bold font-mono text-slate-600 dark:text-slate-400 tabular-nums mb-1 group-hover:text-emerald-500">
                  {m.nasaHsp}
                </div>

                {/* Vertical Bar */}
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 relative">
                  <div
                    style={{ height: `${hspHeightPct}%` }}
                    className={`w-full rounded-lg transition-all duration-300 relative ${
                      isBest
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30'
                        : isWorst
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-amber-500 via-yellow-400 to-amber-300 group-hover:from-emerald-400 group-hover:to-teal-300'
                    }`}
                  />
                </div>

                {/* Month Label */}
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-2">
                  {m.monthName.slice(0, 3)}
                </span>

                {/* Monthly kWh generated mini tag */}
                <span className="text-[9px] text-slate-400 tabular-nums">
                  {m.generationKwh}k
                </span>
              </div>
            );
          })}
        </div>

        {/* Monthly Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">HSP Anual Promedio</span>
            <strong className="text-slate-900 dark:text-white text-sm font-black tabular-nums">
              {results.effectiveHspUsed} kWh/m²/día
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Mes Más Favorable</span>
            <strong className="text-emerald-500 text-sm font-black tabular-nums">
              {results.bestMonthHsp} HSP
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Mes Crítico (Invierno)</span>
            <strong className="text-amber-500 text-sm font-black tabular-nums">
              {results.worstMonthHsp} HSP
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 block text-[11px]">Performance Ratio (PR)</span>
            <strong className="text-blue-500 text-sm font-black tabular-nums">
              {(results.effectivePr * 100).toFixed(0)}% (Térmico)
            </strong>
          </div>
        </div>

      </div>

    </div>
  );
};
