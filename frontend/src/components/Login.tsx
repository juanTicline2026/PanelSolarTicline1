import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Zap,
  TrendingDown,
  Sun,
} from 'lucide-react';

export interface AuthUser {
  id?: string;
  email: string;
  nombre: string;
  rol: string;
  permisos?: string[];
}

interface LoginProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

/** El correo debe tener "@" y terminar en ".com" (ej: usuario@gmail.com) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.com$/i;

function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'El correo electrónico es obligatorio.';
  if (!value.includes('@')) return 'El correo electrónico debe contener "@".';
  if (!value.toLowerCase().endsWith('.com')) return 'El correo electrónico debe terminar en ".com".';
  if (!EMAIL_REGEX.test(value)) return 'Formato de correo inválido. Ejemplo: usuario@dominio.com';
  return null;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Procesar Inicio de Sesión estricto contra PostgreSQL (POST /api/auth/login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const loginEmailError = validateEmail(email);
    if (loginEmailError) {
      setError(loginEmailError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(
          'El servidor Backend no está respondiendo. Asegúrate de tener corriendo "npm run dev:backend".'
        );
      }

      if (!res.ok) {
        throw new Error(
          data.message || 'Acceso denegado: tus credenciales no existen en la base de datos PostgreSQL.'
        );
      }

      if (!data.token) {
        throw new Error('No se encontró un token JWT válido en la base de datos para este usuario.');
      }

      // Consultar las credenciales del token en PostgreSQL mediante GET /api/auth/me
      let verifiedUser: AuthUser = data.user;
      try {
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData?.user) {
            verifiedUser = {
              id: meData.user.userId || data.user?.id,
              email: meData.user.email || data.user?.email,
              nombre: meData.user.nombre || data.user?.nombre,
              rol: meData.user.rol || data.user?.rol,
              permisos: Array.isArray(meData.user.permisos)
                ? meData.user.permisos
                : Array.isArray(data.user?.permisos)
                  ? data.user.permisos
                  : undefined,
            };
          }
        }
      } catch {
        // Usar credenciales devueltas por /api/auth/login
      }

      onLoginSuccess(data.token, verifiedUser);
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('No se pudo conectar al Backend (puerto 4000). Ejecuta "npm run dev:backend".');
      } else {
        setError(err?.message || 'Error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Luces ambientales */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Columna Izquierda: Presentación Calculadora de Energía Solar + Imagen */}
          <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col gap-5 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ingeniería Fotovoltaica
            </div>

            <h1
              className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Calculadora de Energía Solar{' '}
              <span className="block mt-1 sm:mt-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
                Un Futuro Renovable
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Dimensiona tu sistema fotovoltaico en <strong className="text-white">kWp</strong>, estima el número de paneles, tu ahorro mensual y el retorno de inversión con las fórmulas exactas del modelo de ingeniería y tarifas residencial/comercial.
            </p>

            {/* Métricas de Valor */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 py-3 border-y border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black text-emerald-400 font-display tabular-nums">
                  Hasta 95%
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">Ahorro en Factura</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black text-amber-400 font-display tabular-nums">
                  2.8 - 4.5
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">Años Retorno (ROI)</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black text-blue-400 font-display tabular-nums">
                  25 Años
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400">Garantía de Potencia</span>
              </div>
            </div>

            {/* Imagen Hero Solar integrada al diseño oscuro de la BD */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-950/30 group">
              <img
                src="/src/assets/images/solar_rooftop_hero_1791465806784.jpg"
                alt="Instalación de paneles solares fotovoltaicos sobre techo residencial moderno al atardecer"
                referrerPolicy="no-referrer"
                className="w-full h-56 sm:h-64 lg:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 p-3.5 rounded-xl backdrop-blur-md bg-slate-900/85 border border-slate-700/60 text-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Generación Limpia Estimada</p>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      Autoconsumo & Balance Neto
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ACTIVO
                  </span>
                  <span className="text-[11px] text-slate-400">25 Años Vida Útil</span>
                </div>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Paneles Tier 1 Bloomberg
              </span>
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-blue-400" /> Datos Satelitales NASA POWER (GHI / HSP)
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> Inversores Eficiencia 98.6%
              </span>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Login PostgreSQL */}
          <div className="lg:col-span-5 order-1 lg:order-2 w-full max-w-md mx-auto lg:max-w-none">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-5 sm:p-8 shadow-2xl space-y-6">
              {/* Logo y Encabezado */}
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <img
                    src="/ticline-logo.png"
                    alt="TICLINE"
                    className="h-10 w-auto object-contain brightness-0 invert opacity-95"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black font-display text-white tracking-tight">
                    Iniciar Sesión
                  </h2>

                </div>
              </div>

              {/* Alerta de Error */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ==================== FORMULARIO DE LOGIN ==================== */}
              <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="solar_login_email"
                      autoComplete="off"
                      readOnly
                      onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@dominio.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="solar_login_password"
                      autoComplete="new-password"
                      readOnly
                      onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando en PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar a la Plataforma</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
