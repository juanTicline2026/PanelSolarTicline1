import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { Cotizador2Calculator } from './components/Cotizador2Calculator';
import { Sun } from 'lucide-react';

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

      {/* Quiet High-Grade Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight font-display text-slate-900 dark:text-white">
              SOLARIS<span className="text-amber-500">PRO</span>
            </span>
            <span className="text-slate-400 ml-2">© 2026 Calculadora de Energía Solar · Un Futuro Renovable · Ticline S.A.S.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleStartCalculator}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cotizador
            </button>
            <button
              onClick={handleOpenQuote}
              className="text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer"
            >
              Generar Cotización PDF
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
