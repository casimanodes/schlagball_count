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
 * Kontrollleiste am unteren Bildschirmrand. Die kompakten Funktionen
 * (Undo, Bearbeiten, Verlauf) erscheinen als reine Icon-Buttons; das
 * Spielende ist als vollwertiger Knopf prominent rechts platziert.
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
        <UndoIcon size={22} />
      </button>

      <button
        type="button"
        className={`icon-btn ${editMode ? 'active' : ''}`}
        onClick={onToggleEdit}
        aria-pressed={editMode}
        aria-label={editMode ? 'Bearbeitung beenden' : 'Punkte bearbeiten'}
        title={editMode ? 'Bearbeitung beenden' : 'Punkte bearbeiten'}
      >
        <EditIcon size={22} />
      </button>

      <button
        type="button"
        className="icon-btn history"
        onClick={onOpenHistory}
        aria-label={`Verlauf öffnen (${historyCount} Aktionen)`}
        title="Verlauf"
      >
        <HistoryIcon size={22} />
        {historyCount > 0 && (
          <span className="icon-badge">{historyCount}</span>
        )}
      </button>

      <button
        type="button"
        className="control-btn end"
        onClick={onEndGame}
      >
        <StopIcon size={18} />
        <span>Spiel beenden</span>
      </button>
    </footer>
  );
}
