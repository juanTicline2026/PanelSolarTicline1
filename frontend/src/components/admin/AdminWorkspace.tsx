import React, { useState } from 'react';
import {
  FolderKanban,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  LayoutDashboard,
  Sun,
  User,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { GestionCotizacionesView } from './GestionCotizacionesView';
import { RolesPermisosView } from './RolesPermisosView';

export type AdminViewType = 'cotizaciones' | 'roles';

interface Props {
  initialView?: AdminViewType;
  currentUser?: { email: string; nombre: string; rol?: string } | null;
  onBackToCalculator: () => void;
}

export const AdminWorkspace: React.FC<Props> = ({
  initialView = 'cotizaciones',
  currentUser,
  onBackToCalculator,
}) => {
  const [activeView, setActiveView] = useState<AdminViewType>(initialView);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const esAdmin = currentUser?.rol?.toLowerCase().includes('admin') ?? false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =================================================================== */}
        {/* PANEL IZQUIERDO: PANEL ADMINISTRATIVO                               */}
        {/* =================================================================== */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 shadow-xl space-y-4">
            
            {/* Header del Panel Administrativo (Desplegable) */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <LayoutDashboard className="w-4 h-4 font-black" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Panel Administrativo</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Gestión del Sistema
                    </div>
                  </div>
                </div>

                <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
                  {isMenuOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
            </div>

            {/* Menú Desplegable con las opciones CRUD */}
            {isMenuOpen && (
              <nav className="space-y-1.5 animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Módulos Disponibles
                </div>

                {/* Opción 1: Gestionar Cotizaciones (CRUD Completo) */}
                <button
                  type="button"
                  onClick={() => setActiveView('cotizaciones')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    activeView === 'cotizaciones'
                      ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban
                      className={`w-4 h-4 transition-colors ${
                        activeView === 'cotizaciones'
                          ? 'text-emerald-500'
                          : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <div>
                      <div>Gestionar cotizaciones</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        CRUD completo en BD
                      </div>
                    </div>
                  </div>
                  {activeView === 'cotizaciones' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>

                {/* Opción 2: Roles y Permisos (SOLO VISIBLE SI ES ADMINISTRADOR) */}
                {esAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveView('roles')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                      activeView === 'roles'
                        ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck
                        className={`w-4 h-4 transition-colors ${
                          activeView === 'roles'
                            ? 'text-emerald-500'
                            : 'text-slate-400 group-hover:text-emerald-400'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Roles y permisos</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold uppercase">
                            Admin
                          </span>
                        </div>
                        <div className="text-[10px] font-normal text-slate-400">
                          Asignación de privilegios
                        </div>
                      </div>
                    </div>
                    {activeView === 'roles' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </button>
                )}
              </nav>
            )}

            {/* Acceso Rápido: Volver al Cotizador */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onBackToCalculator}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>Volver al Cotizador</span>
              </button>
            </div>

            {/* Tarjeta de Usuario Actual */}
            {currentUser && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  {currentUser.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">
                    {currentUser.nombre}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.rol || 'Usuario'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* =================================================================== */}
        {/* ÁREA PRINCIPAL: VISTA ACTIVA SEGÚN SELECCIÓN EN EL PANEL IZQUIERDO  */}
        {/* =================================================================== */}
        <main className="lg:col-span-9">
          {activeView === 'cotizaciones' ? (
            <GestionCotizacionesView currentUser={currentUser} />
          ) : (
            <RolesPermisosView currentUser={currentUser} />
          )}
        </main>

      </div>
    </div>
  );
};
