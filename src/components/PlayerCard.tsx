import {
  ALL_POINT_TYPES,
  playerTotal,
  POINT_TYPE_BY_ID,
} from '../types';
import type { Player, PointTypeId, Role } from '../types';
import { BatIcon, PointIcon } from './icons';

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
  /** Bearbeitungs-Modus: zeigt +/- pro Punktart statt der normalen Buttons. */
  editMode: boolean;
  onHit: () => void;
  onScore: (pointType: PointTypeId) => void;
  /** Punkt manuell korrigieren (+1 oder -1). */
  onAdjust: (pointType: PointTypeId, delta: number) => void;
}

/**
 * Karte eines Spielers mit zweigeteiltem Button. Welche Hälften aktiv sind,
 * folgt der Schlagball-Logik – die Anzeige auf jedem Knopf zeigt den
 * Punktwert der Aktion (z. B. „+1") statt der bisher erzielten Anzahl,
 * damit klar ist, was ein Tipp eintragen würde.
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
 * Im BEARBEITUNGS-Modus werden statt der normalen Punkt-Buttons für jede
 * Punktart +/- Tasten samt aktuellem Spielerstand angezeigt.
 */
export default function PlayerCard({
  player,
  role,
  lastHitterId,
  fangAvailable,
  abwurfAvailable,
  isNextBatter,
  editMode,
  onHit,
  onScore,
  onAdjust,
}: PlayerCardProps) {
  const isAttack = role === 'attack';
  const laufVal = POINT_TYPE_BY_ID.laufpunkt.value;
  const weitVal = POINT_TYPE_BY_ID.weitschlagpunkt.value;
  const fangVal = POINT_TYPE_BY_ID.fangpunkt.value;
  const abwurfVal = POINT_TYPE_BY_ID.abwurfpunkt.value;

  return (
    <div
      className={`player-card ${role} ${
        isNextBatter && !editMode ? 'next-batter' : ''
      } ${editMode ? 'edit' : ''}`}
    >
      <div className="player-card-head">
        <span className="player-number">{player.number || '–'}</span>
        <span className="player-name">{player.name}</span>
        {isNextBatter && !editMode && (
          <span className="next-badge" aria-label="Nächster Schläger">
            &#9656; dran
          </span>
        )}
        <span className="player-total">{playerTotal(player)}</span>
      </div>

      {editMode ? (
        <div className="player-edit">
          {ALL_POINT_TYPES.map((pt) => (
            <div key={pt.id} className={`edit-row ${pt.role}`}>
              <span className="edit-label">
                <PointIcon id={pt.id} size={16} /> {pt.short}
              </span>
              <div className="edit-controls">
                <button
                  type="button"
                  className="edit-btn minus"
                  onClick={() => onAdjust(pt.id, -1)}
                  disabled={player.points[pt.id] === 0}
                  aria-label={`${pt.label} minus`}
                >
                  &#8722;
                </button>
                <span className="edit-count">{player.points[pt.id]}</span>
                <button
                  type="button"
                  className="edit-btn plus"
                  onClick={() => onAdjust(pt.id, +1)}
                  aria-label={`${pt.label} plus`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="player-halves">
          {isAttack ? (
            <>
              {/* Linke Hälfte: erst "Geschlagen", danach "Weitschlag" */}
              {!player.hasHit ? (
                <button className="player-half hit-action" onClick={onHit}>
                  <BatIcon size={18} />
                  <span className="half-label">Geschlagen</span>
                </button>
              ) : (
                <button
                  className="player-half weitschlagpunkt"
                  disabled={lastHitterId !== player.id}
                  onClick={() => onScore('weitschlagpunkt')}
                >
                  <BatIcon size={18} />
                  <span className="half-label">Weitschlag</span>
                  <span className="half-value">+{weitVal}</span>
                </button>
              )}

              {/* Rechte Hälfte: Laufpunkt – erst möglich, wenn geschlagen wurde */}
              <button
                className="player-half laufpunkt"
                disabled={!player.hasHit}
                onClick={() => onScore('laufpunkt')}
              >
                <PointIcon id="laufpunkt" size={18} />
                <span className="half-label">Laufpunkt</span>
                <span className="half-value">+{laufVal}</span>
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
                <PointIcon id="fangpunkt" size={18} />
                <span className="half-label">Fangpunkt</span>
                <span className="half-value">+{fangVal}</span>
              </button>

              {/* Abwurfpunkt – ab dem ersten Schlag; löst Rollenwechsel aus */}
              <button
                className="player-half abwurfpunkt"
                disabled={!abwurfAvailable}
                onClick={() => onScore('abwurfpunkt')}
              >
                <PointIcon id="abwurfpunkt" size={18} />
                <span className="half-label">
                  Abwurf
                  <span className="half-switch" aria-hidden="true">
                    &#8635;
                  </span>
                </span>
                <span className="half-value">+{abwurfVal}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
