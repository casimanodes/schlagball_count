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
  /** Ob ein Abwurfpunkt aktuell erlaubt ist (ab dem ersten Schlag im Spiel). */
  abwurfAvailable: boolean;
  /** Index des Spielers, der laut Reihenfolge als Nächster schlagen sollte. */
  nextBatterIndex: number;
  /** Bearbeitungs-Modus für alle Spielerkarten dieses Panels. */
  editMode: boolean;
  onHit: (playerId: string) => void;
  onScore: (playerId: string, pointType: PointTypeId) => void;
  onAdjust: (playerId: string, pointType: PointTypeId, delta: number) => void;
}

/**
 * Panel einer Mannschaft. Zeigt für jeden Spieler eine Karte mit
 * zweigeteiltem Punkt-Button. Im Angriff markiert ein Icon den Spieler, der
 * laut fester Schlagreihenfolge als Nächster dran ist.
 */
export default function TeamPanel({
  team,
  role,
  lastHitterId,
  fangAvailable,
  abwurfAvailable,
  nextBatterIndex,
  editMode,
  onHit,
  onScore,
  onAdjust,
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
            {team.players.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                role={role}
                lastHitterId={lastHitterId}
                fangAvailable={fangAvailable}
                abwurfAvailable={abwurfAvailable}
                isNextBatter={isAttack && index === nextBatterIndex}
                editMode={editMode}
                onHit={() => onHit(player.id)}
                onScore={(pointType) => onScore(player.id, pointType)}
                onAdjust={(pointType, delta) =>
                  onAdjust(player.id, pointType, delta)
                }
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
