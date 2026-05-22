import { useState } from 'react';
import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import { MAX_PLAYERS_PER_TEAM } from '../types';
import type { TeamId } from '../types';
import PlayerEditor from './PlayerEditor';
import type { DraftPlayer } from './PlayerEditor';

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
 * Startbildschirm: Teamnamen, Spieler (Name + Nummer, bis zu 12 pro Team),
 * Startaufstellung und Timer-Länge.
 */
export default function SetupScreen({
  dispatch,
  canReturnToOverview,
}: SetupScreenProps) {
  const [teamAName, setTeamAName] = useState('Team 1');
  const [teamBName, setTeamBName] = useState('Team 2');
  const [attackingTeam, setAttackingTeam] = useState<TeamId>('A');
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [playersA, setPlayersA] = useState<DraftPlayer[]>([]);
  const [playersB, setPlayersB] = useState<DraftPlayer[]>([]);

  const nameA = teamAName.trim() || 'Team 1';
  const nameB = teamBName.trim() || 'Team 2';

  // Beide Teams brauchen mindestens einen Spieler, sonst kann nicht
  // gepunktet werden.
  const canStart = playersA.length > 0 && playersB.length > 0;

  function addPlayer(team: TeamId, name: string, number: string) {
    const player: DraftPlayer = {
      id: makeDraftId(),
      name: name.trim(),
      number: number.trim(),
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
      attackingTeam,
      timerMinutes,
      playersA: playersA.map((p) => ({ name: p.name, number: p.number })),
      playersB: playersB.map((p) => ({ name: p.name, number: p.number })),
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
          <li>Teams anlegen und je Spieler Name und Nummer eintragen.</li>
          <li>Jeder Spieler ist ein Knopf: Ein Angreifer tippt erst <strong>„Geschlagen"</strong>, dann gibt es pro Schlag genau einen <strong>Lauf-</strong> oder <strong>Weitschlagpunkt</strong>.</li>
          <li>Die Verteidigung macht <strong>Fang-</strong> oder <strong>Abwurfpunkte</strong> – der Abwurfpunkt wechselt die Rollen.</li>
          <li>Läuft der <strong>Timer</strong> ab, wird das Spiel automatisch beendet.</li>
        </ul>
      </div>

      {/* Team 1 */}
      <div className="setup-card">
        <label className="field">
          <span className="field-label">Name Team 1</span>
          <input
            className="text-input"
            value={teamAName}
            maxLength={24}
            onChange={(e) => setTeamAName(e.target.value)}
            placeholder="Team 1"
          />
        </label>
        <PlayerEditor
          players={playersA}
          max={MAX_PLAYERS_PER_TEAM}
          onAdd={(name, number) => addPlayer('A', name, number)}
          onRemove={(id) => removePlayer('A', id)}
        />
      </div>

      {/* Team 2 */}
      <div className="setup-card">
        <label className="field">
          <span className="field-label">Name Team 2</span>
          <input
            className="text-input"
            value={teamBName}
            maxLength={24}
            onChange={(e) => setTeamBName(e.target.value)}
            placeholder="Team 2"
          />
        </label>
        <PlayerEditor
          players={playersB}
          max={MAX_PLAYERS_PER_TEAM}
          onAdd={(name, number) => addPlayer('B', name, number)}
          onRemove={(id) => removePlayer('B', id)}
        />
      </div>

      {/* Spieleinstellungen */}
      <div className="setup-card">
        <div className="field">
          <span className="field-label">Wer greift zuerst an?</span>
          <div className="role-choice">
            <button
              type="button"
              className={`role-choice-btn ${attackingTeam === 'A' ? 'attack' : 'defense'}`}
              onClick={() => setAttackingTeam('A')}
            >
              <span className="rc-name">{nameA}</span>
              <span className="rc-role">
                {attackingTeam === 'A' ? 'ANGRIFF' : 'VERTEIDIGUNG'}
              </span>
            </button>
            <button
              type="button"
              className={`role-choice-btn ${attackingTeam === 'B' ? 'attack' : 'defense'}`}
              onClick={() => setAttackingTeam('B')}
            >
              <span className="rc-name">{nameB}</span>
              <span className="rc-role">
                {attackingTeam === 'B' ? 'ANGRIFF' : 'VERTEIDIGUNG'}
              </span>
            </button>
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
