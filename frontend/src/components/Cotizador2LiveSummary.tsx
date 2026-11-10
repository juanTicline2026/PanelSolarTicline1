import { Info, Sparkles } from 'lucide-react';
import { Cotizador2Results } from '../utils/cotizador2Engine';
import { ColombianCity } from '../constants/colombianCities';

const nf = (v: number, d = 0) =>
  Number.isFinite(v) && v > 0
    ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)
    : '0';

const cop = (v: number) => `$ ${nf(v)} COP`;
const pct = (v: number) => (Number.isFinite(v) && v > 0 ? `${nf(v * 100, 2)}%` : '0%');

interface Props {
  r: Cotizador2Results;
  selectedCity: ColombianCity;
}

export function Cotizador2LiveSummary({ r, selectedCity }: Props) {
  return (
    <div className="lg:col-span-4 sticky top-24 space-y-6">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                r.requerido.paneles > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
              }`}
            />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Dimensionamiento en Vivo
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            PostgreSQL + Backend
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Ciudad y Radiación (Colombia)</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {selectedCity.nombre}, {selectedCity.departamento}
              </span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {r.radiacion.toFixed(2)} HSP
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Potencia y Paneles Requeridos</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {r.requerido.paneles} paneles
              </span>
              <span className="text-sm font-extrabold text-emerald-500">{nf(r.requerido.kwp, 2)} kWp</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Área requerida en cubierta: {nf(r.requerido.areaRequerida, 1)} m²
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Ahorro Mensual Estimado</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {cop(r.ahorroMensualCop)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Generación: {nf(r.requerido.produccionMensual, 1)} kWh/mes ({pct(r.requerido.ahorro)} de cobertura)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Inversión Llave en Mano (+0,5%)</span>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {cop(r.costoSolucionFinal)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Sin ajuste: {cop(r.costoSolucion)} · Ajuste 0,5%: {cop(r.ajusteInversion)}
            </span>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>
                Retorno: {nf(r.retornoAnios)} años ({nf(r.retornoMeses)} meses)
              </span>
              <span className="font-bold text-amber-500">TIR: {pct(r.tir)}</span>
            </div>
          </div>

          {r.requerido.paneles === 0 ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Inicia en cero. Al ingresar tus datos en el formulario se calculará automáticamente en tiempo real.</span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Dimensionamiento calculado con las fórmulas de PostgreSQL.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

