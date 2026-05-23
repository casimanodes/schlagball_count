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
}

/**
 * Panel einer Mannschaft. Banner mit der TEAM-FARBE (konstant) und einem
 * separaten Role-Badge (SVG + Wort), das je nach Spielphase wechselt.
 * Die aktuelle Punktewert-Anzeige steckt in den Spielerkarten selbst –
 * die ausklappbare Team-Punktarten-Liste wurde in eine gemeinsame
 * Komponente ausgelagert, die über dem Verlauf erscheint.
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
  const cfg = TEAM_COLOR_BY_ID[team.color];

  return (
    <section className="panel">
      <div
        className="panel-banner"
        style={{ background: cfg.bg, color: cfg.fg }}
      >
        <span className="panel-team-name">{team.name}</span>
        <span className={`role-badge ${isAttack ? 'attack' : 'defense'}`}>
          {isAttack ? <AttackIcon size={14} /> : <DefenseIcon size={14} />}
          <span>{isAttack ? 'ANGRIFF' : 'VERTEIDIGUNG'}</span>
        </span>
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
      </div>
    </section>
  );
}
