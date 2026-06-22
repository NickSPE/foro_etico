import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Generate real-time avatar based on username
  const currentAvatarUrl = username.trim() 
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`
    : `https://api.dicebear.com/7.x/bottts/svg?seed=placeholder`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const result = await register(username, email, password, currentAvatarUrl);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-brand-border rounded-md shadow-md max-w-md w-full p-6 sm:p-8 flex flex-col items-center">
        
        {/* Title Logo */}
        <div className="text-brand-orange mb-3">
          <Shield className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark mb-1">
          Crear Cuenta
        </h1>
        <p className="text-xs text-brand-lightText mb-5 text-center">
          Regístrate hoy para participar en los debates éticos de la comunidad digital.
        </p>

        {/* Live Avatar Preview Widget */}
        <div className="flex flex-col items-center gap-1.5 mb-5 bg-slate-50 border border-brand-border rounded-md p-3 w-full">
          <span className="text-[10px] font-bold text-brand-lightText uppercase">Tu Avatar Digital</span>
          <img 
            src={currentAvatarUrl} 
            alt="Avatar generado" 
            className="w-14 h-14 rounded-full border border-brand-border bg-white"
          />
          <span className="text-[9px] text-brand-lightText">¡Generado automáticamente según tu nombre!</span>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-3 rounded-md mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-lightText uppercase">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
              placeholder="Ej: socratesDigital"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              maxLength={20}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-lightText uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-lightText uppercase">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-brand-lightText uppercase">Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-brand-blue hover:bg-opacity-90 text-white font-bold text-sm py-2.5 rounded-full transition-all shadow-md mt-2 disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Footer Info */}
        <div className="text-xs text-brand-lightText mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-blue font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
