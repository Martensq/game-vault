import { useState } from "react";

const getStatusClasses = (status) => {
  if (status === "backlog") return "bg-yellow-500/20 text-yellow-300";
  if (status === "playing") return "bg-blue-500/20 text-blue-300";
  if (status === "finished") return "bg-green-500/20 text-green-300";
  return "bg-slate-700 text-slate-300";
};

function GameCard({
  id,
  title,
  platform,
  status,
  hoursPlayed,
  favorite,
  onToggleFavorite,
  onDelete,
  onSave,
  STATUS_LABELS = { backlog: "À faire", playing: "En cours", finished: "Terminé" }
}) {
  const statusClasses = getStatusClasses(status);

  const [editMode, setEditMode] = useState(false);

  const [editTitle, setEditTitle] = useState(title);
  const [editPlatform, setEditPlatform] = useState(platform);
  const [editStatus, setEditStatus] = useState(status);
  const [editHours, setEditHours] = useState(hoursPlayed);
  const [editFavorite, setEditFavorite] = useState(favorite);

  const startEdit = () => {
    setEditTitle(title);
    setEditPlatform(platform);
    setEditStatus(status);
    setEditHours(hoursPlayed);
    setEditFavorite(favorite);
    setEditMode(true);
  };

  const cancelEdit = () => setEditMode(false);

  const saveEdit = () => {
    if (!editTitle.trim()) { alert("Le titre est obligatoire"); return; }
    const updated = { id, title: editTitle.trim(), platform: editPlatform, status: editStatus, hoursPlayed: Number(editHours) || 0, favorite: editFavorite };
    onSave(updated);
    setEditMode(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700 relative">
      {!editMode ? (
        <div>
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <button onClick={onToggleFavorite} className="text-lg leading-none opacity-90 hover:scale-110 transition-transform" aria-label="Toggle favorite" title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
                {favorite ? "⭐" : "☆"}
              </button>
              <span className="truncate">{title}</span>
            </h2>

            <span className="text-xs px-2 py-1 rounded-full bg-slate-700 uppercase tracking-wide">{platform}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <span className={`text-xs px-2 py-1 rounded-full ${statusClasses}`}>{STATUS_LABELS[status] || status}</span>
            <span className="text-xs">{hoursPlayed} h</span>
          </div>

          <div className="flex justify-end pt-5">
            <button onClick={startEdit} className="text-xs text-slate-300 hover:text-white pe-4 py-1 rounded" title="Modifier">Modifier</button>
            <button onClick={onDelete} className="text-xs text-red-300 hover:text-red-400 py-1 rounded" title="Supprimer">Supprimer</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <label className="text-sm text-slate-300">Titre</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm text-slate-300">Plateforme</label>
              <select value={editPlatform} onChange={e => setEditPlatform(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm">
                <option value="PS5">PS5</option>
                <option value="PC">PC</option>
                <option value="Switch">Switch</option>
                <option value="Xbox">Xbox</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm text-slate-300">Statut</label>
              <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm">
                <option value="backlog">{STATUS_LABELS.backlog}</option>
                <option value="playing">{STATUS_LABELS.playing}</option>
                <option value="finished">{STATUS_LABELS.finished}</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm text-slate-300">Heures jouées</label>
              <input type="number" min="0" value={editHours} onChange={e => setEditHours(Number(e.target.value))} className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5">
            <button onClick={cancelEdit} className="text-sm px-3 py-1 rounded border border-slate-700 text-slate-300">Annuler</button>
            <button onClick={saveEdit} className="text-sm px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCard;
