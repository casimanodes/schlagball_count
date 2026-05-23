import type { Dispatch } from 'react';
import { formatClock, teamTotal, TEAM_COLOR_BY_ID } from '../types';
import type { Game } from '../types';
import type { GameAction } from '../gameReducer';
import { PauseIcon, PlayIcon } from './icons';

interface ScoreboardProps {
  game: Game;
  dispatch: Dispatch<GameAction>;
  /** True, sobald die Spielzeit komplett abgelaufen ist. */
  expired: boolean;
}

/**
 * Kopfbereich mit der Spielinfo: zentral die Spielzeit (klickbar – startet
 * bzw. pausiert den Timer), links und rechts die beiden Teams mit Name,
 * Gesamtpunkten und Team-Farbe als Identitätsmerkmal. Die Rolle (Angriff
 * oder Verteidigung) wird ausschließlich über das TeamPanel unten signalisiert
 * – die Team-Farbe bleibt also im Spielverlauf konstant.
 */
export default function Scoreboard({ game, dispatch, expired }: ScoreboardProps) {
  const cfgA = TEAM_COLOR_BY_ID[game.teams.A.color];
  const cfgB = TEAM_COLOR_BY_ID[game.teams.B.color];
  const t = game.timer;
  const running = t.running;
  const canToggle = !expired && t.remainingSec > 0;
  const low = running && t.remainingSec <= 30;

  function toggleTimer() {
    if (!canToggle) return;
    dispatch(running ? { type: 'TIMER_PAUSE' } : { type: 'TIMER_START' });
  }

  const timerClass = expired
    ? 'expired'
    : low
    ? 'low'
    : running
    ? 'running'
    : 'paused';

  return (
    <header className="scoreboard">
      <div
        className="sb-team"
        style={{ background: cfgA.soft, color: cfgA.strong }}
      >
        <span
          className="sb-color-dot"
          style={{ background: cfgA.bg }}
          aria-hidden="true"
        />
        <span className="sb-name">{game.teams.A.name}</span>
        <span className="sb-score" style={{ color: cfgA.strong }}>
          {teamTotal(game.teams.A)}
        </span>
      </div>

      <button
        type="button"
        className={`sb-timer ${timerClass}`}
        onClick={toggleTimer}
        disabled={!canToggle}
        aria-label={
          expired
            ? 'Spielzeit abgelaufen'
            : running
            ? 'Timer pausieren'
            : 'Timer starten'
        }
      >
        <span className="sb-timer-label">SPIELZEIT</span>
        <span className="sb-timer-display">
          {expired ? '00:00' : formatClock(t.remainingSec)}
        </span>
        <span className="sb-timer-hint">
          {expired ? (
            'Abgelaufen'
          ) : running ? (
            <>
              <PauseIcon size={12} /> Pause
            </>
          ) : (
            <>
              <PlayIcon size={12} /> Start
            </>
          )}
        </span>
      </button>

      <div
        className="sb-team right"
        style={{ background: cfgB.soft, color: cfgB.strong }}
      >
        <span
          className="sb-color-dot"
          style={{ background: cfgB.bg }}
          aria-hidden="true"
        />
        <span className="sb-name">{game.teams.B.name}</span>
        <span className="sb-score" style={{ color: cfgB.strong }}>
          {teamTotal(game.teams.B)}
        </span>
      </div>
    </header>
  );
}
