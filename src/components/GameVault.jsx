// src/components/GameVault.jsx
import { useEffect, useState, useCallback } from 'react';
import GameCard from './GameCard';
import AddGameForm from './AddGameForm';
import { useAuth } from '../auth/AuthProvider';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const STATUS_LABELS = {
  backlog: 'À faire',
  playing: 'En cours',
  finished: 'Terminé',
};

/*
  Main GameVault component.
  - Fetches games on mount and whenever filters/pagination/search change.
  - Listens to 'user:login' and 'user:logout' events to refresh after auth changes.
*/
function GameVault() {
  const { token } = useAuth();
  
  const [games, setGames] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { logout } = useAuth();

  // pagination + search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');

  // Build query params (opts overrides state for one-off calls)
  const buildQuery = (opts = {}) => {
    const params = new URLSearchParams();
    const status = opts.status ?? statusFilter;
    const platform = opts.platform ?? platformFilter;
    const pageNum = opts.page ?? page;
    const lim = opts.limit ?? limit;
    const search = opts.q ?? q;

    if (status && status !== 'all') params.append('status', status);
    if (platform && platform !== 'all') params.append('platform', platform);
    if (search) params.append('q', search);
    params.append('page', pageNum);
    params.append('limit', lim);
    return params.toString();
  };

  // get auth headers from localStorage (used for POST/PUT/DELETE)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // fetchGames: memoized to avoid recreate on every render.
  // dependencies are the pieces used by buildQuery by default.
  const fetchGames = async (opts = {}) => {
      setLoading(true);
      setError(null);

      try {
        const qs = buildQuery(opts);
        const res = await fetch(`${API_BASE}/api/games?${qs}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setGames(Array.isArray(json.data) ? json.data : []);
        setTotal(Number(json.meta?.total || 0));
      } catch (err) {
        console.error('Erreur fetch paginated games:', err);
        setError('Impossible de charger les jeux (voir console).');
      } finally {
        setLoading(false);
      }
    }

  // IMPORTANT: call fetchGames on mount and whenever fetchGames changes.
  useEffect(() => {
    fetchGames();
  }, [page, limit, statusFilter, platformFilter, q]);

  // Also listen to login/logout events (in case login was performed by a different UI)
  useEffect(() => {
    const onLogin = () => {
      // After login we want to refresh current page
      fetchGames();
    };
    const onLogout = () => {
      // On logout, we clear list (optional) or refetch as public list
      fetchGames();
    };
    window.addEventListener('user:login', onLogin);
    window.addEventListener('user:logout', onLogout);
    return () => {
      window.removeEventListener('user:login', onLogin);
      window.removeEventListener('user:logout', onLogout);
    };
  }, [fetchGames]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Add or update via API
  const handleSaveGame = async (gameData) => {
    try {
      const existsLocally = games.some((g) => g.id === gameData.id);
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      };

      if (existsLocally) {
        const res = await fetch(`${API_BASE}/api/games/${gameData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(gameData),
        });
        if (!res.ok) throw new Error(`PUT failed ${res.status}`);
        // after updating, refresh current page to keep server order
        await fetchGames();
      } else {
        // when creating, do NOT send an id — backend auto-generates it
        const payload = { ...gameData };
        delete payload.id;
        const res = await fetch(`${API_BASE}/api/games`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error('Unauthorized (no token)');
          throw new Error(`POST failed ${res.status}`);
        }
        // after create, go to page 1 and reload that page
        setPage(1);
        await fetchGames({ page: 1 });
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Erreur saveGame:', err);
      alert("Erreur lors de l'enregistrement. Voir la console pour les détails.");
    }
  };

  const handleDeleteGame = async (id) => {
    const ok = window.confirm('Supprimer ce jeu ?');
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/api/games/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (res.ok || res.status === 204) {
        // After delete, if current page might be empty, adjust page then reload
        const remainingOnPage = games.length - 1;
        if (remainingOnPage <= 0 && page > 1) {
          const prevPage = page - 1;
          setPage(prevPage);
          await fetchGames({ page: prevPage });
        } else {
          await fetchGames();
        }
      } else if (res.status === 401) {
        alert("Non authentifié : connecte-toi d'abord.");
      } else if (res.status === 403) {
        alert("Tu n'es pas autorisé à supprimer ce jeu.");
      } else {
        alert('Impossible de supprimer le jeu (voir console).');
      }
    } catch (err) {
      console.error('Erreur delete:', err);
      alert('Erreur réseau lors de la suppression.');
    }
  };

  // optimistic toggle favorite with rollback on failure
  const handleToggleFavorite = async (id) => {
    const prev = games;
    const next = games.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g));
    setGames(next);

    const target = next.find((g) => g.id === id);
    if (!target) return;

    try {
      const res = await fetch(`${API_BASE}/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(target),
      });
      if (!res.ok) throw new Error(`PUT failed ${res.status}`);
      const updated = await res.json();
      setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    } catch (err) {
      console.error('Erreur toggle favorite:', err);
      alert("Impossible de mettre à jour le favori, restauration de l'état.");
      setGames(prev); // rollback
    }
  };

  const openAddModal = () => setShowAddModal(true);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <button onClick={logout} className="text-sm m-4 bg-red-600 px-3 py-1 rounded">
        Se déconnecter
      </button>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-blue-400 mb-10 text-center">🎮 GameVault</h1>

        {/* Filters + controls */}
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 me-2 text-sm"
            >
              <option value="all">Tous</option>
              <option value="backlog">{STATUS_LABELS.backlog}</option>
              <option value="playing">{STATUS_LABELS.playing}</option>
              <option value="finished">{STATUS_LABELS.finished}</option>
            </select>

            <select
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 me-2 text-sm mb-2 md:mb-0"
            >
              <option value="all">Toutes</option>
              <option value="PS5">PS5</option>
              <option value="PC">PC</option>
              <option value="Switch">Switch</option>
              <option value="Xbox">Xbox</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
            >
              <option value={4}>4 / page</option>
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="search"
              placeholder="Recherche..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
            />

            <button
              onClick={openAddModal}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 pt-1 pb-2 rounded text-sm"
            >
              Ajouter un jeu
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-400">Chargement des jeux...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {games.length === 0 ? (
                <p className="text-slate-400 text-sm col-span-full">
                  Aucun jeu trouvé avec ces filtres.
                </p>
              ) : (
                games.map((game) => (
                  <GameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    platform={game.platform}
                    status={game.status}
                    hoursPlayed={game.hoursPlayed}
                    favorite={game.favorite}
                    onToggleFavorite={() => handleToggleFavorite(game.id)}
                    onDelete={() => handleDeleteGame(game.id)}
                    onSave={(updated) => handleSaveGame(updated)}
                    STATUS_LABELS={STATUS_LABELS}
                  />
                ))
              )}
            </div>

            {/* pagination controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-300">
                Page {page} / {totalPages} — {total} jeux
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-slate-800 rounded disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          </>
        )}

        {showAddModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AddGameForm onAddGame={handleSaveGame} STATUS_LABELS={STATUS_LABELS} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameVault;
