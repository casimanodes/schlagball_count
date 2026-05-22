import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { TimerState } from '../types';
import { formatClock } from '../types';

interface TimerBarProps {
  timer: TimerState;
  dispatch: Dispatch<GameAction>;
}

/**
 * Timer-Leiste unter dem Scoreboard. Der Schiedsrichter startet, pausiert
 * oder setzt den Timer zurück. Läuft er ab, beendet der Reducer das Spiel.
 */
export default function TimerBar({ timer, dispatch }: TimerBarProps) {
  const { remainingSec, running } = timer;
  const low = running && remainingSec <= 30;
  const stateClass = low ? 'low' : running ? 'running' : 'paused';

  return (
    <div className={`timer-bar ${stateClass}`}>
      <div className="timer-clock">
        <span className="timer-label">SPIELZEIT</span>
        <span className="timer-display">{formatClock(remainingSec)}</span>
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
