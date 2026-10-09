import React, { useState } from 'react';
import { X, Printer, CheckCircle, Send, ShieldCheck, Sun, FileText } from 'lucide-react';
import { SolarCalculationResults, SolarInputs } from '../types/solar';
import { CITIES, CURRENCIES } from '../constants/solarData';
import { formatCurrencyValue } from '../utils/solarCalculator';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SolarCalculationResults;
  inputs: SolarInputs;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  results,
  inputs,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: CITIES.find((c) => c.id === inputs.cityId)?.name || '',
    address: '',
    comments: '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const currency = CURRENCIES[inputs.currencyCode] || CURRENCIES.USD;
  const cityName = CITIES.find((c) => c.id === inputs.cityId)?.name || 'Tu Ciudad';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Por favor ingresa tu nombre completo';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      newErrors.phone = 'Ingresa un número telefónico de contacto';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display">
                {submitted ? 'Cotización Formal Generada' : 'Solicitar Propuesta & Ficha Técnica'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistema Fotovoltaico {results.actualInstalledKwp} kWp para {cityName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir o Guardar como PDF"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Technical Summary Header (Visible in print) */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-lg font-black font-display tracking-tight text-slate-900 dark:text-white">
                SOLARIS<span className="text-amber-500">PRO</span> INGENIERÍA
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Ref: SOL-{Math.floor(100000 + Math.random() * 900000)} · Validez: 30 Días
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Capacidad:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {results.actualInstalledKwp} kWp
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Paneles:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {results.panelCount} x {results.panelWattage}W
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Ahorro Estimado:</span>
              <strong className="text-sm font-bold text-emerald-500 tabular-nums">
                {results.savingsPercentage}% / mes
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Inversión Neta:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrencyValue(results.netInvestmentCost, inputs.currencyCode)}
              </strong>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              🛰️ <strong>Fuente de Radiación:</strong> NASA POWER API ({results.effectiveHspUsed} HSP · Lat {inputs.latitude.toFixed(2)}°, Lon {inputs.longitude.toFixed(2)}°)
            </span>
            <span className="hidden sm:inline">
              NASA Langley Research Center Climatology (20 Años)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold font-display">¡Solicitud Registrada con Éxito!</h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Hemos enviado la memoria técnica a <strong>{formData.email}</strong>. Uno de nuestros ingenieros solares certificados se pondrá en contacto al <strong>{formData.phone}</strong> para agendar la visita técnica y verificar la estructura de tu tejado sin costo.
              </p>

              <div className="pt-4 flex justify-center gap-3 no-print">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                >
                  Entendido, Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
              
              {/* Left Column: Live Summary of the Project */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Reflejo del Proyecto
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {results.actualInstalledKwp} kWp
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Módulos:</span>
                    <strong className="text-slate-900 dark:text-white tabular-nums">
                      {results.panelCount} de {results.panelWattage}W
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Generación mensual:</span>
                    <strong className="text-slate-900 dark:text-white tabular-nums">
                      ~{results.monthlyGenerationKwh} kWh/mes
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ahorro proyectado:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                      {results.savingsPercentage}% ({formatCurrencyValue(results.monthlySavingsAmount, inputs.currencyCode)}/mes)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Retorno de inversión:</span>
                    <strong className="text-amber-500 font-bold tabular-nums">
                      {results.paybackYears} Años (ROI {results.estimatedRoiPercentage}%)
                    </strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                    <span className="text-slate-500">Inversión neta:</span>
                    <strong className="text-slate-900 dark:text-white text-sm font-black tabular-nums">
                      {formatCurrencyValue(results.netInvestmentCost, inputs.currencyCode)}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  ✓ Incluye gestión completa de legalización e inyección a red (Net Metering) con certificación oficial NASA POWER ({results.effectiveHspUsed} HSP).
                </div>
              </div>

              {/* Right Column: Contact Lead Form */}
              <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Rodríguez"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="carlos@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.email && <p className="text-[11px] text-rose-500">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+57 300 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.phone && <p className="text-[11px] text-rose-500">{errors.phone}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Ciudad / Municipio
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                </div>

                {/* Comments */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Notas o Requerimientos Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Deseo verificar financiamiento a 6 años o espacio en techo..."
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Datos protegidos.
                  </span>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 hover:from-emerald-300 hover:to-amber-200 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar y Enviar Solicitud</span>
                  </button>
                </div>
              </form>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
