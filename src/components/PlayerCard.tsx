import { playerTotal } from '../types';
import type { Player, PointTypeId, Role } from '../types';

interface PlayerCardProps {
  player: Player;
  role: Role;
  /** Spieler, der zuletzt geschlagen hat (nur er darf einen Weitschlag). */
  lastHitterId: string | null;
  /** Ob die Verteidigung gerade eine Fangpunkt-Chance hat. */
  fangAvailable: boolean;
  /** Ob ein Abwurfpunkt aktuell erlaubt ist (ab dem ersten Schlag im Spiel). */
  abwurfAvailable: boolean;
  /** Ob dieser Spieler laut Reihenfolge als Nächster schlagen sollte. */
  isNextBatter: boolean;
  onHit: () => void;
  onScore: (pointType: PointTypeId) => void;
}

/**
 * Karte eines Spielers mit zweigeteiltem Button. Welche Hälften aktiv sind,
 * folgt der Schlagball-Logik:
 *
 *   ANGRIFF:
 *     - linke Hälfte  "Geschlagen" – Schlag eintragen; danach "Weitschlag"
 *       (nur für den zuletzt schlagenden Spieler aktiv)
 *     - rechte Hälfte "Laufpunkt"  – erst aktiv, wenn der Spieler geschlagen hat
 *
 *   VERTEIDIGUNG:
 *     - linke Hälfte  "Fangpunkt"   – nur aktiv, wenn eine Fang-Chance offen ist
 *     - rechte Hälfte "Abwurfpunkt" – ab dem ersten Schlag im Spiel; löst den
 *       Rollenwechsel aus
 *
 * Im Angriff markiert ein Icon den Spieler, der als Nächster schlagen sollte
 * (feste Reihenfolge). Schlagen bleibt für alle Spieler möglich.
 */
export default function PlayerCard({
  player,
  role,
  lastHitterId,
  fangAvailable,
  abwurfAvailable,
  isNextBatter,
  onHit,
  onScore,
}: PlayerCardProps) {
  const isAttack = role === 'attack';

  return (
    <div className={`player-card ${role} ${isNextBatter ? 'next-batter' : ''}`}>
      <div className="player-card-head">
        <span className="player-number">{player.number || '–'}</span>
        <span className="player-name">{player.name}</span>
        {isNextBatter && (
          <span className="next-badge" aria-label="Nächster Schläger">
            &#9656; dran
          </span>
        )}
        <span className="player-total">{playerTotal(player)}</span>
      </div>

      <div className="player-halves">
        {isAttack ? (
          <>
            {/* Linke Hälfte: erst "Geschlagen", danach "Weitschlag" */}
            {!player.hasHit ? (
              <button className="player-half hit-action" onClick={onHit}>
                <span className="half-label">Geschlagen</span>
                <span className="half-sub">Schlag eintragen</span>
              </button>
            ) : (
              <button
                className="player-half weitschlagpunkt"
                disabled={lastHitterId !== player.id}
                onClick={() => onScore('weitschlagpunkt')}
              >
                <span className="half-label">Weitschlag</span>
                <span className="half-count">
                  {player.points.weitschlagpunkt}
                </span>
              </button>
            )}

            {/* Rechte Hälfte: Laufpunkt – erst möglich, wenn geschlagen wurde */}
            <button
              className="player-half laufpunkt"
              disabled={!player.hasHit}
              onClick={() => onScore('laufpunkt')}
            >
              <span className="half-label">Laufpunkt</span>
              <span className="half-count">{player.points.laufpunkt}</span>
            </button>
          </>
        ) : (
          <>
            {/* Fangpunkt – nur möglich, wenn der Gegner geschlagen hat */}
            <button
              className="player-half fangpunkt"
              disabled={!fangAvailable}
              onClick={() => onScore('fangpunkt')}
            >
              <span className="half-label">Fangpunkt</span>
              <span className="half-count">{player.points.fangpunkt}</span>
            </button>

            {/* Abwurfpunkt – ab dem ersten Schlag; löst Rollenwechsel aus */}
            <button
              className="player-half abwurfpunkt"
              disabled={!abwurfAvailable}
              onClick={() => onScore('abwurfpunkt')}
            >
              <span className="half-label">
                Abwurfpunkt
                <span className="half-switch" aria-hidden="true">
                  &#8635;
                </span>
              </span>
              <span className="half-count">{player.points.abwurfpunkt}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
