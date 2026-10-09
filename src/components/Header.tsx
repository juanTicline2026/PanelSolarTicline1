import React from 'react';
import { Sun, Moon, Sparkles, FileText } from 'lucide-react';
import { CURRENCIES } from '../constants/solarData';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  onOpenQuoteModal: () => void;
  activeViewMode: 'wizard' | 'studio';
  onToggleViewMode: (mode: 'wizard' | 'studio') => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  selectedCurrency,
  onSelectCurrency,
  onOpenQuoteModal,
  activeViewMode,
  onToggleViewMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single Brand Wordmark Element */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight font-display bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                SOLARIS<span className="text-amber-500 dark:text-amber-400">PRO</span>
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links & View Mode Switcher */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center mr-2">
            <button
              onClick={() => onToggleViewMode('wizard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeViewMode === 'wizard'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Modo Asistente
            </button>
            <button
              onClick={() => onToggleViewMode('studio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                activeViewMode === 'studio'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Estudio Rápido
            </button>
          </div>

          <a href="#calculadora" className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Calculadora
          </a>
          <a href="#nasa-power" className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            NASA POWER
          </a>
          <a href="#techo-solar" className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Simulador
          </a>
          <a href="#retorno-roi" className="px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Retorno ROI
          </a>
          <a href="#impacto-verde" className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Impacto Verde
          </a>
          <a href="#faq" className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Preguntas
          </a>
        </nav>

        {/* Zone 3: Actions & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Dropdown */}
          <div className="relative">
            <select
              value={selectedCurrency}
              onChange={(e) => onSelectCurrency(e.target.value)}
              aria-label="Seleccionar moneda"
              className="appearance-none pl-2.5 pr-7 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {code} ({CURRENCIES[code].symbol})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema claro y oscuro"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenQuoteModal}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Solicitar Propuesta</span>
            <span className="sm:hidden">Cotizar</span>
          </button>
        </div>

      </div>
    </header>
  );
};
