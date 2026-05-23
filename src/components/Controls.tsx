import { EditIcon, HistoryIcon, StopIcon, UndoIcon } from './icons';

interface ControlsProps {
  canUndo: boolean;
  editMode: boolean;
  historyCount: number;
  onUndo: () => void;
  onToggleEdit: () => void;
  onOpenHistory: () => void;
  onEndGame: () => void;
}

/**
 * Kontrollleiste am unteren Bildschirmrand. Vier gleich breite Icon-Buttons
 * (Undo, Bearbeiten, Verlauf, Spiel beenden) auf einer Zeile – flach
 * gehalten, damit möglichst viel Höhe für die Spielerkarten bleibt.
 */
export default function Controls({
  canUndo,
  editMode,
  historyCount,
  onUndo,
  onToggleEdit,
  onOpenHistory,
  onEndGame,
}: ControlsProps) {
  return (
    <footer className="controls">
      <button
        type="button"
        className="icon-btn"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Letzte Aktion rückgängig"
        title="Undo"
      >
        <UndoIcon size={20} />
      </button>

      <button
        type="button"
        className={`icon-btn ${editMode ? 'active' : ''}`}
        onClick={onToggleEdit}
        aria-pressed={editMode}
        aria-label={editMode ? 'Bearbeitung beenden' : 'Punkte bearbeiten'}
        title={editMode ? 'Bearbeitung beenden' : 'Punkte bearbeiten'}
      >
        <EditIcon size={20} />
      </button>

      <button
        type="button"
        className="icon-btn"
        onClick={onOpenHistory}
        aria-label={`Verlauf öffnen (${historyCount} Einträge)`}
        title="Verlauf"
      >
        <HistoryIcon size={20} />
        {historyCount > 0 && (
          <span className="icon-badge">{historyCount}</span>
        )}
      </button>

      <button
        type="button"
        className="icon-btn end"
        onClick={onEndGame}
        aria-label="Spiel beenden"
        title="Spiel beenden"
      >
        <StopIcon size={18} />
      </button>
    </footer>
  );
}
