import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LogOut, User, Settings, ChevronDown, ShieldCheck, Users } from 'lucide-react';
import { hasPermission, PermissionUser } from '../utils/permissions';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCalculator?: () => void;
  onOpenPanelAdmin?: () => void;
  onOpenRolesPermisos?: () => void;
  onOpenGestionCotizaciones?: () => void;
  onOpenGestionUsuarios?: () => void;
  onLogout?: () => void;
  currentUser?: PermissionUser | null;
  activeSection?: 'calculator' | 'admin';
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenCalculator,
  onOpenPanelAdmin,
  onOpenRolesPermisos,
  onOpenGestionCotizaciones,
  onOpenGestionUsuarios,
  onLogout,
  currentUser,
  activeSection = 'calculator',
}) => {
  const [configOpen, setConfigOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const esAdmin = currentUser?.rol?.toLowerCase().includes('admin') ?? false;
  const canViewCotizaciones = hasPermission(currentUser, 'cotizaciones:ver');
  const canAdminRoles = hasPermission(currentUser, 'roles:administrar');
  const canViewUsuarios = hasPermission(currentUser, 'usuarios:ver');
  const showConfigMenu = canAdminRoles || canViewUsuarios;

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
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Bloque 1: Logo Oficial Ticline + Título Cotizador Solar centrado debajo */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <a href="#" onClick={onOpenCalculator} className="flex items-center group">
            <img
              src="/ticline-logo.png"
              alt="TICLINE EVOLUCIÓN"
              className="h-7 sm:h-8 w-auto object-contain dark:brightness-0 dark:invert transition-all"
            />
          </a>
          <button
            type="button"
            onClick={onOpenCalculator}
            style={{ fontFamily: "'Dancing Script', cursive, sans-serif" }}
            className={`text-lg sm:text-xl font-bold italic leading-tight tracking-wide mt-0.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === 'calculator'
                ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            Cotizador Solar
          </button>
        </div>

        {/* Bloque 2: Gestión de Cotizaciones (según permiso cotizaciones:ver) */}
        {canViewCotizaciones && (
          <nav className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenPanelAdmin || onOpenGestionCotizaciones}
              className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'admin'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <span>Gestion cotizaciones</span>
              {esAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold uppercase">
                  Admin
                </span>
              )}
            </button>
          </nav>
        )}

        {/* Bloque 3: Menú Desplegable "Configuración" */}
        {showConfigMenu && (
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setConfigOpen(!configOpen)}
              aria-expanded={configOpen}
              aria-haspopup="true"
              title="Configuración"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
                  {/* Opción 1: Roles y permisos */}
                  {canAdminRoles && (
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

                  {/* Opción 2: Gestión de Usuarios */}
                  {canViewUsuarios && (
                    <button
                      type="button"
                      onClick={() => {
                        setConfigOpen(false);
                        onOpenGestionUsuarios?.();
                      }}
                      className="w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-teal-500/10 dark:hover:bg-teal-500/15 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 dark:bg-teal-500/20 dark:text-teal-400 group-hover:scale-110 transition-transform mt-0.5">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold leading-tight">
                          Gestión de Usuarios
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          CRUD completo de usuarios en base de datos
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bloque 4: Usuario, Cerrar Sesión y Tema */}
        <div className="flex items-center gap-2 shrink-0">
          {onLogout && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              {currentUser && (
                <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{currentUser.nombre}</span>
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/40 hover:scale-105 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dark / Light Toggle en el costado derecho extremo */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema claro y oscuro"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:scale-105 transition-all cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
};
