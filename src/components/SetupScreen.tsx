import { useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import {
  MAX_PLAYERS_PER_TEAM,
  TEAM_COLORS,
  TEAM_COLOR_BY_ID,
} from '../types';
import type { TeamColorId, TeamId } from '../types';
import PlayerEditor from './PlayerEditor';
import type { DraftPlayer } from './PlayerEditor';
import { AttackIcon, DefenseIcon } from './icons';

interface SetupScreenProps {
  dispatch: Dispatch<GameAction>;
  canReturnToOverview: boolean;
}

const MIN_MINUTES = 1;
const MAX_MINUTES = 90;

function makeDraftId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Startbildschirm: Teamnamen, Team-Farbe, Spieler (Name + Nummer, bis zu
 * 12 pro Team), Startaufstellung und Timer-Länge.
 */
export default function SetupScreen({
  dispatch,
  canReturnToOverview,
}: SetupScreenProps) {
  const [teamAName, setTeamAName] = useState('Team 1');
  const [teamBName, setTeamBName] = useState('Team 2');
  const [teamAColor, setTeamAColor] = useState<TeamColorId>('blue');
  const [teamBColor, setTeamBColor] = useState<TeamColorId>('red');
  const [attackingTeam, setAttackingTeam] = useState<TeamId>('A');
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [playersA, setPlayersA] = useState<DraftPlayer[]>([]);
  const [playersB, setPlayersB] = useState<DraftPlayer[]>([]);

  const nameA = teamAName.trim() || 'Team 1';
  const nameB = teamBName.trim() || 'Team 2';

  // Beide Teams brauchen mindestens einen Spieler, sonst kann nicht
  // gepunktet werden.
  const canStart = playersA.length > 0 && playersB.length > 0;

  function addPlayer(team: TeamId, name: string) {
    const player: DraftPlayer = {
      id: makeDraftId(),
      name: name.trim(),
    };
    if (team === 'A') setPlayersA((ps) => [...ps, player]);
    else setPlayersB((ps) => [...ps, player]);
  }

  function removePlayer(team: TeamId, id: string) {
    if (team === 'A') setPlayersA((ps) => ps.filter((p) => p.id !== id));
    else setPlayersB((ps) => ps.filter((p) => p.id !== id));
  }

  function changeMinutes(delta: number) {
    setTimerMinutes((m) =>
      Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, m + delta)),
    );
  }

  function startGame() {
    if (!canStart) return;
    dispatch({
      type: 'START_GAME',
      teamAName,
      teamBName,
      teamAColor,
      teamBColor,
      attackingTeam,
      timerMinutes,
      playersA: playersA.map((p) => ({ name: p.name })),
      playersB: playersB.map((p) => ({ name: p.name })),
    });
  }

  return (
    <div className="setup">
      <div className="setup-header">
        <h1>Schlagball</h1>
        <p className="subtitle">Punkte-Zähler für Schiedsrichter</p>
      </div>

      <div className="setup-intro">
        <h2>So funktioniert's</h2>
        <ul>
          <li>Teams anlegen, Farbe wählen und je Spieler den Namen eintragen.</li>
          <li>
            Jeder Spieler ist ein Knopf: Ein Angreifer tippt erst{' '}
            <strong>„Geschlagen"</strong>, dann gibt es pro Schlag genau einen{' '}
            <strong>Lauf-</strong> oder <strong>Weitschlagpunkt</strong>.
          </li>
          <li>
            Die Verteidigung macht <strong>Fang-</strong> oder{' '}
            <strong>Abwurfpunkte</strong> – der Abwurfpunkt wechselt die Rollen.
          </li>
          <li>
            Läuft der <strong>Timer</strong> ab, kannst du noch korrigieren und
            das Spiel manuell beenden.
          </li>
        </ul>
      </div>

      <TeamSetup
        label="Team 1"
        name={teamAName}
        onName={setTeamAName}
        color={teamAColor}
        onColor={setTeamAColor}
        otherColor={teamBColor}
        players={playersA}
        onAdd={(n) => addPlayer('A', n)}
        onRemove={(id) => removePlayer('A', id)}
      />

      <TeamSetup
        label="Team 2"
        name={teamBName}
        onName={setTeamBName}
        color={teamBColor}
        onColor={setTeamBColor}
        otherColor={teamAColor}
        players={playersB}
        onAdd={(n) => addPlayer('B', n)}
        onRemove={(id) => removePlayer('B', id)}
      />

      {/* Spieleinstellungen */}
      <div className="setup-card">
        <div className="field">
          <span className="field-label">Wer greift zuerst an?</span>
          <div className="role-choice">
            <RoleButton
              active={attackingTeam === 'A'}
              role={attackingTeam === 'A' ? 'attack' : 'defense'}
              name={nameA}
              color={teamAColor}
              onClick={() => setAttackingTeam('A')}
            />
            <RoleButton
              active={attackingTeam === 'B'}
              role={attackingTeam === 'B' ? 'attack' : 'defense'}
              name={nameB}
              color={teamBColor}
              onClick={() => setAttackingTeam('B')}
            />
          </div>
        </div>

        <div className="field">
          <span className="field-label">Spieldauer (Timer)</span>
          <div className="stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => changeMinutes(-1)}
              disabled={timerMinutes <= MIN_MINUTES}
              aria-label="Weniger Minuten"
            >
              &#8722;
            </button>
            <span className="stepper-value">
              {timerMinutes}
              <span className="stepper-unit">Min</span>
            </span>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => changeMinutes(1)}
              disabled={timerMinutes >= MAX_MINUTES}
              aria-label="Mehr Minuten"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <button className="primary-btn" onClick={startGame} disabled={!canStart}>
        Spiel starten
      </button>
      {!canStart && (
        <p className="setup-warning">
          Füge jedem Team mindestens einen Spieler hinzu.
        </p>
      )}

      {canReturnToOverview && (
        <button
          className="link-btn"
          onClick={() => dispatch({ type: 'BACK_TO_OVERVIEW' })}
        >
          Zur Spielübersicht
        </button>
      )}
    </div>
  );
}

interface TeamSetupProps {
  label: string;
  name: string;
  onName: (n: string) => void;
  color: TeamColorId;
  onColor: (c: TeamColorId) => void;
  /** Farbe des anderen Teams – wird als Hinweis markiert, falls identisch
   *  gewählt wird (technisch erlaubt). */
  otherColor: TeamColorId;
  players: DraftPlayer[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

function TeamSetup({
  label,
  name,
  onName,
  color,
  onColor,
  otherColor,
  players,
  onAdd,
  onRemove,
}: TeamSetupProps) {
  const cfg = TEAM_COLOR_BY_ID[color];
  const clash = color === otherColor;

  return (
    <div className="setup-card">
      <label className="field">
        <span className="field-label">Name {label}</span>
        <input
          className="text-input"
          value={name}
          maxLength={24}
          onChange={(e) => onName(e.target.value)}
          placeholder={label}
        />
      </label>

      <div className="field">
        <span className="field-label">Team-Farbe</span>
        <div
          className="color-choice"
          role="radiogroup"
          aria-label={`Farbe ${label}`}
        >
          {TEAM_COLORS.map((c) => (
            <button
              type="button"
              key={c.id}
              role="radio"
              aria-checked={c.id === color}
              className={`color-swatch ${c.id === color ? 'selected' : ''}`}
              style={{ background: c.bg, color: c.fg }}
              onClick={() => onColor(c.id)}
              title={c.label}
            >
              {c.id === color && (
                <span className="color-check" aria-hidden="true">
                  &#10003;
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="color-summary" style={{ color: cfg.strong }}>
          {cfg.label}
          {clash && (
            <span className="color-clash">
              {' '}
              – beide Teams haben die gleiche Farbe.
            </span>
          )}
        </span>
      </div>

      <PlayerEditor
        players={players}
        max={MAX_PLAYERS_PER_TEAM}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    </div>
  );
}

interface RoleButtonProps {
  active: boolean;
  role: 'attack' | 'defense';
  name: string;
  color: TeamColorId;
  onClick: () => void;
}

function RoleButton({ active, role, name, color, onClick }: RoleButtonProps) {
  const cfg = TEAM_COLOR_BY_ID[color];
  return (
    <button
      type="button"
      className={`role-choice-btn ${active ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        borderColor: cfg.bg,
        background: active ? cfg.bg : cfg.soft,
        color: active ? cfg.fg : cfg.strong,
      }}
    >
      <span className="rc-name">{name}</span>
      <span className="rc-role">
        {role === 'attack' ? (
          <>
            <AttackIcon size={14} /> ANGRIFF
          </>
        ) : (
          <>
            <DefenseIcon size={14} /> VERTEIDIGUNG
          </>
        )}
      </span>
    </button>
  );
}
