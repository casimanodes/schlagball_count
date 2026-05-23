import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { TimerState } from '../types';
import { formatClock } from '../types';

interface TimerBarProps {
  timer: TimerState;
  dispatch: Dispatch<GameAction>;
  /** Ob die Spielzeit bereits abgelaufen ist (Spiel läuft trotzdem weiter,
   *  bis es manuell beendet wird). */
  expired: boolean;
}

/**
 * Timer-Leiste unter dem Scoreboard. Der Schiedsrichter startet, pausiert
 * oder setzt den Timer zurück. Läuft der Timer ab, wird das Spiel NICHT
 * automatisch beendet – die Anzeige wechselt nur auf "Abgelaufen" und der
 * Schiedsrichter kann das Spiel manuell beenden oder Punkte bearbeiten.
 * Ein Reset stellt den Timer auf die ursprüngliche Dauer zurück.
 */
export default function TimerBar({ timer, dispatch, expired }: TimerBarProps) {
  const { remainingSec, running } = timer;
  const low = running && remainingSec <= 30;
  const stateClass = expired
    ? 'expired'
    : low
    ? 'low'
    : running
    ? 'running'
    : 'paused';

  return (
    <div className={`timer-bar ${stateClass}`}>
      <div className="timer-clock">
        <span className="timer-label">SPIELZEIT</span>
        <span className="timer-display">
          {expired ? 'Abgelaufen' : formatClock(remainingSec)}
        </span>
      </div>
      <div className="timer-controls">
        <button
          className="timer-btn primary"
          onClick={() =>
            dispatch(running ? { type: 'TIMER_PAUSE' } : { type: 'TIMER_START' })
          }
          disabled={remainingSec <= 0}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          className="timer-btn"
          onClick={() => dispatch({ type: 'TIMER_RESET' })}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
