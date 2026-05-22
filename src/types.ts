// ===========================================================================
// Datenmodell der Schlagball-Zählapp.
//
// Punktelogik (vereinfachte Schlagball-Regeln):
//   - Ein Angriffsspieler muss erst den Ball SCHLAGEN ("geschlagen"), bevor er
//     einen Lauf- oder Weitschlagpunkt erzielen kann. Pro Schlag gibt es
//     genau EINEN Punkt – danach muss er erneut schlagen.
//   - Der WEITSCHLAGPUNKT kann nur unmittelbar vom Spieler erzielt werden, der
//     gerade geschlagen hat (dem letzten Schläger).
//   - Die Verteidigung kann einen FANGPUNKT nur erzielen, wenn der Gegner
//     geschlagen hat – und zwar genau einmal je Schlag.
//   - Der ABWURFPUNKT ist jederzeit möglich und löst den Rollenwechsel aus.
// ===========================================================================

/** Rolle eines Teams zu einem bestimmten Zeitpunkt. */
export type Role = 'attack' | 'defense';

/** Stabile Kennung eines Teams (A = oben, B = unten – Position bleibt fest). */
export type TeamId = 'A' | 'B';

/** Kennungen der vier fixen Punktarten. */
export type PointTypeId =
  | 'laufpunkt'
  | 'weitschlagpunkt'
  | 'fangpunkt'
  | 'abwurfpunkt';

export interface PointTypeConfig {
  id: PointTypeId;
  label: string;
  short: string;
  role: Role;
}

/** Punktarten der ANGRIFFSmannschaft – fix, keine weiteren. */
export const ATTACK_POINT_TYPES: PointTypeConfig[] = [
  { id: 'laufpunkt', label: 'Laufpunkt', short: 'Lauf', role: 'attack' },
  { id: 'weitschlagpunkt', label: 'Weitschlagpunkt', short: 'Weitschlag', role: 'attack' },
];

/** Punktarten der VERTEIDIGUNGSmannschaft – fix, keine weiteren. */
export const DEFENSE_POINT_TYPES: PointTypeConfig[] = [
  { id: 'fangpunkt', label: 'Fangpunkt', short: 'Fang', role: 'defense' },
  { id: 'abwurfpunkt', label: 'Abwurfpunkt', short: 'Abwurf', role: 'defense' },
];

export const ALL_POINT_TYPES: PointTypeConfig[] = [
  ...ATTACK_POINT_TYPES,
  ...DEFENSE_POINT_TYPES,
];

export const POINT_TYPE_BY_ID: Record<PointTypeId, PointTypeConfig> =
  Object.fromEntries(ALL_POINT_TYPES.map((pt) => [pt.id, pt])) as Record<
    PointTypeId,
    PointTypeConfig
  >;

/** Die Punktart, die einen automatischen Rollenwechsel auslöst. */
export const ROLE_SWITCH_POINT_TYPE: PointTypeId = 'abwurfpunkt';

/** Maximale Anzahl Spieler pro Team. */
export const MAX_PLAYERS_PER_TEAM = 12;

/** Ein einzelner Spieler mit Name, Trikotnummer und eigenem Punktekonto. */
export interface Player {
  id: string;
  name: string;
  number: string;
  /** Punkte dieses Spielers je Punktart (alle vier Arten). */
  points: Record<PointTypeId, number>;
  /** Hat dieser Spieler einen offenen, noch nicht verwerteten Schlag?
   *  Erst dann darf er einen Lauf- oder Weitschlagpunkt erzielen. Nach dem
   *  Punkt wird der Status zurückgesetzt – er muss dann neu schlagen. */
  hasHit: boolean;
}

/** Zustand eines Teams: Name und Spielerliste. */
export interface TeamState {
  name: string;
  players: Player[];
}

/** Art eines Ereignisses: ein Punkt oder ein Schlag ("geschlagen"). */
export type GameEventKind = 'point' | 'hit';

/** Ein einzelnes Spielereignis. Enthält zusätzlich einen Snapshot des
 *  Schlag-Status VOR dem Ereignis, damit Undo zuverlässig funktioniert. */
export interface GameEvent {
  id: string;
  kind: GameEventKind;
  teamId: TeamId;
  playerId: string;
  /** Bei kind 'point' gesetzt, bei kind 'hit' null. */
  pointType: PointTypeId | null;
  timestamp: number;
  causedRoleSwitch: boolean;
  // --- Snapshot des Schlag-Status VOR dem Ereignis (für Undo) ---
  attackingTeamBefore: TeamId;
  lastHitterIdBefore: string | null;
  fangAvailableBefore: boolean;
  /** Ids aller Spieler, die vor dem Ereignis bereits geschlagen hatten. */
  hitPlayerIdsBefore: string[];
}

/** Zustand des Spiel-Timers. Solange er läuft, ist `endsAt` maßgeblich. */
export interface TimerState {
  durationSec: number;
  running: boolean;
  endsAt: number | null;
  remainingSec: number;
}

/** Ein Spiel – laufend oder als Vorlage für ein beendetes Spiel. */
export interface Game {
  id: string;
  teams: Record<TeamId, TeamState>;
  attackingTeam: TeamId;
  /** Spieler, der zuletzt geschlagen hat – nur er darf einen Weitschlag
   *  erzielen. Null, wenn aktuell kein Weitschlag möglich ist. */
  lastHitterId: string | null;
  /** True, wenn die Verteidigung gerade eine (einmalige) Fangpunkt-Chance hat
   *  (d. h. seit dem letzten Schlag wurde noch nicht gefangen). */
  fangAvailable: boolean;
  history: GameEvent[];
  timer: TimerState;
  startedAt: number;
}

/** Grund für das Spielende. */
export type EndReason = 'manual' | 'timer';

/** Ein abgeschlossenes Spiel im Archiv. */
export interface CompletedGame extends Game {
  finishedAt: number;
  endReason: EndReason;
}

/** Welche Ansicht die App gerade zeigt. */
export type AppView = 'setup' | 'playing' | 'overview' | 'detail';

/** Gesamtzustand der App. */
export interface AppState {
  view: AppView;
  currentGame: Game | null;
  completedGames: CompletedGame[];
  selectedGameId: string | null;
}

/** Eingabedaten eines Spielers aus dem Setup (vor Spielbeginn). */
export interface PlayerDraft {
  name: string;
  number: string;
}

/** Gesamtpunktzahl eines Spielers = Summe seiner vier Punktarten. */
export function playerTotal(player: Player): number {
  return ALL_POINT_TYPES.reduce((sum, pt) => sum + player.points[pt.id], 0);
}

/** Gesamtpunktzahl eines Teams = Summe aller Spielerpunkte. */
export function teamTotal(team: TeamState): number {
  return team.players.reduce((sum, p) => sum + playerTotal(p), 0);
}

/** Team-Punkte je Punktart, aufsummiert über alle Spieler. */
export function teamPointTotals(team: TeamState): Record<PointTypeId, number> {
  const totals: Record<PointTypeId, number> = {
    laufpunkt: 0,
    weitschlagpunkt: 0,
    fangpunkt: 0,
    abwurfpunkt: 0,
  };
  for (const player of team.players) {
    for (const pt of ALL_POINT_TYPES) {
      totals[pt.id] += player.points[pt.id];
    }
  }
  return totals;
}

/** Sekunden als MM:SS formatieren (Minuten und Sekunden zweistellig). */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
