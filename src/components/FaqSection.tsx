import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: '¿Qué sucede durante los días nublados o de lluvia intensa?',
    a: 'Los paneles solares fotovoltaicos funcionan con radiación difusa y espectro lumínico ultravioleta, por lo que siguen produciendo entre un 20% y un 40% de su capacidad nominal incluso bajo nubes densas. Además, gracias al sistema On-Grid interconectado, la red pública te suministra la energía faltante de forma automática e imperceptible.',
  },
  {
    q: '¿Cómo funciona la inyección de excedentes a la red (Net Metering o Balance Neto)?',
    a: 'Durante las horas de mayor sol (10:00 a 15:00), tu sistema usualmente produce más energía de la que tu hogar o negocio consume. El excedente se inyecta automáticamente a la red eléctrica a través de un medidor bidireccional homologado. La empresa de energía te compensa o acredita estos kWh en tu factura mensual.',
  },
  {
    q: '¿Qué mantenimiento preventivo requieren los paneles solares?',
    a: 'El mantenimiento es mínimo debido a que no cuentan con piezas móviles. Se recomienda realizar una limpieza superficial con agua desmineralizada y cepillo suave de 2 a 3 veces por año para retirar polvo, hojas o residuos de aves, y una inspección termográfica de aprietes eléctricos cada 12 meses.',
  },
  {
    q: '¿Qué garantías respaldan la inversión?',
    a: 'Los paneles solares Tier 1 cuentan con 12 a 15 años de garantía contra defectos de fabricación y 25 años de garantía lineal de generación de potencia (asegurando más del 84.8% de su rendimiento original al año 25). Los inversores cuentan con 5 a 10 años de garantía ampliable, y las estructuras de aluminio hasta 15 años.',
  },
  {
    q: '¿Cómo utiliza esta calculadora los datos del visor NASA POWER?',
    a: 'Nuestra calculadora se conecta directamente a la API de climatología satelital de la NASA (NASA POWER - Prediction Of Worldwide Energy Resources de Langley Research Center). Extrae la irradiación global horizontal (ALLSKY_SFC_SW_DWN en kWh/m²/día o Horas de Sol Pico HSP) promediada durante más de 20 años de observaciones satelitales y asimilación MERRA-2, además de la temperatura ambiente a 2 metros (T2M) para calcular la pérdida térmica real de los paneles fotovoltaicos.',
  },
  {
    q: '¿Puedo iniciar con un sistema On-Grid y agregar baterías de litio después?',
    a: '¡Sí! Si seleccionas un inversor híbrido "Battery-Ready", puedes empezar ahorrando el 90% en tu factura sin baterías hoy, y en el futuro acoplar un banco de baterías de litio (LiFePO4) plug-and-play cuando lo desees para contar con respaldo ante cortes de suministro.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <HelpCircle className="w-3.5 h-3.5" />
            Respuestas de Ingeniería
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Preguntas Frecuentes sobre Energía Solar
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
