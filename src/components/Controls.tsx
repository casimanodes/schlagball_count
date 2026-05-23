interface ControlsProps {
  canUndo: boolean;
  editMode: boolean;
  onUndo: () => void;
  onToggleEdit: () => void;
  onEndGame: () => void;
}

/**
 * Kontrollleiste am unteren Bildschirmrand:
 *   - Undo: letzte Aktion rückgängig (inkl. eventuellem Rollenwechsel
 *           oder einer manuellen Bearbeitung)
 *   - Bearbeiten: schaltet den Punkte-Korrektur-Modus an/aus
 *   - Spiel beenden: speichert das Spiel und öffnet die Übersicht
 */
export default function Controls({
  canUndo,
  editMode,
  onUndo,
  onToggleEdit,
  onEndGame,
}: ControlsProps) {
  return (
    <footer className="controls">
      <button
        className="control-btn undo"
        onClick={onUndo}
        disabled={!canUndo}
      >
        <span className="control-icon" aria-hidden="true">&#8630;</span>
        Undo
      </button>
      <button
        className={`control-btn edit ${editMode ? 'active' : ''}`}
        onClick={onToggleEdit}
        aria-pressed={editMode}
      >
        <span className="control-icon" aria-hidden="true">&#9998;</span>
        {editMode ? 'Fertig' : 'Bearbeiten'}
      </button>
      <button className="control-btn end" onClick={onEndGame}>
        <span className="control-icon" aria-hidden="true">&#9209;</span>
        Spiel beenden
      </button>
    </footer>
  );
}
