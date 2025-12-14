// Login page
// Handles user authentication and token storage

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Veuillez renseigner email et mot de passe.');
      return;
    }

    setLoading(true);

    try {
      // Send credentials to backend authentication endpoint
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Échec de la connexion');
        setLoading(false);
        return;
      }

      // Save token and update global auth state
      login(json.token);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0b1020] to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-300 drop-shadow-md">🎮 GameVault</h1>
          <p className="text-sm text-slate-300 mt-1">Connecte-toi pour accéder à ta ludothèque</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/10 border border-red-800 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              placeholder="ex: toi@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <button
            onClick={() => navigate('/signup')}
            className="underline hover:text-slate-200"
            aria-label="Créer un compte"
          >
            Créer un compte
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-200"
            aria-label="Retour"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
