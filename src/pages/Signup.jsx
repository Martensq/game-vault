// Signup page
// Creates a new user account and logs in automatically after success
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client-side validations
    if (!name.trim()) return setError('Le nom est requis.');
    if (!email.trim()) return setError("L'email est requis.");
    if (!password) return setError('Le mot de passe est requis.');
    if (password.length < 6)
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    if (password !== passwordConfirm) return setError('Les mots de passe ne correspondent pas.');

    setLoading(true);
    try {
      // 1) Create user account
      const regRes = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const regJson = await regRes.json();
      if (!regRes.ok) {
        setError(regJson?.error || `Erreur inscription (${regRes.status})`);
        setLoading(false);
        return;
      }

      // 2) Auto-login after successful registration
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginJson = await loginRes.json();
      if (!loginRes.ok) {
        setError(
          loginJson?.error ||
            'Inscription réussie mais connexion automatique impossible. Connecte-toi manuellement.'
        );
        setLoading(false);
        navigate('/login');
        return;
      }

      login(loginJson.token);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setError('Erreur réseau, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0b1020] to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-300 drop-shadow-md">🎮 GameVault</h1>
          <p className="text-sm text-slate-300 mt-1">Crée ton compte et commence ta collection</p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/10 border border-red-800 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Nom</label>
            <input
              type="text"
              className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              placeholder="Ton prénom ou pseudo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

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
              placeholder="Au moins 6 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Confirme le mot de passe</label>
            <input
              type="password"
              className="w-full bg-slate-900/60 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              placeholder="Répète le mot de passe"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
          <button
            onClick={() => navigate('/login')}
            className="underline hover:text-slate-200"
            aria-label="Aller à la page de connexion"
          >
            Déjà un compte ? Se connecter
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

export default Signup;
