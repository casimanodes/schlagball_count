import { useState } from 'react';
import { POINT_TYPE_BY_ID } from '../types';
import type { GameEvent, TeamId, TeamState } from '../types';

interface ScoreHistoryProps {
  history: GameEvent[];
  teams: Record<TeamId, TeamState>;
  /** Liste beim ersten Anzeigen aufgeklappt darstellen. */
  defaultOpen?: boolean;
}

/**
 * Aufklappbare Verlaufsliste aller Ereignisse (neueste zuerst): erfasste
 * Punkte und Schläge ("Geschlagen"), jeweils mit dem zugeordneten Spieler.
 * Ereignisse, die einen Rollenwechsel ausgelöst haben, sind markiert.
 */
export default function ScoreHistory({
  history,
  teams,
  defaultOpen = false,
}: ScoreHistoryProps) {
  const [open, setOpen] = useState(defaultOpen);
  const events = [...history].reverse();

  return (
    <section className="history">
      <button
        className="history-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Verlauf ({history.length})</span>
        <span className={`chevron ${open ? 'open' : ''}`} aria-hidden="true">
          &#9662;
        </span>
      </button>

      {open && (
        <ul className="history-list">
          {events.length === 0 && (
            <li className="history-empty">Noch keine Aktion erfasst.</li>
          )}
          {events.map((ev) => {
            const team = teams[ev.teamId];
            const player = team.players.find((p) => p.id === ev.playerId);
            const playerLabel = player
              ? `#${player.number} ${player.name}`
              : 'Unbekannter Spieler';
            const time = new Date(ev.timestamp).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const pt = ev.pointType ? POINT_TYPE_BY_ID[ev.pointType] : null;
            return (
              <li
                key={ev.id}
                className={`history-item ${pt ? pt.role : 'hit'}`}
              >
                <span className="hi-time">{time}</span>
                <span className="hi-main">
                  <span className="hi-player">{playerLabel}</span>
                  <span className="hi-team">{team.name}</span>
                </span>
                {pt ? (
                  <span className="hi-point">{pt.label}</span>
                ) : (
                  <span className="hi-action">Geschlagen</span>
                )}
                {ev.causedRoleSwitch && (
                  <span className="hi-switch">Wechsel</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
