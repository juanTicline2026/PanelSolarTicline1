import React from 'react';
import { ArrowRight, Zap, ShieldCheck, TrendingDown, Sun } from 'lucide-react';

interface HeroSectionProps {
  onStartCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCalculator,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
      
      {/* Decorative ambient lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Proposition and Actions */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ingeniería Fotovoltaica · Fórmulas Oficiales Cotizador2 & Radiación Departamental
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white leading-[1.15]" style={{ textWrap: 'balance' }}>
              Calculadora de Energía Solar <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">Un Futuro Renovable</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Dimensiona tu sistema fotovoltaico en <strong>kWp</strong>, estima el número de paneles, tu ahorro mensual y el retorno de inversión con las fórmulas exactas del modelo de ingeniería y tarifas residencial/comercial.
            </p>

            {/* Micro value proofs */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-1 border-y border-slate-200 dark:border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-emerald-500 font-display tabular-nums">Hasta 95%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Ahorro en Factura</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-amber-500 font-display tabular-nums">2.8 - 4.5</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Años Retorno (ROI)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-blue-500 font-display tabular-nums">25 Años</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Garantía de Potencia</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartCalculator}
                className="px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Calcular Mi Proyecto Ahora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quality certifications trust line */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Paneles Tier 1 Bloomberg
              </span>
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-blue-500" /> Datos Satelitales NASA POWER (GHI / HSP)
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-500" /> Inversores Eficiencia 98.6%
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl shadow-emerald-950/20 group">
              <img
                src="/src/assets/images/solar_rooftop_hero_1791465806784.jpg"
                alt="Instalación de paneles solares fotovoltaicos sobre techo residencial moderno al atardecer"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-84 lg:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              {/* Float badge preview */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl backdrop-blur-md bg-slate-900/80 border border-slate-700/60 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Generación Limpia Estimada</p>
                    <p className="text-sm font-bold text-white">Autoconsumo & Balance Neto</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase text-emerald-400 font-semibold tracking-wider">Activo</span>
                  <p className="text-xs text-slate-400">25 Años Vida Útil</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
