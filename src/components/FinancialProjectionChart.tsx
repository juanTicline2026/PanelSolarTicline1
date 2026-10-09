import React, { useState } from 'react';
import { TrendingUp, Award, CheckCircle2, DollarSign } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';
import { formatCurrencyValue, formatCompactCurrency } from '../utils/solarCalculator';

interface FinancialProjectionChartProps {
  results: SolarCalculationResults;
  inputs: SolarInputs;
}

export const FinancialProjectionChart: React.FC<FinancialProjectionChartProps> = ({
  results,
  inputs,
}) => {
  const cashflow = results.thirtyYearCashflow || results.twentyFiveYearCashflow;
  const [hoveredYear, setHoveredYear] = useState<number | null>(22); // Default to year 22 as in user image

  // Calculate scales for SVG rendering
  const maxCost = Math.max(...cashflow.map((d) => Math.max(d.costWithoutSolar, d.costWithSolar)), 100);
  
  // Chart dimensions in viewBox coordinates
  const width = 900;
  const height = 360;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const totalYears = cashflow.length; // 30
  const slotWidth = chartWidth / totalYears;
  const barWidth = Math.max(10, slotWidth * 0.55);

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxCost) * chartHeight;
  };

  const getX = (yearIndex: number) => {
    return paddingLeft + yearIndex * slotWidth + slotWidth / 2;
  };

  // Generate SVG path for Conventional Grid line and filled area
  const points = cashflow.map((d, i) => ({
    x: getX(i),
    y: getY(d.costWithoutSolar),
    d,
  }));

  const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Grid tick values (5 horizontal levels)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: Math.round(maxCost * pct),
    y: paddingTop + chartHeight - pct * chartHeight,
  }));

  const activeData = hoveredYear !== null
    ? cashflow.find((d) => d.year === hoveredYear) || cashflow[21]
    : cashflow[21];

  return (
    <div id="retorno-roi" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Análisis Financiero Comparativo (30 Años)
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Red Convencional vs Sistema Solar
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comparativa año por año: costo escalado de la tarifa eléctrica frente a la inversión y ahorro del sistema solar.
          </p>
        </div>

        {/* Highlight KPI Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Retorno (Payback)
            </span>
            <span className="text-lg sm:text-xl font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
              {results.paybackYears} Años
            </span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Ahorro Neto 30 Años
            </span>
            <span className="text-lg sm:text-xl font-black font-display text-amber-600 dark:text-amber-400 tabular-nums">
              {formatCompactCurrency(results.cumulative30YearSavings, inputs.currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Legend (as shown in user image) */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 pt-1 text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="w-5 h-3.5 rounded-sm bg-[#a5f3fc] border border-[#38bdf8] inline-block shadow-sm" />
          <span>Costo de la energía de la red convencional</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="w-5 h-3.5 rounded-sm bg-[#fba06e] inline-block shadow-sm" />
          <span>Costo del sistema solar</span>
        </div>
      </div>

      {/* Interactive Responsive SVG Chart Container */}
      <div className="relative w-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-4">
        
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
        >
          {/* Horizontal Grid lines and Y-axis labels */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={t.y}
                x2={width - paddingRight}
                y2={t.y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={t.y + 4}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-mono tabular-nums"
              >
                {formatCompactCurrency(t.val, inputs.currencyCode).replace(/[^\d.,kKM$€S/]/g, '')}
              </text>
            </g>
          ))}

          {/* Area under Conventional Grid Curve */}
          <path
            d={areaPath}
            fill="rgba(165, 243, 252, 0.55)"
            className="transition-all duration-300"
          />

          {/* Conventional Grid Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Orange/Peach Bars for Solar System Cost */}
          {cashflow.map((d, i) => {
            const barHeight = Math.max(3, (d.costWithSolar / maxCost) * chartHeight);
            const x = getX(i) - barWidth / 2;
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredYear === d.year;

            return (
              <g
                key={d.year}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredYear(d.year)}
                onClick={() => setHoveredYear(d.year)}
              >
                {/* Hit area for easy mouse tracking */}
                <rect
                  x={getX(i) - slotWidth / 2}
                  y={paddingTop}
                  width={slotWidth}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Solar Cost Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={isHovered ? '#ea580c' : '#fba06e'}
                  rx="1.5"
                  className="transition-all duration-150 group-hover:brightness-110"
                />

                {/* Dot marker on the conventional grid line */}
                <circle
                  cx={getX(i)}
                  cy={getY(d.costWithoutSolar)}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#0284c7' : '#38bdf8'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2 : 1}
                  className="transition-all duration-150"
                />

                {/* X-axis Year Label */}
                <text
                  x={getX(i)}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono tabular-nums transition-colors ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white font-bold text-[11px]'
                      : 'fill-slate-400'
                  }`}
                >
                  {d.year}
                </text>
              </g>
            );
          })}

          {/* X Axis Title */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-[11px] font-bold fill-slate-500 uppercase tracking-wider"
          >
            Año
          </text>

          {/* Active Hover / Pinned Tooltip Overlay */}
          {activeData && (() => {
            const activeIndex = activeData.year - 1;
            const tooltipX = getX(activeIndex);
            const tooltipY = Math.min(
              getY(activeData.costWithSolar),
              getY(activeData.costWithoutSolar)
            ) - 15;

            // Constrain tooltip x inside bounds
            const constrainedX = Math.max(120, Math.min(width - 120, tooltipX));

            return (
              <g
                className="pointer-events-none transition-all duration-200"
                transform={`translate(${constrainedX}, ${Math.max(60, tooltipY)})`}
              >
                {/* Tooltip Card Box (Matches dark tooltip in user screenshot) */}
                <rect
                  x="-105"
                  y="-58"
                  width="210"
                  height="60"
                  rx="8"
                  className="fill-slate-900/95 stroke-slate-700/80 filter drop-shadow-lg"
                />

                {/* Pointer arrow */}
                <polygon
                  points="0,6 -6,0 6,0"
                  className="fill-slate-900"
                />

                {/* Tooltip Header: Year */}
                <text
                  x="-90"
                  y="-38"
                  className="fill-white font-black text-[12px] font-mono"
                >
                  Año {activeData.year}
                </text>

                {/* Line 1: Solar System Cost */}
                <rect x="-90" y="-30" width="8" height="8" rx="1.5" fill="#fba06e" />
                <text
                  x="-76"
                  y="-23"
                  className="fill-slate-200 text-[10px] font-medium"
                >
                  Costo sistema solar: {formatCompactCurrency(activeData.costWithSolar, inputs.currencyCode)}
                </text>

                {/* Line 2: Conventional Grid Cost */}
                <rect x="-90" y="-17" width="8" height="8" rx="1.5" fill="#38bdf8" />
                <text
                  x="-76"
                  y="-10"
                  className="fill-slate-200 text-[10px] font-medium"
                >
                  Red convencional: {formatCompactCurrency(activeData.costWithoutSolar, inputs.currencyCode)}
                </text>
              </g>
            );
          })()}
        </svg>

      </div>

      {/* Selected Year Detail Summary Card */}
      {activeData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Gasto Red Eléctrica Tradicional (Año {activeData.year})
            </span>
            <span className="text-sm sm:text-base font-bold text-rose-500 dark:text-rose-400 tabular-nums mt-0.5">
              {formatCurrencyValue(activeData.costWithoutSolar, inputs.currencyCode)} / año
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Costo con Sistema Solar (Año {activeData.year})
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-500 tabular-nums mt-0.5">
              {formatCurrencyValue(activeData.costWithSolar, inputs.currencyCode)} / año
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {activeData.year <= 6 ? 'Incluye cuota de amortización' : 'Sistema 100% amortizado'}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Ahorro Anual en este Año
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              + {formatCurrencyValue(activeData.annualSavings, inputs.currencyCode)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Ahorro acumulado a este año: {formatCompactCurrency(activeData.netCumulativeSavings, inputs.currencyCode)}
            </span>
          </div>
        </div>
      )}

      {/* Break-even explanation */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Recuperación Total en {results.paybackYears} Años
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Durante los primeros 6 años cubres el sistema; a partir del año 7 el costo cae drásticamente y tu energía es prácticamente gratis mientras la tarifa de red sigue subiendo.
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400">Ahorro Neto Proyectado a 30 Años:</span>
          <p className="text-base sm:text-lg font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrencyValue(results.cumulative30YearSavings, inputs.currencyCode)}
          </p>
        </div>
      </div>

    </div>
  );
};
