import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
  User,
  Briefcase,
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
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login');

  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRol, setRegRol] = useState('Ingeniero de Proyectos');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Procesar Inicio de Sesión estricto contra PostgreSQL (POST /api/auth/login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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

  // Procesar Registro de Nuevo Usuario en PostgreSQL (POST /api/auth/register)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    const regEmailError = validateEmail(regEmail);
    if (regEmailError) {
      setError(regEmailError);
      return;
    }

    if (regPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre.trim(),
          email: regEmail.trim(),
          rol: regRol,
          password: regPassword,
        }),
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
        throw new Error(data.message || 'No se pudo registrar el usuario en PostgreSQL.');
      }

      // Pasar a la vista de Login con el correo recién creado
      setEmail(regEmail.trim());
      setPassword('');
      setRegNombre('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setViewMode('login');
      setSuccessMsg(
        `¡Usuario "${data.user?.email || regEmail}" guardado en la tabla usuarios de PostgreSQL! Ahora inicia sesión.`
      );
    } catch (err: any) {
      if (err?.message?.includes('Failed to fetch')) {
        setError('No se pudo conectar al Backend (puerto 4000). Ejecuta "npm run dev:backend".');
      } else {
        setError(err?.message || 'Error al registrar usuario.');
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
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ingeniería Fotovoltaica · Fórmulas Oficiales Cotizador2 & Radiación Departamental
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-white leading-[1.12]"
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

          {/* Columna Derecha: Tarjeta de Login / Registro PostgreSQL */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-7 sm:p-8 shadow-2xl space-y-6">
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
                {viewMode === 'login' ? 'Iniciar Sesión' : 'Registro de Usuario'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {viewMode === 'login'
                  ? 'Ingresa con tu cuenta registrada en PostgreSQL'
                  : 'Crea tu cuenta y guárdala en la tabla usuarios de PostgreSQL'}
              </p>
            </div>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Alerta de Éxito al Registrarse */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {viewMode === 'login' ? (
            /* ==================== VISTA 1: FORMULARIO DE LOGIN ==================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
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
                <span className="text-[11px] text-slate-400">Base de datos: PostgreSQL (`usuarios`)</span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Token JWT
                </span>
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

              {/* Botón Registrarse que salta a la vista de Registro */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <p className="text-center text-xs text-slate-400">
                  ¿No tienes un usuario registrado en la base de datos?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMsg('');
                    setViewMode('register');
                  }}
                  className="w-full py-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </button>
              </div>
            </form>
          ) : (
            /* ==================== VISTA 2: FORMULARIO DE REGISTRO ==================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Nombre Completo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="correo@dominio.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Cargo / Rol */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Rol en la Plataforma
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={regRol}
                    onChange={(e) => setRegRol(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  >
                    <option value="Ingeniero de Proyectos">Ingeniero de Proyectos</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Asesor Comercial Solar">Asesor Comercial Solar</option>
                  </select>
                </div>
              </div>

              {/* Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mín. 4 caracteres"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-8 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Confirmar
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repite la clave"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Guardar Usuario y Registrarse</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setViewMode('login');
                  }}
                  className="w-full py-2.5 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Login</span>
                </button>
              </div>
            </form>
          )}
            </div>

            <p className="text-center text-[11px] text-slate-600 mt-5">
              © {new Date().getFullYear()} TICLINE EVOLUCIÓN · Autenticación PostgreSQL + JWT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
