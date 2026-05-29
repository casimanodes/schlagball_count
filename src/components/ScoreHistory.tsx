import { formatClock, POINT_TYPE_BY_ID } from '../types';
import type {
  GameEvent,
  TeamId,
  TeamState,
  TimerLogEntry,
} from '../types';
import { BatIcon, PauseIcon, PlayIcon, PointIcon } from './icons';

interface ScoreHistoryProps {
  history: GameEvent[];
  timerLog: TimerLogEntry[];
  teams: Record<TeamId, TeamState>;
}

type Row =
  | { kind: 'event'; timestamp: number; data: GameEvent }
  | { kind: 'timer'; timestamp: number; data: TimerLogEntry };

/**
 * Vollständige Verlaufsliste (neueste zuerst). Vereint die Punkt-/Schlag-/
 * Korrektur-Ereignisse mit dem Timer-Protokoll (Start, Pause, Ablauf), so
 * dass der Schiedsrichter chronologisch nachvollziehen kann, wann was
 * passiert ist – inklusive Spielzeit, die zum Pausenzeitpunkt verblieb.
 */
export default function ScoreHistory({
  history,
  timerLog,
  teams,
}: ScoreHistoryProps) {
  const rows: Row[] = [
    ...history.map(
      (ev): Row => ({ kind: 'event', timestamp: ev.timestamp, data: ev }),
    ),
    ...timerLog.map(
      (te): Row => ({ kind: 'timer', timestamp: te.timestamp, data: te }),
    ),
  ].sort((a, b) => b.timestamp - a.timestamp);

  if (rows.length === 0) {
    return (
      <ul className="history-list">
        <li className="history-empty">Noch keine Aktion erfasst.</li>
      </ul>
    );
  }

  return (
    <ul className="history-list">
      {rows.map((row) => {
        const time = new Date(row.timestamp).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        if (row.kind === 'timer') {
          const te = row.data;
          const label =
            te.kind === 'start'
              ? 'Timer gestartet'
              : te.kind === 'pause'
              ? 'Timer pausiert'
              : 'Zeit abgelaufen';
          const Icon =
            te.kind === 'start' || te.kind === 'expired' ? PlayIcon : PauseIcon;
          return (
            <li key={te.id} className={`history-item timer ${te.kind}`}>
              <span className="hi-time">{time}</span>
              <span className="hi-main">
                <span className="hi-player">
                  <Icon size={12} /> {label}
                </span>
                <span className="hi-team">
                  Restzeit {formatClock(te.remainingSec)}
                </span>
              </span>
            </li>
          );
        }

        const ev = row.data;
        const team = teams[ev.teamId];
        const delta = typeof ev.delta === 'number' ? ev.delta : 0;
        const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;

        // Sonderfall: Team-Korrektur (keinem Spieler zugeordnet).
        if (ev.kind === 'team-edit') {
          return (
            <li key={ev.id} className="history-item edit team">
              <span className="hi-time">{time}</span>
              <span className="hi-main">
                <span className="hi-player">Team-Punkte</span>
                <span className="hi-team">{team.name}</span>
              </span>
              <span className="hi-edit">
                <span className="hi-edit-tag">Korrektur</span>
                <span className="hi-edit-detail">Team {deltaLabel}</span>
              </span>
            </li>
          );
        }

        const player = team.players.find((p) => p.id === ev.playerId);
        const playerLabel = player
          ? `#${player.number} ${player.name}`
          : 'Unbekannter Spieler';
        const pt = ev.pointType ? POINT_TYPE_BY_ID[ev.pointType] : null;
        const isEdit = ev.kind === 'edit';
        const rowClass = isEdit
          ? `history-item edit ${pt ? pt.role : ''}`
          : `history-item ${pt ? pt.role : 'hit'}`;
        return (
          <li key={ev.id} className={rowClass}>
            <span className="hi-time">{time}</span>
            <span className="hi-main">
              <span className="hi-player">{playerLabel}</span>
              <span className="hi-team">{team.name}</span>
            </span>
            {isEdit && pt ? (
              <span className="hi-edit">
                <span className="hi-edit-tag">Korrektur</span>
                <span className="hi-edit-detail">
                  <PointIcon id={pt.id} size={12} /> {pt.short} {deltaLabel}
                </span>
              </span>
            ) : pt ? (
              <span className="hi-point">
                <PointIcon id={pt.id} size={12} /> {pt.label}
              </span>
            ) : (
              <span className="hi-action">
                <BatIcon size={12} /> Geschlagen
              </span>
            )}
            {ev.causedRoleSwitch && (
              <span className="hi-switch">Wechsel</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
