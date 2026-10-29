import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Cotizador2Calculator } from './components/Cotizador2Calculator';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('COP');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  // Synchronize HTML dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleStartCalculator = () => {
    setShowCalculator(true);
    setTimeout(() => {
      const el = document.getElementById('calculadora');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleOpenQuote = () => {
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
      />

      {/* Hero Section Inicial */}
      <HeroSection
        onStartCalculator={handleStartCalculator}
      />

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

      {/* Footer con Logo Oficial Ticline (Sin relleno, letras directas) */}
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
