import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export interface AuthUser {
  email: string;
  nombre: string;
  rol: string;
}

interface LoginProps {
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para procesar el inicio de sesión con el Backend (JWT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      let token = '';
      let user: AuthUser;

      try {
        // 1. Intentar autenticar contra el Backend real (/api/auth/login)
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Credenciales inválidas.');
        }

        token = data.token;
        user = data.user;
      } catch (networkErr: any) {
        // Si el error viene de credenciales rechazadas por el backend, mostrarlo
        if (networkErr?.message && !networkErr.message.includes('Failed to fetch') && !networkErr.message.includes('Unexpected token')) {
          throw networkErr;
        }

        // 2. Modo respaldo local (si el servidor backend aún no está encendido)
        await new Promise((resolve) => setTimeout(resolve, 600));
        const demoHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const demoPayload = btoa(
          JSON.stringify({
            sub: 'user_123',
            email,
            nombre: email.split('@')[0].toUpperCase(),
            rol: 'Ingeniero de Proyectos',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
          })
        );
        const demoSignature = btoa('demo_signature_ticline_solar');
        token = `${demoHeader}.${demoPayload}.${demoSignature}`;
        user = {
          email,
          nombre: email.split('@')[0].toUpperCase(),
          rol: 'Ingeniero de Proyectos',
        };
      }

      if (rememberMe) {
        localStorage.setItem('solar_auth_token', token);
        localStorage.setItem('solar_auth_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('solar_auth_token', token);
        sessionStorage.setItem('solar_auth_user', JSON.stringify(user));
      }

      onLoginSuccess(token, user);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('123456');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luces y degradados ambientales de fondo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Tarjeta de Login */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl space-y-6">
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
                Plataforma Solar
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa con tus credenciales autorizadas de ingeniería
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

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Correo Electrónico */}
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
                  placeholder="ejemplo@ticline.co"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Contraseña
                </label>
              </div>
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

            {/* Checkbox Recordar Sesión */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-400"
                />
                <span>Recordar sesión</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Sesión protegida JWT
              </span>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando acceso...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Accesos rápidos de prueba */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <span className="text-[11px] text-slate-500 block">
              Accesos rápidos para pruebas (Contraseña: 123456):
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleUseDemo('admin@ticline.co')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-400 transition-colors cursor-pointer"
              >
                admin@ticline.co
              </button>
              <button
                type="button"
                onClick={() => handleUseDemo('ingenieria@ticline.co')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-teal-400 transition-colors cursor-pointer"
              >
                ingenieria@ticline.co
              </button>
            </div>
          </div>
        </div>

        {/* Footer confidencial */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          © {new Date().getFullYear()} TICLINE EVOLUCIÓN · Acceso seguro exclusivo
        </p>
      </div>
    </div>
  );
};
