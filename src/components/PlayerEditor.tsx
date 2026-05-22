import { useState } from 'react';

/** Ein Spieler-Eintrag während der Eingabe im Setup. */
export interface DraftPlayer {
  id: string;
  name: string;
}

interface PlayerEditorProps {
  players: DraftPlayer[];
  max: number;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

/**
 * Eingabebereich für die Spieler eines Teams: vorhandene Spieler auflisten,
 * neue per Name hinzufügen (bis zur Maximalanzahl), wieder entfernen.
 * Die Trikotnummer wird automatisch nach der Reihenfolge vergeben (1, 2, 3 …).
 */
export default function PlayerEditor({
  players,
  max,
  onAdd,
  onRemove,
}: PlayerEditorProps) {
  const [name, setName] = useState('');

  const full = players.length >= max;
  const canAdd = name.trim() !== '' && !full;

  function add() {
    if (!canAdd) return;
    onAdd(name);
    setName('');
  }

  return (
    <div className="player-editor">
      <div className="pe-head">
        <span className="field-label">Spieler</span>
        <span className="pe-count">
          {players.length} / {max}
        </span>
      </div>

      {players.length > 0 && (
        <ul className="pe-list">
          {players.map((p, index) => (
            <li key={p.id} className="pe-item">
              <span className="pe-num">{index + 1}</span>
              <span className="pe-name">{p.name}</span>
              <button
                className="pe-remove"
                onClick={() => onRemove(p.id)}
                aria-label={`${p.name} entfernen`}
              >
                &#10005;
              </button>
            </li>
          ))}
        </ul>
      )}

      {full ? (
        <p className="field-hint">Maximale Spieleranzahl erreicht.</p>
      ) : (
        <div className="pe-add">
          <input
            className="text-input pe-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
            }}
            placeholder="Spielername"
            maxLength={24}
          />
          <button className="pe-add-btn" onClick={add} disabled={!canAdd}>
            +
          </button>
        </div>
      )}
    </div>
  );
}
