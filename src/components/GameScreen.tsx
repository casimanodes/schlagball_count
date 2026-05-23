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
import ConfirmDialog from './ConfirmDialog';

interface GameScreenProps {
  game: Game;
  dispatch: Dispatch<GameAction>;
}

// Team A immer oben, Team B immer unten – feste Position, nur Rolle wechselt.
const TEAM_IDS: TeamId[] = ['A', 'B'];

/**
 * Haupt-Spielbildschirm: Scoreboard, Timer, beide Team-Panels, Verlauf und
 * Kontrollleiste. Solange der Timer läuft, wird er sekündlich aktualisiert;
 * läuft er ab, markiert der Reducer das Spiel als "Zeit abgelaufen" – das
 * Spiel wird NICHT automatisch beendet, sondern der Schiedsrichter kann
 * noch Korrekturen vornehmen und das Spiel dann manuell beenden.
 */
export default function GameScreen({ game, dispatch }: GameScreenProps) {
  const [roleSwitchMsg, setRoleSwitchMsg] = useState<string | null>(null);
  const [timeUpToast, setTimeUpToast] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const prevHistoryLen = useRef(game.history.length);
  const prevTimeExpired = useRef<boolean>(!!game.timeExpired);

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

  // Sobald die Zeit zum ersten Mal abläuft, kurze Toast-Meldung einblenden.
  useEffect(() => {
    if (game.timeExpired && !prevTimeExpired.current) {
      setTimeUpToast(true);
    }
    prevTimeExpired.current = !!game.timeExpired;
  }, [game.timeExpired]);

  useEffect(() => {
    if (!timeUpToast) return;
    const timer = setTimeout(() => setTimeUpToast(false), 3200);
    return () => clearTimeout(timer);
  }, [timeUpToast]);

  function handleEndGame() {
    setConfirmEndOpen(true);
  }

  function confirmEndGame() {
    setConfirmEndOpen(false);
    dispatch({
      type: 'END_GAME',
      reason: game.timeExpired ? 'timer' : 'manual',
    });
  }

  function handleToggleEdit() {
    setEditMode((on) => !on);
  }

  return (
    <div className="game">
      <Scoreboard game={game} />
      <TimerBar
        timer={game.timer}
        dispatch={dispatch}
        expired={!!game.timeExpired}
      />

      {game.timeExpired && (
        <div className="time-up-bar" role="status">
          <span className="time-up-title">Zeit abgelaufen</span>
          <span className="time-up-sub">
            Du kannst Punkte noch bearbeiten – beende das Spiel, wenn alles
            passt.
          </span>
        </div>
      )}

      {editMode && (
        <div className="edit-bar" role="status">
          <span className="edit-bar-title">Bearbeitungs-Modus</span>
          <span className="edit-bar-sub">
            Punkte mit + / − korrigieren. Jede Änderung wird im Verlauf
            dokumentiert.
          </span>
        </div>
      )}

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
              editMode={editMode}
              onHit={(playerId) => dispatch({ type: 'HIT', teamId: id, playerId })}
              onScore={(playerId, pointType) =>
                dispatch({ type: 'SCORE', teamId: id, playerId, pointType })
              }
              onAdjust={(playerId, pointType, delta) =>
                dispatch({
                  type: 'ADJUST_POINT',
                  teamId: id,
                  playerId,
                  pointType,
                  delta,
                })
              }
            />
          ))}
        </div>

        <ScoreHistory history={game.history} teams={game.teams} />
      </div>

      <Controls
        canUndo={game.history.length > 0}
        editMode={editMode}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onToggleEdit={handleToggleEdit}
        onEndGame={handleEndGame}
      />

      {roleSwitchMsg && (
        <div className="toast" role="status">
          {roleSwitchMsg}
        </div>
      )}

      {timeUpToast && !roleSwitchMsg && (
        <div className="toast time-up-toast" role="status">
          Zeit abgelaufen
        </div>
      )}

      <ConfirmDialog
        open={confirmEndOpen}
        title="Spiel beenden?"
        message="Das Spiel wird in der Spielübersicht gespeichert. Diese Aktion lässt sich nicht rückgängig machen."
        confirmLabel="Beenden"
        cancelLabel="Abbrechen"
        variant="danger"
        onConfirm={confirmEndGame}
        onCancel={() => setConfirmEndOpen(false)}
      />
    </div>
  );
}
