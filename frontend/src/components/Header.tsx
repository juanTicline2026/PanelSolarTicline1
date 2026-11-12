import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, FileText, LogOut, User, Settings, ChevronDown, ShieldCheck, FolderKanban } from 'lucide-react';
import { CURRENCIES } from '../constants/solarData';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedCurrency: string;
  onSelectCurrency: (code: string) => void;
  onOpenQuoteModal: () => void;
  onOpenCalculator?: () => void;
  onOpenPanelAdmin?: () => void;
  onOpenRolesPermisos?: () => void;
  onOpenGestionCotizaciones?: () => void;
  onLogout?: () => void;
  currentUser?: { email: string; nombre: string; rol?: string } | null;
  activeSection?: 'calculator' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  selectedCurrency,
  onSelectCurrency,
  onOpenQuoteModal,
  onOpenCalculator,
  onOpenPanelAdmin,
  onOpenRolesPermisos,
  onOpenGestionCotizaciones,
  onLogout,
  currentUser,
  activeSection = 'calculator',
}) => {
  const [configOpen, setConfigOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const esAdmin = currentUser?.rol?.toLowerCase().includes('admin') ?? false;

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setConfigOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Logo Oficial Ticline (Sin relleno, letras directas) */}
        <div className="flex items-center gap-3">
          <a href="#" onClick={onOpenCalculator} className="flex items-center group py-1">
            <img
              src="/ticline-logo.png"
              alt="TICLINE EVOLUCIÓN"
              className="h-9 sm:h-10 w-auto object-contain dark:brightness-0 dark:invert transition-all"
            />
          </a>
        </div>

        {/* Zone 2: Navigation Links con Tipografía Cursiva */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={onOpenCalculator}
            style={{ fontFamily: "'Dancing Script', cursive, sans-serif" }}
            className={`text-2xl font-bold italic tracking-wide transition-colors cursor-pointer ${
              activeSection === 'calculator'
                ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            Cotizador Solar
          </button>

          <button
            type="button"
            onClick={onOpenPanelAdmin || onOpenGestionCotizaciones}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'admin'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <span>Panel Administrativo</span>
            {esAdmin && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold uppercase">
                Admin
              </span>
            )}
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

          {/* Menú Desplegable "Configuración" */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setConfigOpen(!configOpen)}
              aria-expanded={configOpen}
              aria-haspopup="true"
              title="Configuración"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                configOpen
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 hover:text-emerald-500 dark:hover:text-emerald-400'
              }`}
            >
              <Settings className={`w-3.5 h-3.5 transition-transform duration-300 ${configOpen ? 'rotate-90 text-emerald-500' : ''}`} />
              <span className="hidden sm:inline">Configuración</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${configOpen ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* Dropdown flotante con las opciones */}
            {configOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn ring-1 ring-black/5 divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Opciones de Sistema
                </div>
                
                <div className="py-1">
                  {/* Opción 1: Roles y permisos - SOLO VISIBLE SI ES ADMINISTRADOR */}
                  {esAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        onOpenRolesPermisos?.();
                      }}
                      className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:scale-110 transition-transform mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold leading-tight flex items-center justify-between">
                          <span>Roles y permisos</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold">Admin</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          Asignar y gestionar permisos por usuario
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Opción 2: Gestionar tus cotizaciones */}
                  <button
                    type="button"
                    onClick={() => {
                      setConfigOpen(false);
                      onOpenGestionCotizaciones?.();
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-teal-500/10 dark:hover:bg-teal-500/15 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group cursor-pointer"
                  >
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 dark:bg-teal-500/20 dark:text-teal-400 group-hover:scale-110 transition-transform mt-0.5">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold leading-tight">
                        Gestionar tus cotizaciones
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        CRUD completo de propuestas en base de datos
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenQuoteModal}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Solicitar Propuesta</span>
            <span className="sm:hidden">Cotizar</span>
          </button>

          {/* User Profile & Logout */}
          {onLogout && (
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
              {currentUser && (
                <span className="hidden xl:inline text-xs font-semibold text-slate-400 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  {currentUser.nombre}
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/40 hover:scale-105 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
