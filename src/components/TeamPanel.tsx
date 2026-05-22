import { useState } from 'react';
import { ALL_POINT_TYPES, teamPointTotals } from '../types';
import type { PointTypeId, Role, TeamState } from '../types';
import PlayerCard from './PlayerCard';

interface TeamPanelProps {
  team: TeamState;
  role: Role;
  /** Spieler, der zuletzt geschlagen hat (darf einen Weitschlag erzielen). */
  lastHitterId: string | null;
  /** Ob die Verteidigung gerade eine Fangpunkt-Chance hat. */
  fangAvailable: boolean;
  onHit: (playerId: string) => void;
  onScore: (playerId: string, pointType: PointTypeId) => void;
}

/**
 * Panel einer Mannschaft. Zeigt für jeden Spieler eine Karte mit
 * zweigeteiltem Punkt-Button. Welche Hälften aktiv bzw. gesperrt sind, hängt
 * an der Rolle und am Schlag-Status (siehe PlayerCard).
 */
export default function TeamPanel({
  team,
  role,
  lastHitterId,
  fangAvailable,
  onHit,
  onScore,
}: TeamPanelProps) {
  const isAttack = role === 'attack';
  const [showBreakdown, setShowBreakdown] = useState(false);
  const totals = teamPointTotals(team);

  return (
    <section className={`panel ${role}`}>
      <div className="panel-banner">
        <span className="panel-team-name">{team.name}</span>
        <span className="role-badge">{isAttack ? 'ANGRIFF' : 'VERTEIDIGUNG'}</span>
      </div>

      <div className="panel-body">
        {team.players.length === 0 ? (
          <p className="panel-empty">Keine Spieler hinterlegt.</p>
        ) : (
          <div className="player-list">
            {team.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                role={role}
                lastHitterId={lastHitterId}
                fangAvailable={fangAvailable}
                onHit={() => onHit(player.id)}
                onScore={(pointType) => onScore(player.id, pointType)}
              />
            ))}
          </div>
        )}

        <button
          className="breakdown-toggle"
          onClick={() => setShowBreakdown((open) => !open)}
          aria-expanded={showBreakdown}
        >
          <span>Team-Punktarten {showBreakdown ? 'ausblenden' : 'anzeigen'}</span>
          <span
            className={`chevron ${showBreakdown ? 'open' : ''}`}
            aria-hidden="true"
          >
            &#9662;
          </span>
        </button>

        {showBreakdown && (
          <div className="breakdown">
            {ALL_POINT_TYPES.map((pt) => (
              <div key={pt.id} className={`breakdown-item ${pt.role}`}>
                <span className="breakdown-label">{pt.label}</span>
                <span className="breakdown-value">{totals[pt.id]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
