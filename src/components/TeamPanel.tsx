import { TEAM_COLOR_BY_ID } from '../types';
import type { PointTypeId, Role, TeamState } from '../types';
import PlayerCard from './PlayerCard';
import { AttackIcon, DefenseIcon } from './icons';

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
  /** Team-Bonuspunkte (ohne Spielerzuordnung) im Edit-Modus ändern. */
  onAdjustTeam: (delta: number) => void;
}

/**
 * Panel einer Mannschaft. Banner mit der TEAM-FARBE (konstant) und einem
 * separaten Role-Badge (SVG + Wort), das je nach Spielphase wechselt.
 * Bonuspunkte (keinem Spieler zugeordnet) werden im Banner als kleines
 * Badge angezeigt, sobald sie > 0 sind. Im Bearbeitungs-Modus erscheint
 * zusätzlich eine eigene Zeile mit + / − Tasten, um diese frei
 * vergebbaren Team-Punkte zu steuern.
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
  onAdjustTeam,
}: TeamPanelProps) {
  const isAttack = role === 'attack';
  const cfg = TEAM_COLOR_BY_ID[team.color];
  const bonus = team.bonusPoints ?? 0;

  return (
    <section className="panel">
      <div
        className="panel-banner"
        style={{ background: cfg.bg, color: cfg.fg }}
      >
        <span className="panel-team-name">{team.name}</span>
        <div className="panel-banner-right">
          {bonus > 0 && !editMode && (
            <span
              className="bonus-badge"
              title="Freie Team-Punkte (keinem Spieler zugeordnet)"
            >
              +{bonus}
            </span>
          )}
          <span className={`role-badge ${isAttack ? 'attack' : 'defense'}`}>
            {isAttack ? <AttackIcon size={14} /> : <DefenseIcon size={14} />}
            <span>{isAttack ? 'ANGRIFF' : 'VERTEIDIGUNG'}</span>
          </span>
        </div>
      </div>

      <div className="panel-body">
        {editMode && (
          <div className="team-bonus-row">
            <span className="team-bonus-label">Team-Punkte (frei)</span>
            <div className="team-bonus-controls">
              <button
                type="button"
                className="edit-btn minus"
                onClick={() => onAdjustTeam(-1)}
                disabled={bonus === 0}
                aria-label="Team-Punkte minus"
              >
                &#8722;
              </button>
              <span className="edit-count">{bonus}</span>
              <button
                type="button"
                className="edit-btn plus"
                onClick={() => onAdjustTeam(+1)}
                aria-label="Team-Punkte plus"
              >
                +
              </button>
            </div>
          </div>
        )}

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
      </div>
    </section>
  );
}
