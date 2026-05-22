import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { Game, TeamId } from '../types';
import { computeNextBatterIndex } from '../types';
import Scoreboard from './Scoreboard';
import TimerBar from './TimerBar';
import TeamPanel from './TeamPanel';
import Controls from './Controls';
import ScoreHistory from './ScoreHistory';

interface GameScreenProps {
  game: Game;
  dispatch: Dispatch<GameAction>;
}

// Team A immer oben, Team B immer unten – feste Position, nur Rolle wechselt.
const TEAM_IDS: TeamId[] = ['A', 'B'];

/**
 * Haupt-Spielbildschirm: Scoreboard, Timer, beide Team-Panels, Verlauf und
 * Kontrollleiste. Solange der Timer läuft, wird er sekündlich aktualisiert;
 * läuft er ab, beendet der Reducer das Spiel automatisch.
 */
export default function GameScreen({ game, dispatch }: GameScreenProps) {
  const [roleSwitchMsg, setRoleSwitchMsg] = useState<string | null>(null);
  const prevHistoryLen = useRef(game.history.length);

  // Timer-Ticker – läuft nur, solange der Timer aktiv ist.
  useEffect(() => {
    if (!game.timer.running) return;
    const id = setInterval(() => dispatch({ type: 'TIMER_TICK' }), 500);
    return () => clearInterval(id);
  }, [game.timer.running, dispatch]);

  // Rollenwechsel-Hinweis bei einem neu erfassten Abwurfpunkt einblenden.
  useEffect(() => {
    const len = game.history.length;
    if (len > prevHistoryLen.current) {
      const last = game.history[len - 1];
      if (last.causedRoleSwitch) {
        const attacker = game.teams[game.attackingTeam].name;
        setRoleSwitchMsg(`Rollenwechsel – ${attacker} greift jetzt an`);
      }
    }
    prevHistoryLen.current = len;
  }, [game.history, game.attackingTeam, game.teams]);

  useEffect(() => {
    if (!roleSwitchMsg) return;
    const timer = setTimeout(() => setRoleSwitchMsg(null), 3200);
    return () => clearTimeout(timer);
  }, [roleSwitchMsg]);

  function handleEndGame() {
    if (
      window.confirm(
        'Spiel jetzt beenden? Es wird in der Spielübersicht gespeichert.',
      )
    ) {
      dispatch({ type: 'END_GAME', reason: 'manual' });
    }
  }

  return (
    <div className="game">
      <Scoreboard game={game} />
      <TimerBar timer={game.timer} dispatch={dispatch} />

      <div className="game-body">
        <div className="panels">
          {TEAM_IDS.map((id) => (
            <TeamPanel
              key={id}
              team={game.teams[id]}
              role={game.attackingTeam === id ? 'attack' : 'defense'}
              lastHitterId={game.lastHitterId}
              fangAvailable={game.fangAvailable}
              abwurfAvailable={game.history.length > 0}
              nextBatterIndex={computeNextBatterIndex(
                game.history,
                id,
                game.teams[id].players,
              )}
              onHit={(playerId) => dispatch({ type: 'HIT', teamId: id, playerId })}
              onScore={(playerId, pointType) =>
                dispatch({ type: 'SCORE', teamId: id, playerId, pointType })
              }
            />
          ))}
        </div>

        <ScoreHistory history={game.history} teams={game.teams} />
      </div>

      <Controls
        canUndo={game.history.length > 0}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onEndGame={handleEndGame}
      />

      {roleSwitchMsg && (
        <div className="toast" role="status">
          {roleSwitchMsg}
        </div>
      )}
    </div>
  );
}
