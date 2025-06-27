'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export function LoginForm() {
  // **** Estado local del componente  ****
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);

  // **** Lógica de login ****
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      // Guardar el token y el usuario en el store y localStorage
      if (data.access_token && data.user) {
        useAuthStore.getState().login(data.access_token, data.user);
      } else {
        // Fallback: solo guardar el token si no viene el usuario
        localStorage.setItem('token', data.access_token);
      }
      // Redirigir al home
      router.push('/home');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // **** Lógica de registro ****
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name: email.split('@')[0] }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Después del registro exitoso, hace login automáticamente
      await handleLogin(e);
    } catch (error) {
      setError('Registration failed. User might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ------------ FONDO CON GRADIENTE ------------
    <div className="bg-gradient-to-r from-[#261750] to-[#5d4988] min-h-screen flex items-center justify-center font-sans text-white px-4">

    {/* ------------ LOGIN CONTAINER ------------ */}
    <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden">

    {/* ------------ PANEL IZQUIERDO DEL LOGIN ------------ */}
    <div className="p-8 md:w-1/2 flex flex-col justify-center items-center relative bg-purple-900 bg-opacity-50">
      <div className="text-center mb-4 z-10"></div>
      {/* ------------ LOGO // PARTE IZQUIERDA ------------ */}
      <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-transparent flex items-center justify-center transition-transform duration-300 hover:scale-110">
        <img 
          src="/Jrafa.png" 
          alt="Logo" 
          className="w-40 h-40 md:w-56 md:h-56 object-contain rounded-full" 
        />
      </div>
    </div>

    {/* ------------ LADO DERECHO DEL LOGIN // FORMULARIO ------------ */}
    <div className="p-8 md:w-1/2 flex flex-col justify-center space-y-4">
      <h2 className="text-2xl font-semibold mb-4">{showRegister ? 'Crear cuenta nueva' : 'Iniciar sesión en tu cuenta'}</h2>
      <form className="space-y-4" onSubmit={showRegister ? handleRegister : handleLogin}>
        {/* ------------ USUARIO ------------ */}
        <div>
          <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-300">Usuario</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu usuario"
          />
        </div>
        {/* ------------ CONTRASEÑA ------------ */}
        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-300">Contraseña</label>
          <input
            type="password"
            id="password"
            className="w-full p-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ingresa tu contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {/* ------------ ENLACE OLVIDAR CONTRASEÑA ------------ */}
        {!showRegister && (
          <div className="text-sm text-purple-200">
            <a href="#" className="hover:underline">¿Olvidaste la contraseña?</a>
          </div>
        )}
        {/* ------------ BOTON LOGIN/REGISTER ------------ */}
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
          type="submit"
          disabled={loading}
        >
          {showRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </button>
        {/* ------------ CAMBIO ENTRE LOGIN Y REGISTER ------------ */}
        <div className="text-center text-sm mt-2">
          {showRegister ? (
            <span className="text-white">¿Ya tienes cuenta?{' '}
              <button type="button" className="font-medium hover:underline" onClick={() => setShowRegister(false)}>
                Iniciar sesión
              </button>
            </span>
          ) : (
            <span className="text-white">¿No tienes cuenta?{' '}
              <button type="button" className="font-medium hover:underline" onClick={() => setShowRegister(true)}>
                Crear cuenta
              </button>
            </span>
          )}
        </div>
      </form>
    </div>
    </div>
  </div>
);
}

