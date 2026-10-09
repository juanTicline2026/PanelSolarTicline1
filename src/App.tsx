import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StepConsumption } from './components/WizardSteps/StepConsumption';
import { StepLocation } from './components/WizardSteps/StepLocation';
import { StepTech } from './components/WizardSteps/StepTech';
import { ResultsDashboard } from './components/ResultsDashboard';
import { RoofVisualizer } from './components/RoofVisualizer';
import { FinancialProjectionChart } from './components/FinancialProjectionChart';
import { EnvironmentalImpact } from './components/EnvironmentalImpact';
import { NasaSolarProfile } from './components/NasaSolarProfile';
import { LiveStudio } from './components/LiveStudio';
import { FaqSection } from './components/FaqSection';
import { QuoteModal } from './components/QuoteModal';
import { LiveReflectionSidebar } from './components/LiveReflectionSidebar';
import { CURRENCIES, CITIES } from './constants/solarData';
import { SolarInputs } from './types/solar';
import { calculateSolarSystem } from './utils/solarCalculator';
import { fetchNasaPowerData } from './services/nasaPowerService';
import { Sun, Check, Zap, Sparkles, Sliders } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return true; // Default to sleek dark mode with vibrant accents as requested
  });

  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [activeViewMode, setActiveViewMode] = useState<'wizard' | 'studio'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isLoadingNasa, setIsLoadingNasa] = useState<boolean>(false);

  // Initial Inputs with NASA POWER coordinates (defaults to CDMX)
  const [inputs, setInputs] = useState<SolarInputs>({
    calculationMode: 'bill',
    billAmount: CURRENCIES.USD.defaultBillAmount,
    monthlyKwh: 450,
    sector: 'residencial',
    cityId: 'mx-cdmx',
    latitude: 19.4326,
    longitude: -99.1332,
    sizingBasis: 'annual',
    customHsp: null,
    targetCoveragePct: 90,
    panelWattage: 550,
    systemType: 'on_grid',
    roofType: 'inclinado',
    currencyCode: 'USD',
  });

  // Query NASA POWER Data Access Viewer on coordinate change
  const loadNasaData = useCallback(async (lat: number, lon: number, cityId: string) => {
    setIsLoadingNasa(true);
    try {
      const data = await fetchNasaPowerData(lat, lon, cityId);
      setInputs((prev) => ({
        ...prev,
        nasaPowerData: data,
      }));
    } catch {
      // Handled via fallback in service
    } finally {
      setIsLoadingNasa(false);
    }
  }, []);

  useEffect(() => {
    loadNasaData(inputs.latitude, inputs.longitude, inputs.cityId);
  }, [inputs.latitude, inputs.longitude, inputs.cityId, loadNasaData]);

  // Handle currency change: adjust default bill values smoothly
  const handleCurrencyChange = (newCode: string) => {
    setSelectedCurrency(newCode);
    const curr = CURRENCIES[newCode] || CURRENCIES.USD;
    setInputs((prev) => ({
      ...prev,
      currencyCode: newCode,
      billAmount: curr.defaultBillAmount,
    }));
  };

  const handleUpdateInputs = (updates: Partial<SolarInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Synchronize HTML dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dynamic calculations engine
  const results = useMemo(() => {
    return calculateSolarSystem(inputs);
  }, [inputs]);

  const scrollToCalculator = () => {
    const el = document.getElementById('calculadora');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenStudio = () => {
    setActiveViewMode('studio');
    scrollToCalculator();
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-200`}>
      
      {/* Top Bar Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={handleCurrencyChange}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
        activeViewMode={activeViewMode}
        onToggleViewMode={setActiveViewMode}
      />

      {/* Hero Section */}
      <HeroSection
        onStartCalculator={scrollToCalculator}
        onExploreStudio={handleOpenStudio}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-14">
        
        {/* Calculator Container */}
        <section id="calculadora" className="scroll-mt-20 space-y-6">
          
          {/* View Mode & Step Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Herramienta de Cotización
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                {activeViewMode === 'wizard' ? 'Calculadora Asistida Paso a Paso' : 'Estudio de Ingeniería en Tiempo Real'}
              </h2>
            </div>

            {/* Quick Switch Button */}
            <div className="p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveViewMode('wizard')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeViewMode === 'wizard'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Paso a Paso
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode('studio')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  activeViewMode === 'studio'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Estudio 1-Page
              </button>
            </div>
          </div>

          {activeViewMode === 'wizard' ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-10 shadow-xl space-y-8">
              
              {/* Wizard Steps Stepper */}
              <div className="grid grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 pb-6">
                {[
                  { num: 1, title: 'Consumo' },
                  { num: 2, title: 'Ubicación' },
                  { num: 3, title: 'Tecnología' },
                  { num: 4, title: 'Resultados' },
                ].map((step) => {
                  const isDone = wizardStep > step.num;
                  const isCurrent = wizardStep === step.num;
                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => setWizardStep(step.num)}
                      className="flex flex-col sm:flex-row items-center gap-2 group cursor-pointer text-left focus:outline-none"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 ring-2 ring-emerald-400/40 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                      </div>
                      <div className="hidden sm:block">
                        <span
                          className={`text-xs font-bold block ${
                            isCurrent
                              ? 'text-slate-900 dark:text-white'
                              : isDone
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Step Render */}
              {wizardStep < 4 ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-7">
                    {wizardStep === 1 && (
                      <StepConsumption
                        inputs={inputs}
                        onChange={handleUpdateInputs}
                        onNext={() => setWizardStep(2)}
                      />
                    )}

                    {wizardStep === 2 && (
                      <StepLocation
                        inputs={inputs}
                        onChange={handleUpdateInputs}
                        onPrev={() => setWizardStep(1)}
                        onNext={() => setWizardStep(3)}
                      />
                    )}

                    {wizardStep === 3 && (
                      <StepTech
                        inputs={inputs}
                        onChange={handleUpdateInputs}
                        onPrev={() => setWizardStep(2)}
                        onCalculate={() => setWizardStep(4)}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-5">
                    <LiveReflectionSidebar
                      results={results}
                      inputs={inputs}
                      onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
                      onJumpToResults={() => setWizardStep(4)}
                    />
                  </div>
                </div>
              ) : (
                <ResultsDashboard
                  results={results}
                  inputs={inputs}
                  onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
                  onResetOrEdit={() => setWizardStep(1)}
                />
              )}

            </div>
          ) : (
            <LiveStudio
              inputs={inputs}
              results={results}
              onChange={handleUpdateInputs}
              onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
            />
          )}

        </section>

        {/* Interactive Roof Visualizer Section */}
        <section className="space-y-4">
          <RoofVisualizer results={results} inputs={inputs} />
        </section>

        {/* NASA POWER Climatology and Satellite Radiation Profile */}
        <section id="nasa-power" className="space-y-4 scroll-mt-20">
          <NasaSolarProfile
            inputs={inputs}
            results={results}
            onChange={handleUpdateInputs}
            onRefreshNasa={() => loadNasaData(inputs.latitude, inputs.longitude, inputs.cityId)}
            isLoadingNasa={isLoadingNasa}
          />
        </section>

        {/* Financial ROI and 25-Year Projection Section */}
        <section className="space-y-4">
          <FinancialProjectionChart results={results} inputs={inputs} />
        </section>

        {/* Environmental Impact Proof Section */}
        <section className="space-y-4">
          <EnvironmentalImpact results={results} />
        </section>

        {/* Technical FAQ Section */}
        <section className="space-y-4">
          <FaqSection />
        </section>

      </main>

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
            <span className="text-slate-400 ml-2">© 2026 Calculadora de Energía Solar · Un Futuro Renovable.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#calculadora" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Calculadora
            </a>
            <a href="#techo-solar" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Simulador
            </a>
            <a href="#retorno-roi" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Retorno ROI
            </a>
            <a href="#impacto-verde" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Sostenibilidad
            </a>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="text-emerald-500 hover:text-emerald-400 font-semibold cursor-pointer"
            >
              Cotización Formal
            </button>
          </div>
        </div>
      </footer>

      {/* Lead Capture and Formal Quote PDF Sheet Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        results={results}
        inputs={inputs}
      />

    </div>
  );
}
