// ===========================================================================
// Zentrale State-Verwaltung der Schlagball-Zählapp.
//
// Punktelogik (siehe types.ts):
//   - HIT  : Ein Angriffsspieler schlägt den Ball. Erst danach darf er laufen.
//   - SCORE: Erfasst einen Punkt – nur, wenn die Bedingungen erfüllt sind:
//       * Laufpunkt       → der Spieler muss geschlagen haben
//       * Weitschlagpunkt → nur der zuletzt schlagende Spieler
//       * Fangpunkt       → nur, wenn eine Fang-Chance offen ist
//       * Abwurfpunkt     → jederzeit, löst den Rollenwechsel aus
//
// Jedes Ereignis speichert einen Snapshot des Schlag-Status, damit Undo
// (auch von Schlägen und Rollenwechseln) zuverlässig funktioniert.
// ===========================================================================

import type {
  AppState,
  CompletedGame,
  EndReason,
  Game,
  GameEvent,
  Player,
  PlayerDraft,
  PointTypeId,
  TeamId,
} from './types';
import { ROLE_SWITCH_POINT_TYPE } from './types';

export type GameAction =
  | {
      type: 'START_GAME';
      teamAName: string;
      teamBName: string;
      attackingTeam: TeamId;
      timerMinutes: number;
      playersA: PlayerDraft[];
      playersB: PlayerDraft[];
    }
  | { type: 'HIT'; teamId: TeamId; playerId: string }
  | { type: 'SCORE'; teamId: TeamId; playerId: string; pointType: PointTypeId }
  | {
      type: 'ADJUST_POINT';
      teamId: TeamId;
      playerId: string;
      pointType: PointTypeId;
      delta: number;
    }
  | { type: 'UNDO' }
  | { type: 'END_GAME'; reason: EndReason }
  | { type: 'TIMER_START' }
  | { type: 'TIMER_PAUSE' }
  | { type: 'TIMER_RESET' }
  | { type: 'TIMER_TICK' }
  | { type: 'NEW_GAME' }
  | { type: 'OPEN_GAME'; gameId: string }
  | { type: 'BACK_TO_OVERVIEW' };

export const initialState: AppState = {
  view: 'setup',
  currentGame: null,
  completedGames: [],
  selectedGameId: null,
};

/** Frischer Punktezähler mit allen vier Punktarten auf 0. */
function emptyPoints(): Record<PointTypeId, number> {
  return { laufpunkt: 0, weitschlagpunkt: 0, fangpunkt: 0, abwurfpunkt: 0 };
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Wandelt die Setup-Eingaben in echte Spieler-Objekte um. */
function makePlayers(drafts: PlayerDraft[]): Player[] {
  return drafts.map((draft, index) => ({
    id: makeId(),
    name: draft.name.trim() || `Spieler ${index + 1}`,
    // Nummer automatisch nach der Reihenfolge: 1, 2, 3, ...
    number: String(index + 1),
    points: emptyPoints(),
    hasHit: false,
  }));
}

/** Snapshot des Schlag-Status VOR einem Ereignis – Grundlage für das Undo. */
function captureHitState(game: Game): {
  attackingTeamBefore: TeamId;
  lastHitterIdBefore: string | null;
  fangAvailableBefore: boolean;
  hitPlayerIdsBefore: string[];
} {
  const hitPlayerIdsBefore: string[] = [];
  (['A', 'B'] as TeamId[]).forEach((tid) => {
    game.teams[tid].players.forEach((p) => {
      if (p.hasHit) hitPlayerIdsBefore.push(p.id);
    });
  });
  return {
    attackingTeamBefore: game.attackingTeam,
    lastHitterIdBefore: game.lastHitterId,
    fangAvailableBefore: game.fangAvailable,
    hitPlayerIdsBefore,
  };
}

/** Setzt das hasHit-Flag genau für die übergebenen Spieler-Ids. */
function applyHasHit(
  teams: Record<TeamId, { name: string; players: Player[] }>,
  hitIds: string[],
): Record<TeamId, { name: string; players: Player[] }> {
  const set = new Set(hitIds);
  const map = (players: Player[]) =>
    players.map((p) => ({ ...p, hasHit: set.has(p.id) }));
  return {
    A: { ...teams.A, players: map(teams.A.players) },
    B: { ...teams.B, players: map(teams.B.players) },
  };
}

/** Verschiebt ein Spiel ins Archiv und wechselt in die Übersicht. */
function finishGame(state: AppState, game: Game, reason: EndReason): AppState {
  const completed: CompletedGame = {
    ...game,
    timer: { ...game.timer, running: false, endsAt: null },
    finishedAt: Date.now(),
    endReason: reason,
  };
  return {
    ...state,
    view: 'overview',
    currentGame: null,
    selectedGameId: null,
    completedGames: [completed, ...state.completedGames],
  };
}

export function gameReducer(state: AppState, action: GameAction): AppState {
  switch (action.type) {
    // -- Neues Spiel aus dem Setup starten ---------------------------------
    case 'START_GAME': {
      const durationSec = Math.max(1, Math.round(action.timerMinutes)) * 60;
      const game: Game = {
        id: makeId(),
        teams: {
          A: {
            name: action.teamAName.trim() || 'Team 1',
            players: makePlayers(action.playersA),
          },
          B: {
            name: action.teamBName.trim() || 'Team 2',
            players: makePlayers(action.playersB),
          },
        },
        attackingTeam: action.attackingTeam,
        lastHitterId: null,
        fangAvailable: false,
        history: [],
        timer: {
          durationSec,
          running: false,
          endsAt: null,
          remainingSec: durationSec,
        },
        startedAt: Date.now(),
      };
      return { ...state, view: 'playing', currentGame: game };
    }

    // -- Schlag erfassen: dieser Angriffsspieler hat den Ball geschlagen ---
    case 'HIT': {
      if (!state.currentGame) return state;
      const game = state.currentGame;
      const { teamId, playerId } = action;

      // Nur das Angriffsteam darf schlagen.
      if (teamId !== game.attackingTeam) return state;
      const team = game.teams[teamId];
      const player = team.players.find((p) => p.id === playerId);
      // Spieler muss existieren und darf nicht bereits geschlagen haben.
      if (!player || player.hasHit) return state;

      const event: GameEvent = {
        id: makeId(),
        kind: 'hit',
        teamId,
        playerId,
        pointType: null,
        timestamp: Date.now(),
        causedRoleSwitch: false,
        ...captureHitState(game),
      };

      return {
        ...state,
        currentGame: {
          ...game,
          teams: {
            ...game.teams,
            [teamId]: {
              ...team,
              players: team.players.map((p) =>
                p.id === playerId ? { ...p, hasHit: true } : p,
              ),
            },
          },
          // Dieser Spieler ist nun der letzte Schläger (darf Weitschlag),
          // und die Verteidigung erhält eine Fang-Chance.
          lastHitterId: playerId,
          fangAvailable: true,
          history: [...game.history, event],
        },
      };
    }

    // -- Einen Punkt für einen Spieler erfassen ----------------------------
    case 'SCORE': {
      if (!state.currentGame) return state;
      const game = state.currentGame;
      const { teamId, playerId, pointType } = action;
      const team = game.teams[teamId];
      const player = team.players.find((p) => p.id === playerId);
      if (!player) return state;

      // --- Gating: Punkt nur im richtigen Moment erlauben ---
      if (pointType === 'laufpunkt' && !player.hasHit) return state;
      if (pointType === 'weitschlagpunkt' && game.lastHitterId !== playerId) {
        return state;
      }
      if (pointType === 'fangpunkt' && !game.fangAvailable) return state;
      // Abwurfpunkt erst möglich, sobald im Spiel der erste Schlag erfolgt ist.
      if (pointType === 'abwurfpunkt' && game.history.length === 0) return state;

      const causedRoleSwitch = pointType === ROLE_SWITCH_POINT_TYPE;

      const event: GameEvent = {
        id: makeId(),
        kind: 'point',
        teamId,
        playerId,
        pointType,
        timestamp: Date.now(),
        causedRoleSwitch,
        ...captureHitState(game),
      };

      // Nur der LAUFPUNKT verwertet den Schlag – danach muss der Spieler
      // neu schlagen. Ein Weitschlag schließt einen anschließenden Laufpunkt
      // NICHT aus; der Schlag bleibt dafür offen.
      const resolvesHit = pointType === 'laufpunkt';

      // Punkt gutschreiben; beim Laufpunkt zugleich den Schlag-Status
      // des Spielers zurücksetzen.
      const teamsWithPoint = {
        ...game.teams,
        [teamId]: {
          ...team,
          players: team.players.map((p) =>
            p.id === playerId
              ? {
                  ...p,
                  points: {
                    ...p.points,
                    [pointType]: p.points[pointType] + 1,
                  },
                  hasHit: resolvesHit ? false : p.hasHit,
                }
              : p,
          ),
        },
      };

      // Folgewirkungen je Punktart.
      let teams = teamsWithPoint;
      let attackingTeam = game.attackingTeam;
      let lastHitterId = game.lastHitterId;
      let fangAvailable = game.fangAvailable;

      if (pointType === 'laufpunkt') {
        // Schlag verwertet – der Spieler muss erneut schlagen, bevor er
        // wieder einen Laufpunkt erzielen kann (hasHit wurde oben gesetzt).
        if (lastHitterId === playerId) lastHitterId = null;
      } else if (pointType === 'weitschlagpunkt') {
        // Weitschlag erzielt: kein zweiter Weitschlag für denselben Schlag,
        // aber der Schlag bleibt offen – ein Laufpunkt ist weiter möglich.
        lastHitterId = null;
        fangAvailable = false;
      } else if (pointType === 'fangpunkt') {
        // Der Schlag wurde gefangen – Fang-Chance verbraucht.
        fangAvailable = false;
        lastHitterId = null;
      } else if (pointType === 'abwurfpunkt') {
        // Rollenwechsel: das punktende Team greift an, neue Angriffsphase –
        // alle Schlag-Status werden zurückgesetzt.
        attackingTeam = teamId;
        lastHitterId = null;
        fangAvailable = false;
        teams = applyHasHit(teamsWithPoint, []);
      }

      return {
        ...state,
        currentGame: {
          ...game,
          teams,
          attackingTeam,
          lastHitterId,
          fangAvailable,
          history: [...game.history, event],
        },
      };
    }

    // -- Punkt nachträglich bearbeiten (manuelle Korrektur) ---------------
    case 'ADJUST_POINT': {
      if (!state.currentGame) return state;
      const game = state.currentGame;
      const { teamId, playerId, pointType, delta } = action;
      if (delta !== 1 && delta !== -1) return state;
      const team = game.teams[teamId];
      const player = team.players.find((p) => p.id === playerId);
      if (!player) return state;

      const current = player.points[pointType];
      const next = current + delta;
      // Nie unter 0 fallen lassen.
      if (next < 0) return state;

      const event: GameEvent = {
        id: makeId(),
        kind: 'edit',
        teamId,
        playerId,
        pointType,
        delta,
        timestamp: Date.now(),
        causedRoleSwitch: false,
        ...captureHitState(game),
      };

      return {
        ...state,
        currentGame: {
          ...game,
          teams: {
            ...game.teams,
            [teamId]: {
              ...team,
              players: team.players.map((p) =>
                p.id === playerId
                  ? {
                      ...p,
                      points: {
                        ...p.points,
                        [pointType]: next,
                      },
                    }
                  : p,
              ),
            },
          },
          history: [...game.history, event],
        },
      };
    }

    // -- Letzte Aktion rückgängig machen -----------------------------------
    case 'UNDO': {
      if (!state.currentGame || state.currentGame.history.length === 0) {
        return state;
      }
      const game = state.currentGame;
      const last = game.history[game.history.length - 1];

      // 1. Punkt-Delta zurücknehmen.
      let teams = game.teams;
      if (last.kind === 'point' && last.pointType !== null) {
        const pt = last.pointType;
        const team = game.teams[last.teamId];
        teams = {
          ...game.teams,
          [last.teamId]: {
            ...team,
            players: team.players.map((p) =>
              p.id === last.playerId
                ? {
                    ...p,
                    points: {
                      ...p.points,
                      [pt]: Math.max(0, p.points[pt] - 1),
                    },
                  }
                : p,
            ),
          },
        };
      } else if (
        last.kind === 'edit' &&
        last.pointType !== null &&
        typeof last.delta === 'number'
      ) {
        // Bearbeitung umkehren: das Delta abziehen.
        const pt = last.pointType;
        const delta = last.delta;
        const team = game.teams[last.teamId];
        teams = {
          ...game.teams,
          [last.teamId]: {
            ...team,
            players: team.players.map((p) =>
              p.id === last.playerId
                ? {
                    ...p,
                    points: {
                      ...p.points,
                      [pt]: Math.max(0, p.points[pt] - delta),
                    },
                  }
                : p,
            ),
          },
        };
      }

      // 2. Schlag-Status komplett aus dem Snapshot wiederherstellen.
      teams = applyHasHit(teams, last.hitPlayerIdsBefore);

      return {
        ...state,
        currentGame: {
          ...game,
          teams,
          attackingTeam: last.attackingTeamBefore,
          lastHitterId: last.lastHitterIdBefore,
          fangAvailable: last.fangAvailableBefore,
          history: game.history.slice(0, -1),
        },
      };
    }

    // -- Spiel manuell beenden ---------------------------------------------
    case 'END_GAME': {
      if (!state.currentGame) return state;
      return finishGame(state, state.currentGame, action.reason);
    }

    // -- Timer starten -----------------------------------------------------
    case 'TIMER_START': {
      if (!state.currentGame) return state;
      const t = state.currentGame.timer;
      if (t.running || t.remainingSec <= 0) return state;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          timer: {
            ...t,
            running: true,
            endsAt: Date.now() + t.remainingSec * 1000,
          },
        },
      };
    }

    // -- Timer pausieren ---------------------------------------------------
    case 'TIMER_PAUSE': {
      if (!state.currentGame) return state;
      const t = state.currentGame.timer;
      if (!t.running) return state;
      const remaining =
        t.endsAt != null
          ? Math.max(0, Math.round((t.endsAt - Date.now()) / 1000))
          : t.remainingSec;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          timer: { ...t, running: false, endsAt: null, remainingSec: remaining },
        },
      };
    }

    // -- Timer auf die eingestellte Dauer zurücksetzen ---------------------
    case 'TIMER_RESET': {
      if (!state.currentGame) return state;
      const t = state.currentGame.timer;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          timer: {
            ...t,
            running: false,
            endsAt: null,
            remainingSec: t.durationSec,
          },
          // Zeit-abgelaufen-Status zurücksetzen, wenn der Schiedsrichter
          // den Timer neu starten möchte.
          timeExpired: false,
        },
      };
    }

    // -- Timer-Tick: verbleibende Zeit neu berechnen -----------------------
    case 'TIMER_TICK': {
      if (!state.currentGame) return state;
      const t = state.currentGame.timer;
      if (!t.running || t.endsAt == null) return state;

      const remaining = Math.max(0, Math.round((t.endsAt - Date.now()) / 1000));

      if (remaining <= 0) {
        // Timer abgelaufen – Spiel NICHT automatisch beenden. Stattdessen
        // den Timer stoppen und timeExpired markieren, damit der
        // Schiedsrichter Punkte bearbeiten und das Spiel manuell beenden
        // kann.
        return {
          ...state,
          currentGame: {
            ...state.currentGame,
            timer: { ...t, running: false, endsAt: null, remainingSec: 0 },
            timeExpired: true,
          },
        };
      }

      if (remaining === t.remainingSec) return state;

      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          timer: { ...t, remainingSec: remaining },
        },
      };
    }

    // -- Navigation --------------------------------------------------------
    case 'NEW_GAME':
      return { ...state, view: 'setup', currentGame: null, selectedGameId: null };

    case 'OPEN_GAME':
      return { ...state, view: 'detail', selectedGameId: action.gameId };

    case 'BACK_TO_OVERVIEW':
      return { ...state, view: 'overview', selectedGameId: null };

    default:
      return state;
  }
}
