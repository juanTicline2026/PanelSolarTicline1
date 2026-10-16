import React, { useMemo, useState } from 'react';
import {
  COTIZADOR2_DEFAULTS,
  Cotizador2Inputs,
  PANELES_DISPONIBLES,
  RADIACION_DEPARTAMENTOS,
  RadiacionTipo,
  calculateCotizador2,
} from '../utils/cotizador2Engine';

const nf = (v: number, d = 0) =>
  new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const cop = (v: number) => `$ ${nf(v)} COP`;

const field =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function NumberField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <Field label={label}>
      <input
        type="number"
        className={field}
        value={Number.isFinite(value) ? value : ''}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </Field>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className={`text-sm tabular-nums ${strong ? 'font-extrabold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-slate-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Cotizador2Calculator() {
  const [inp, setInp] = useState<Cotizador2Inputs>(COTIZADOR2_DEFAULTS);
  const set = (u: Partial<Cotizador2Inputs>) => setInp((p) => ({ ...p, ...u }));
  const r = useMemo(() => calculateCotizador2(inp), [inp]);
  const pct = (v: number) => `${nf(v * 100, 2)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Entradas */}
      <div className="lg:col-span-5 space-y-6">
        <Card title="Datos del cliente">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="TRM del día" value={inp.trm} onChange={(v) => set({ trm: v })} />
            <NumberField label="Consumo promedio (kWh/mes)" value={inp.consumoKwh} onChange={(v) => set({ consumoKwh: v })} />
            <NumberField label="Costo del kWh (COP)" value={inp.costoKwhBase} step={0.01} onChange={(v) => set({ costoKwhBase: v })} />
            <Field label="Contribución 20%">
              <select className={field} value={inp.contribucion20 ? 'Si' : 'No'} onChange={(e) => set({ contribucion20: e.target.value === 'Si' })}>
                <option>Si</option>
                <option>No</option>
              </select>
            </Field>
            <NumberField label="Transformador (kVA)" value={inp.transformador} onChange={(v) => set({ transformador: v })} />
            <NumberField label="Ahorro deseado (1 = 100%)" value={inp.ahorroDeseado} step={0.05} onChange={(v) => set({ ahorroDeseado: v })} />
          </div>
        </Card>

        <Card title="Sistema y ubicación">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Área disponible (m²)" value={inp.areaDisponible} onChange={(v) => set({ areaDisponible: v })} />
            <Field label="Capacidad del panel (W)">
              <select className={field} value={inp.potenciaPanel} onChange={(e) => set({ potenciaPanel: Number(e.target.value) })}>
                {PANELES_DISPONIBLES.map((w) => (
                  <option key={w} value={w}>{w} W</option>
                ))}
              </select>
            </Field>
            <Field label="Departamento">
              <select className={field} value={inp.departamento} onChange={(e) => set({ departamento: e.target.value })}>
                {RADIACION_DEPARTAMENTOS.map((d) => (
                  <option key={d[0]}>{d[0]}</option>
                ))}
              </select>
            </Field>
            <Field label="Radiación">
              <select className={field} value={inp.radiacionTipo} onChange={(e) => set({ radiacionTipo: e.target.value as RadiacionTipo })}>
                <option>Promedio</option>
                <option>Minimo</option>
                <option>Maximo</option>
              </select>
            </Field>
            <NumberField label="Turnos de operación" value={inp.turnosOperacion} onChange={(v) => set({ turnosOperacion: v })} />
          </div>
        </Card>

        <Card title="Modelo financiero">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Beneficio tributario">
              <select className={field} value={inp.beneficioTributario ? 'Si' : 'No'} onChange={(e) => set({ beneficioTributario: e.target.value === 'Si' })}>
                <option>Si</option>
                <option>No</option>
              </select>
            </Field>
            <Field label="Mantenimiento gratis (año 1)">
              <select className={field} value={inp.mantenimientoGratis ? 'Si' : 'No'} onChange={(e) => set({ mantenimientoGratis: e.target.value === 'Si' })}>
                <option>Si</option>
                <option>No</option>
              </select>
            </Field>
            <Field label="Financiación">
              <select className={field} value={inp.financiacion ? 'Si' : 'No'} onChange={(e) => set({ financiacion: e.target.value === 'Si' })}>
                <option>No</option>
                <option>Si</option>
              </select>
            </Field>
            {inp.financiacion && (
              <>
                <NumberField label="Valor del crédito (COP)" value={inp.valorCredito} onChange={(v) => set({ valorCredito: v })} />
                <NumberField label="Plazo (meses)" value={inp.plazoMeses} onChange={(v) => set({ plazoMeses: v })} />
                <NumberField label="Tasa mensual" value={inp.tasaMensual} step={0.001} onChange={(v) => set({ tasaMensual: v })} />
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Resultados */}
      <div className="lg:col-span-7 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card title="Sistema según área disponible">
            <Row label="Valor kWh factura" value={nf(r.valorKwhFactura, 3)} />
            <Row label="Consumo kWh/mes" value={nf(inp.consumoKwh)} />
            <Row label="Potencia en área kW" value={nf(r.potenciaEnAreaKw, 2)} />
            <Row label="Paneles por área" value={nf(r.porArea.paneles)} />
            <Row label="Potencia panel" value={`${nf(inp.potenciaPanel)} W`} />
            <Row label="Área requerida" value={`${nf(r.porArea.areaRequerida)} m²`} />
            <Row label="Producción mensual" value={`${nf(r.porArea.produccionMensual)} kWh`} />
            <Row label="Wp instalados" value={nf(r.porArea.wpInstalados)} />
            <Row label="kWp" value={nf(r.porArea.kwp, 2)} />
            <Row label="Radiación" value={nf(r.radiacion, 2)} />
            <Row label="Ahorro" value={pct(r.porArea.ahorro)} strong />
          </Card>

          <Card title="Sistema requerido por consumo">
            <Row label="Potencia P requerida" value={nf(r.requerido.potenciaRequeridaW ?? 0)} />
            <Row label="Paneles" value={nf(r.requerido.paneles)} />
            <Row label="Potencia pico ofrecida" value={nf(r.requerido.potenciaPicoOfrecida ?? 0)} />
            <Row label="Área requerida" value={`${nf(r.requerido.areaRequerida)} m²`} />
            <Row label="Producción mensual" value={`${nf(r.requerido.produccionMensual)} kWh`} />
            <Row label="Wp instalados" value={nf(r.requerido.wpInstalados)} />
            <Row label="kWp" value={nf(r.requerido.kwp, 2)} />
            <Row label="Ahorro" value={pct(r.requerido.ahorro)} strong />
            <Row label="Transformador" value={nf(r.transformador)} />
            <Row label="Ahorro deseado" value={pct(r.ahorroDeseado)} />
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card title="Generación e impacto ambiental">
            <Row label="Generación mensual a consumir" value={nf(r.generacionMensualConsumir)} />
            <Row label="Generación mensual a inyectar" value={nf(r.generacionMensualInyectar)} />
            <Row label="Generación total" value={nf(r.generacionTotal)} />
            <Row label="Turnos de operación" value={nf(r.turnosOperacion)} />
            <Row label="Ahorro en CO₂ (ton/año)" value={nf(r.ahorroCo2, 2)} />
            <Row label="Árboles" value={nf(r.arboles, 2)} />
          </Card>

          <Card title="Cotización">
            <Row label="Costo por vatio (COP)" value={cop(r.costoVatio * inp.trm)} />
            <Row label="Costo de la solución" value={cop(r.costoSolucion)} strong />
            <Row label="Ahorro mensual" value={cop(r.ahorroMensualCop)} />
            <Row label="Ahorro en 30 años" value={cop(r.ahorro30Anios)} />
            <Row label="Retorno" value={`${nf(r.retornoMeses)} meses (${nf(r.retornoAnios)} años)`} />
            <Row label="TIR" value={Number.isFinite(r.tir) ? pct(r.tir) : 'N/D'} strong />
          </Card>
        </div>
      </div>
    </div>
  );
}
