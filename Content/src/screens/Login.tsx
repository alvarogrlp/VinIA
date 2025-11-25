/**
 * VinIA - Pantalla de Login
 * 
 * Autenticación de usuarios comerciales.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useAuthStore } from '../store';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Usuario o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50">
      <div className="w-full max-w-md p-8 m-4 bg-white shadow-elegant-lg rounded-2xl">
        {/* Logo y título */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 mb-4">
            <img src="/VinIA_Logo.png" alt="VinIA Logo" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-center text-secondary-900">
            VinIA
          </h1>
          <p className="mt-2 text-sm text-center text-secondary-600">
            Sistema de gestión comercial para distribuidores de vino
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Usuario */}
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-secondary-700">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-5 h-5 text-secondary-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
                required
                autoComplete="username"
                className="input pl-10"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-secondary-700">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-secondary-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input pl-10"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Botón submit */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full btn-primary"
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
