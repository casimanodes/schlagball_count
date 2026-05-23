import { useEffect, useRef, useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { Game, TeamId } from '../types';
import { computeNextBatterIndex } from '../types';
import Scoreboard from './Scoreboard';
import TeamPanel from './TeamPanel';
import Controls from './Controls';
import ConfirmDialog from './ConfirmDialog';
import HistoryDrawer from './HistoryDrawer';

interface GameScreenProps {
  game: Game;
  dispatch: Dispatch<GameAction>;
}

// Team A immer oben, Team B immer unten – feste Position, nur Rolle wechselt.
const TEAM_IDS: TeamId[] = ['A', 'B'];

/**
 * Haupt-Spielbildschirm: Scoreboard mit integriertem (klickbarem) Timer,
 * beide Team-Panels und Kontrollleiste mit Icon-Buttons. Verlauf und
 * Team-Punktarten sind im Verlauf-Drawer untergebracht (über das Symbol in
 * der Kontrollleiste). Bei Timer-Ablauf wird ein deutlicher Hinweis
 * eingeblendet, das Spiel läuft aber bis zum manuellen Beenden weiter.
 */
export default function GameScreen({ game, dispatch }: GameScreenProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const prevHistoryLen = useRef(game.history.length);
  const prevTimeExpired = useRef<boolean>(!!game.timeExpired);
  const prevRunning = useRef<boolean>(game.timer.running);

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
        setToastMsg(`Rollenwechsel – ${attacker} greift jetzt an`);
      }
    }
    prevHistoryLen.current = len;
  }, [game.history, game.attackingTeam, game.teams]);

  // Timer-Status-Wechsel (Pause/Start/Abgelaufen) als Toast einblenden.
  useEffect(() => {
    const wasRunning = prevRunning.current;
    const isRunning = game.timer.running;
    const wasExpired = prevTimeExpired.current;
    const isExpired = !!game.timeExpired;

    if (!wasExpired && isExpired) {
      setToastMsg('Zeit abgelaufen');
    } else if (wasRunning && !isRunning && !isExpired) {
      setToastMsg('Timer pausiert');
    } else if (!wasRunning && isRunning) {
      setToastMsg('Timer läuft');
    }

    prevRunning.current = isRunning;
    prevTimeExpired.current = isExpired;
  }, [game.timer.running, game.timeExpired]);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMsg]);

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
      <Scoreboard
        game={game}
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
      </div>

      <Controls
        canUndo={game.history.length > 0}
        editMode={editMode}
        historyCount={game.history.length + (game.timerLog?.length ?? 0)}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onToggleEdit={handleToggleEdit}
        onOpenHistory={() => setHistoryOpen(true)}
        onEndGame={handleEndGame}
      />

      {toastMsg && (
        <div className="toast" role="status">
          {toastMsg}
        </div>
      )}

      <HistoryDrawer
        open={historyOpen}
        history={game.history}
        timerLog={game.timerLog ?? []}
        teams={game.teams}
        onClose={() => setHistoryOpen(false)}
      />

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
