import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-brand-border rounded-md shadow-md max-w-md w-full p-6 sm:p-8 flex flex-col items-center">
        
        {/* Title Logo */}
        <div className="text-brand-orange mb-3">
          <Shield className="w-12 h-12 stroke-[2.5]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-brand-dark mb-1">
          Iniciar Sesión
        </h1>
        <p className="text-xs text-brand-lightText mb-6 text-center">
          Ingresa para debatir sobre dilemas morales en la era de la información.
        </p>

        {/* Error panel */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-md mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-lightText uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-lightText uppercase">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-50 border border-brand-border rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-brand-blue focus:bg-white transition-all shadow-inner"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-opacity-90 text-white font-bold text-sm py-2.5 rounded-full transition-all shadow-md mt-2 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-xs text-brand-lightText mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="text-brand-blue font-bold hover:underline">
            Regístrate aquí
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
