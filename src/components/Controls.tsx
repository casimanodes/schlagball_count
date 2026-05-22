interface ControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  onEndGame: () => void;
}

/**
 * Kontrollleiste am unteren Bildschirmrand:
 *   - Undo: letzte Aktion rückgängig (inkl. eventuellem Rollenwechsel)
 *   - Spiel beenden: speichert das Spiel und öffnet die Übersicht
 */
export default function Controls({ canUndo, onUndo, onEndGame }: ControlsProps) {
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
      <button className="control-btn end" onClick={onEndGame}>
        <span className="control-icon" aria-hidden="true">&#9209;</span>
        Spiel beenden
      </button>
    </footer>
  );
}
