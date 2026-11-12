import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Cotizador2Calculator } from './components/Cotizador2Calculator';
import { Login, AuthUser } from './components/Login';
import { AdminWorkspace, AdminViewType } from './components/admin/AdminWorkspace';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('COP');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

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
    setShowCalculator(true);
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

  const handleOpenQuote = () => {
    setCurrentSection('calculator');
    if (!showCalculator) {
      setShowCalculator(true);
      setTimeout(() => {
        const btn = document.getElementById('btn-generar-pdf-cotizacion');
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth' });
          btn.classList.add('ring-4', 'ring-emerald-400');
          setTimeout(() => btn.classList.remove('ring-4', 'ring-emerald-400'), 2000);
        } else {
          handleStartCalculator();
        }
      }, 100);
    } else {
      const btn = document.getElementById('btn-generar-pdf-cotizacion');
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth' });
        btn.classList.add('ring-4', 'ring-emerald-400');
        setTimeout(() => btn.classList.remove('ring-4', 'ring-emerald-400'), 2000);
      } else {
        handleStartCalculator();
      }
    }
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
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        onOpenQuoteModal={handleOpenQuote}
        onOpenCalculator={handleStartCalculator}
        onOpenPanelAdmin={() => handleOpenPanelAdmin('cotizaciones')}
        onOpenRolesPermisos={() => handleOpenPanelAdmin('roles')}
        onOpenGestionCotizaciones={() => handleOpenPanelAdmin('cotizaciones')}
        onLogout={handleLogout}
        currentUser={currentUser}
        activeSection={currentSection}
      />

      {/* Renderizado Condicional: Modo Administrador vs Modo Cotizador */}
      {currentSection === 'admin' ? (
        <AdminWorkspace
          key={adminSubView}
          initialView={adminSubView}
          currentUser={currentUser}
          onBackToCalculator={handleStartCalculator}
        />
      ) : (
        <>
          {/* Hero Section Inicial */}
          <HeroSection onStartCalculator={handleStartCalculator} />

          {/* Main Content Area: Se muestra en secuencia tras pulsar 'Calcular Mi Proyecto Ahora' */}
          {showCalculator && (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-14 animate-fadeIn">
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

                <Cotizador2Calculator />
              </section>
            </main>
          )}
        </>
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
