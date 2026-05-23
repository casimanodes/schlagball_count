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
 * Aufklappbare Verlaufsliste aller Ereignisse (neueste zuerst):
 *   - erfasste Punkte mit zugeordnetem Spieler
 *   - Schläge ("Geschlagen")
 *   - nachträgliche Bearbeitungen (+1 / -1 mit Hinweis)
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
            const isEdit = ev.kind === 'edit';
            const delta = typeof ev.delta === 'number' ? ev.delta : 0;
            const deltaLabel = delta > 0 ? `+${delta}` : `${delta}`;
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
                      {pt.short} {deltaLabel}
                    </span>
                  </span>
                ) : pt ? (
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
