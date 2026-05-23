import { POINT_TYPE_BY_ID } from '../types';
import type { GameEvent, TeamId, TeamState } from '../types';
import { BatIcon, PointIcon } from './icons';

interface ScoreHistoryProps {
  history: GameEvent[];
  teams: Record<TeamId, TeamState>;
}

/**
 * Verlaufsliste aller Ereignisse (neueste zuerst):
 *   - erfasste Punkte mit Spielerzuordnung und passendem Icon
 *   - Schläge ("Geschlagen") mit Baseballschläger-Icon
 *   - nachträgliche Bearbeitungen (+1 / -1 mit Hinweis "Korrektur")
 * Ereignisse, die einen Rollenwechsel ausgelöst haben, sind markiert.
 *
 * Diese Komponente rendert NUR die Liste (ohne Toggle), weil der Verlauf
 * über einen eigenen Drawer-Knopf in den Controls geöffnet wird.
 */
export default function ScoreHistory({ history, teams }: ScoreHistoryProps) {
  const events = [...history].reverse();

  if (events.length === 0) {
    return (
      <ul className="history-list">
        <li className="history-empty">Noch keine Aktion erfasst.</li>
      </ul>
    );
  }

  return (
    <ul className="history-list">
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
