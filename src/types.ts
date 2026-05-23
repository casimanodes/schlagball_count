// ===========================================================================
// Datenmodell der Schlagball-Zählapp.
//
// Punktelogik (vereinfachte Schlagball-Regeln):
//   - Ein Angriffsspieler muss erst den Ball SCHLAGEN ("geschlagen"), bevor er
//     einen Lauf- oder Weitschlagpunkt erzielen kann.
//   - Der WEITSCHLAGPUNKT kann nur unmittelbar vom letzten Schläger erzielt
//     werden und verbraucht den Schlag NICHT (ein Laufpunkt bleibt möglich).
//   - Der LAUFPUNKT verwertet den Schlag – danach muss neu geschlagen werden.
//   - Die Verteidigung kann einen FANGPUNKT nur erzielen, wenn der Gegner
//     geschlagen hat – und zwar genau einmal je Schlag.
//   - Der ABWURFPUNKT löst den Rollenwechsel aus; er ist erst ab dem ersten
//     Schlag im Spiel möglich.
// ===========================================================================

/** Rolle eines Teams zu einem bestimmten Zeitpunkt. */
export type Role = 'attack' | 'defense';

/** Stabile Kennung eines Teams (A = oben, B = unten – Position bleibt fest). */
export type TeamId = 'A' | 'B';

/** Wählbare Team-Farben. Die Farbe ist eine reine Team-Identität und
 *  ändert sich nicht während des Spiels. */
export type TeamColorId =
  | 'blue'
  | 'red'
  | 'green'
  | 'orange'
  | 'purple'
  | 'teal';

export interface TeamColorConfig {
  id: TeamColorId;
  label: string;
  /** Kräftige Hauptfarbe (Banner, Akzente). */
  bg: string;
  /** Lesbare Textfarbe auf der Hauptfarbe. */
  fg: string;
  /** Sehr helle Variante (Karten-Hintergrund, Punkte-Buttons). */
  soft: string;
  /** Mitteldunkler Ton für Text/Akzente auf hellem Grund. */
  strong: string;
  /** Rand-/Trennfarbe für Karten. */
  border: string;
}

/** Liste aller wählbaren Team-Farben. Reihenfolge = Anzeigereihenfolge im Setup. */
export const TEAM_COLORS: TeamColorConfig[] = [
  {
    id: 'blue',
    label: 'Blau',
    bg: '#2563eb',
    fg: '#ffffff',
    soft: '#dbeafe',
    strong: '#1d4ed8',
    border: '#93c5fd',
  },
  {
    id: 'red',
    label: 'Rot',
    bg: '#dc2626',
    fg: '#ffffff',
    soft: '#fee2e2',
    strong: '#b91c1c',
    border: '#fca5a5',
  },
  {
    id: 'green',
    label: 'Grün',
    bg: '#16a34a',
    fg: '#ffffff',
    soft: '#dcfce7',
    strong: '#15803d',
    border: '#86efac',
  },
  {
    id: 'orange',
    label: 'Orange',
    bg: '#ea580c',
    fg: '#ffffff',
    soft: '#ffedd5',
    strong: '#c2410c',
    border: '#fdba74',
  },
  {
    id: 'purple',
    label: 'Lila',
    bg: '#9333ea',
    fg: '#ffffff',
    soft: '#f3e8ff',
    strong: '#7e22ce',
    border: '#d8b4fe',
  },
  {
    id: 'teal',
    label: 'Türkis',
    bg: '#0d9488',
    fg: '#ffffff',
    soft: '#ccfbf1',
    strong: '#0f766e',
    border: '#5eead4',
  },
];

export const TEAM_COLOR_BY_ID: Record<TeamColorId, TeamColorConfig> =
  Object.fromEntries(TEAM_COLORS.map((c) => [c.id, c])) as Record<
    TeamColorId,
    TeamColorConfig
  >;

/** Vorgabefarben, wenn das Setup keine Auswahl trifft oder ein altes
 *  Spielarchiv ohne Farbe geladen wird. */
export const DEFAULT_TEAM_COLOR: Record<TeamId, TeamColorId> = {
  A: 'blue',
  B: 'red',
};

/** Garantiert eine gültige Team-Farbe (Fallback für Altdaten). */
export function ensureTeamColor(
  id: TeamColorId | string | undefined,
  fallback: TeamColorId,
): TeamColorId {
  if (id && (TEAM_COLOR_BY_ID as Record<string, TeamColorConfig>)[id]) {
    return id as TeamColorId;
  }
  return fallback;
}

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
  /** Punktwert dieser Aktion. Wird auf jedem Punkt-Button angezeigt. */
  value: number;
}

/** Punktarten der ANGRIFFSmannschaft – fix, keine weiteren. */
export const ATTACK_POINT_TYPES: PointTypeConfig[] = [
  { id: 'laufpunkt', label: 'Laufpunkt', short: 'Lauf', role: 'attack', value: 1 },
  {
    id: 'weitschlagpunkt',
    label: 'Weitschlagpunkt',
    short: 'Weitschlag',
    role: 'attack',
    value: 1,
  },
];

/** Punktarten der VERTEIDIGUNGSmannschaft – fix, keine weiteren. */
export const DEFENSE_POINT_TYPES: PointTypeConfig[] = [
  { id: 'fangpunkt', label: 'Fangpunkt', short: 'Fang', role: 'defense', value: 1 },
  {
    id: 'abwurfpunkt',
    label: 'Abwurfpunkt',
    short: 'Abwurf',
    role: 'defense',
    value: 1,
  },
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

/** Zustand eines Teams: Name, Identitätsfarbe und Spielerliste. */
export interface TeamState {
  name: string;
  color: TeamColorId;
  players: Player[];
}

/** Art eines Ereignisses: ein Punkt, ein Schlag ("geschlagen") oder eine
 *  nachträgliche Bearbeitung (manuelle Korrektur eines Punktewerts). */
export type GameEventKind = 'point' | 'hit' | 'edit';

/** Ein einzelnes Spielereignis. Enthält zusätzlich einen Snapshot des
 *  Schlag-Status VOR dem Ereignis, damit Undo zuverlässig funktioniert. */
export interface GameEvent {
  id: string;
  kind: GameEventKind;
  teamId: TeamId;
  playerId: string;
  /** Bei kind 'point' und 'edit' gesetzt, bei kind 'hit' null. */
  pointType: PointTypeId | null;
  /** Bei kind 'edit' die Veränderung (+1 oder -1); sonst null. */
  delta?: number | null;
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
  /** True, sobald der Timer abgelaufen ist. Das Spiel wird NICHT automatisch
   *  beendet – der Schiedsrichter kann noch Punkte bearbeiten und das Spiel
   *  dann manuell beenden. */
  timeExpired?: boolean;
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

/** Eingabedaten eines Spielers aus dem Setup (vor Spielbeginn).
 *  Die Trikotnummer wird automatisch nach der Reihenfolge vergeben. */
export interface PlayerDraft {
  name: string;
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

/** Index des Spielers, der laut fester Reihenfolge als Nächster schlagen
 *  sollte. Abgeleitet aus dem Verlauf: letzter Schlag des Teams + 1
 *  (zyklisch). Hat das Team noch nicht geschlagen, ist der erste Spieler dran.
 *  Liefert -1, wenn das Team keine Spieler hat. */
export function computeNextBatterIndex(
  history: GameEvent[],
  teamId: TeamId,
  players: Player[],
): number {
  if (players.length === 0) return -1;
  for (let i = history.length - 1; i >= 0; i--) {
    const ev = history[i];
    if (ev.kind === 'hit' && ev.teamId === teamId) {
      const idx = players.findIndex((p) => p.id === ev.playerId);
      return idx >= 0 ? (idx + 1) % players.length : 0;
    }
  }
  return 0;
}

/** Sekunden als MM:SS formatieren (Minuten und Sekunden zweistellig). */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
