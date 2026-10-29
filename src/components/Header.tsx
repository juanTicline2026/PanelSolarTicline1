import React from 'react';
import { Sun, Moon, FileText } from 'lucide-react';
import { CURRENCIES } from '../constants/solarData';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  onOpenQuoteModal: () => void;
  onOpenCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  selectedCurrency,
  onSelectCurrency,
  onOpenQuoteModal,
  onOpenCalculator,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Logo Oficial Ticline (Sin relleno, letras directas) */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center group py-1">
            <img
              src="/ticline-logo.png"
              alt="TICLINE EVOLUCIÓN"
              className="h-9 sm:h-10 w-auto object-contain dark:brightness-0 dark:invert transition-all"
            />
          </a>
        </div>

        {/* Zone 2: Navigation Links con Tipografía Cursiva */}
        <nav className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenCalculator}
            style={{ fontFamily: "'Dancing Script', cursive, sans-serif" }}
            className="text-2xl font-bold italic tracking-wide text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Cotizador Solar
          </button>
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
