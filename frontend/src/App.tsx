import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Header } from './components/Header';
import { Cotizador2Calculator } from './components/Cotizador2Calculator';
import { Login, AuthUser } from './components/Login';
import { GestionCotizacionesView } from './components/admin/GestionCotizacionesView';
import { GestionUsuariosView } from './components/admin/GestionUsuariosView';
import { RolesPermisosView } from './components/admin/RolesPermisosView';

type AdminViewType = 'cotizaciones' | 'usuarios' | 'roles';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => true);

  // Navegación principal: 'calculator' o 'admin'
  const [currentSection, setCurrentSection] = useState<'calculator' | 'admin'>('calculator');
  const [adminSubView, setAdminSubView] = useState<AdminViewType>('cotizaciones');

  // Al iniciar la plataforma siempre arranca en false para exigir Login contra PostgreSQL
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const handleLoginSuccess = (token: string, user: AuthUser) => {
    sessionStorage.setItem('solar_auth_token', token);
    sessionStorage.setItem('solar_auth_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('solar_auth_token');
    localStorage.removeItem('solar_auth_user');
    sessionStorage.removeItem('solar_auth_token');
    sessionStorage.removeItem('solar_auth_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentSection('calculator');
  };

  // Limpiar cualquier token viejo al cargar por primera vez para obligar a pasar por el Login
  useEffect(() => {
    localStorage.removeItem('solar_auth_token');
    localStorage.removeItem('solar_auth_user');
  }, []);

  // Sincronizar rol y permisos vivos desde PostgreSQL (/api/auth/me)
  const syncCurrentUserFromDb = useCallback(async () => {
    if (!isAuthenticated) return;
    const token = sessionStorage.getItem('solar_auth_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.user) {
        const updatedUser: AuthUser = {
          id: String(data.user.userId || currentUser?.id || ''),
          email: data.user.email || currentUser?.email || '',
          nombre: data.user.nombre || currentUser?.nombre || '',
          rol: data.user.rol || currentUser?.rol || '',
          permisos: Array.isArray(data.user.permisos) ? data.user.permisos : currentUser?.permisos,
        };
        sessionStorage.setItem('solar_auth_user', JSON.stringify(updatedUser));
        setCurrentUser((prev) => {
          const prevStr = JSON.stringify(prev);
          const nextStr = JSON.stringify(updatedUser);
          return prevStr === nextStr ? prev : updatedUser;
        });
      }
    } catch {
      // Ignorar errores transitorios de red durante el refresco en segundo plano
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.email, currentUser?.nombre, currentUser?.rol]);

  useEffect(() => {
    if (!isAuthenticated) return;
    syncCurrentUserFromDb();
    const onFocus = () => syncCurrentUserFromDb();
    window.addEventListener('focus', onFocus);
    const interval = window.setInterval(syncCurrentUserFromDb, 15000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [isAuthenticated, currentSection, adminSubView, syncCurrentUserFromDb]);

  const handleUserPermissionsUpdated = (targetUserId: number, newRol: string, newPermisos: string[]) => {
    if (currentUser && String(currentUser.id) === String(targetUserId)) {
      const updated: AuthUser = { ...currentUser, rol: newRol, permisos: newPermisos };
      sessionStorage.setItem('solar_auth_user', JSON.stringify(updated));
      setCurrentUser(updated);
    }
  };

  // Synchronize HTML dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStartCalculator = () => {
    setCurrentSection('calculator');
    setTimeout(() => {
      const el = document.getElementById('calculadora');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };



  const handleOpenPanelAdmin = (view: AdminViewType = 'cotizaciones') => {
    setAdminSubView(view);
    setCurrentSection('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Si el usuario no ha iniciado sesión, mostrar siempre la pantalla de Login / Registro
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      {/* Top Bar Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenCalculator={handleStartCalculator}
        onOpenPanelAdmin={() => handleOpenPanelAdmin('cotizaciones')}
        onOpenRolesPermisos={() => handleOpenPanelAdmin('roles')}
        onOpenGestionCotizaciones={() => handleOpenPanelAdmin('cotizaciones')}
        onOpenGestionUsuarios={() => handleOpenPanelAdmin('usuarios')}
        onLogout={handleLogout}
        currentUser={currentUser}
        activeSection={currentSection}
      />

      {/* Renderizado Condicional: Vistas Administrativas vs Modo Cotizador */}
      {currentSection === 'admin' ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleStartCalculator}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 hover:text-emerald-500 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Cotizador</span>
            </button>
          </div>

          {adminSubView === 'cotizaciones' ? (
            <GestionCotizacionesView currentUser={currentUser} />
          ) : adminSubView === 'usuarios' ? (
            <GestionUsuariosView currentUser={currentUser} />
          ) : (
            <RolesPermisosView
              currentUser={currentUser}
              onUserPermissionsUpdated={handleUserPermissionsUpdated}
            />
          )}
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-14 animate-fadeIn">
          {/* Calculator Container: Cotizador Solar Oficial */}
          <section id="calculadora" className="scroll-mt-20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Herramienta de Cotización de Ingeniería
                </span>
                <h2 className={`text-2xl sm:text-3xl font-extrabold font-display ${darkMode ? 'text-white' : 'text-slate-900'} tracking-tight drop-shadow-sm`}>
                  Cotizador Solar Fotovoltaico
                </h2>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Fórmulas Oficiales de Ingeniería Solar para Ciudades de Colombia</span>
              </div>
            </div>

            <Cotizador2Calculator currentUser={currentUser} />
          </section>
        </main>
      )}

      {/* Footer con Logo Oficial Ticline */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-transparent py-8 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <img
            src="/ticline-logo.png"
            alt="TICLINE EVOLUCIÓN"
            className="h-8 sm:h-9 w-auto object-contain dark:brightness-0 dark:invert opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      </footer>
    </div>
  );
}
