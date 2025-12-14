// Form used to add a new game to the library
import { useState } from 'react';

function AddGameForm({
  onAddGame,
  STATUS_LABELS = { backlog: 'À faire', playing: 'En cours', finished: 'Terminé' },
}) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('PS5');
  const [status, setStatus] = useState('backlog');
  const [hoursPlayed, setHoursPlayed] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [error, setError] = useState('');

  // Validate input and submit new game to parent component
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    const payload = {
      title: title.trim(),
      platform,
      status,
      hoursPlayed: Number(hoursPlayed) || 0,
      favorite: Boolean(favorite),
    };

    onAddGame(payload);

    setTitle('');
    setPlatform('PS5');
    setStatus('backlog');
    setHoursPlayed(0);
    setFavorite(false);
    setError('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 mt-2 space-y-3"
    >
      <h2 className="font-semibold text-lg mb-2">Ajouter un jeu</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          placeholder="Nom du jeu"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-slate-300">Plateforme</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          >
            <option value="PS5">PS5</option>
            <option value="PC">PC</option>
            <option value="Switch">Switch</option>
            <option value="Xbox">Xbox</option>
          </select>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm text-slate-300">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          >
            <option value="backlog">{STATUS_LABELS.backlog}</option>
            <option value="playing">{STATUS_LABELS.playing}</option>
            <option value="finished">{STATUS_LABELS.finished}</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm text-slate-300">Heures jouées</label>
          <input
            type="number"
            min="0"
            value={hoursPlayed}
            onChange={(e) => setHoursPlayed(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded"
        >
          Ajouter
        </button>
      </div>
    </form>
  );
}

export default AddGameForm;
