import { useEffect } from 'react';
import type {
  GameEvent,
  TeamId,
  TeamState,
  TimerLogEntry,
} from '../types';
import ScoreHistory from './ScoreHistory';
import TeamBreakdown from './TeamBreakdown';
import { CloseIcon } from './icons';

interface HistoryDrawerProps {
  open: boolean;
  history: GameEvent[];
  timerLog: TimerLogEntry[];
  teams: Record<TeamId, TeamState>;
  onClose: () => void;
}

/**
 * Bottom-Sheet mit Team-Punktarten und vollständigem Spielverlauf. Wird
 * über den Verlauf-Knopf in der Kontrollleiste geöffnet und ist immer
 * erreichbar – auch wenn viele Spieler die Hauptansicht füllen.
 *
 * Tippen außerhalb (Backdrop) oder ESC schließt das Sheet; innerhalb wird
 * der Inhalt eigenständig gescrollt.
 */
export default function HistoryDrawer({
  open,
  history,
  timerLog,
  teams,
  onClose,
}: HistoryDrawerProps) {
  const total = history.length + timerLog.length;
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Spielverlauf"
      onClick={onClose}
    >
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" aria-hidden="true" />
        <div className="drawer-head">
          <h2 className="drawer-title">Verlauf &amp; Punktarten</h2>
          <button
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Schließen"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <TeamBreakdown teams={teams} />

          <section className="history-section">
            <h3 className="history-section-title">
              Verlauf ({total})
            </h3>
            <ScoreHistory
              history={history}
              timerLog={timerLog}
              teams={teams}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
