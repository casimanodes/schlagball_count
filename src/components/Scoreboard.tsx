import { teamTotal } from '../types';
import type { Game } from '../types';

interface ScoreboardProps {
  game: Game;
}

/**
 * Kopfbereich mit der Spielinfo: beide Teamnamen, Gesamtpunkte und die
 * aktuelle Rolle (Angriff / Verteidigung) jeder Mannschaft.
 */
export default function Scoreboard({ game }: ScoreboardProps) {
  const aRole = game.attackingTeam === 'A' ? 'attack' : 'defense';
  const bRole = game.attackingTeam === 'B' ? 'attack' : 'defense';

  return (
    <header className="scoreboard">
      <div className={`sb-team ${aRole}`}>
        <span className="sb-name">{game.teams.A.name}</span>
        <span className="sb-score">{teamTotal(game.teams.A)}</span>
        <span className="sb-role">{aRole === 'attack' ? 'ANGRIFF' : 'VERTEIDIGUNG'}</span>
      </div>

      <div className="sb-mid">
        <span className="sb-mid-title">SCHLAGBALL</span>
        <span className="sb-colon">:</span>
      </div>

      <div className={`sb-team ${bRole}`}>
        <span className="sb-name">{game.teams.B.name}</span>
        <span className="sb-score">{teamTotal(game.teams.B)}</span>
        <span className="sb-role">{bRole === 'attack' ? 'ANGRIFF' : 'VERTEIDIGUNG'}</span>
      </div>
    </header>
  );
}
