import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { CompletedGame } from '../types';
import {
  formatClock,
  POINT_TYPE_BY_ID,
  TEAM_COLOR_BY_ID,
  teamTotal,
} from '../types';

interface OverviewScreenProps {
  games: CompletedGame[];
  dispatch: Dispatch<GameAction>;
}

type Winner = 'A' | 'B' | 'draw';

function pointsClass(winner: Winner, team: 'A' | 'B'): string {
  if (winner === 'draw') return 'gc-points';
  return winner === team ? 'gc-points winner' : 'gc-points loser';
}

/**
 * Lädt alle beendeten Spiele als lesbare JSON-Datei herunter – inklusive des
 * Verlaufs (Reihenfolge aller Punkte, Schläge und Korrekturen) je Spiel.
 */
function downloadGames(games: CompletedGame[]): void {
  const spiele = games.map((game, index) => {
    const totalA = teamTotal(game.teams.A);
    const totalB = teamTotal(game.teams.B);
    type ExportRow = {
      zeit: string;
      timestamp: number;
      team: string;
      spieler: string;
      aktion: string;
    };
    const rows: ExportRow[] = [];
    game.history.forEach((ev) => {
      const team = game.teams[ev.teamId];
      const player = team.players.find((p) => p.id === ev.playerId);
      let aktion: string;
      if (ev.kind === 'edit' && ev.pointType) {
        const delta = typeof ev.delta === 'number' ? ev.delta : 0;
        const sign = delta > 0 ? '+' : '';
        aktion = `Korrektur ${POINT_TYPE_BY_ID[ev.pointType].label} (${sign}${delta})`;
      } else if (ev.pointType) {
        aktion = POINT_TYPE_BY_ID[ev.pointType].label;
      } else {
        aktion = 'Geschlagen';
      }
      rows.push({
        zeit: new Date(ev.timestamp).toLocaleTimeString('de-DE'),
        timestamp: ev.timestamp,
        team: team.name,
        spieler: player ? `#${player.number} ${player.name}` : 'Unbekannt',
        aktion,
      });
    });
    (game.timerLog ?? []).forEach((te) => {
      const label =
        te.kind === 'start'
          ? 'Timer gestartet'
          : te.kind === 'pause'
          ? 'Timer pausiert'
          : 'Zeit abgelaufen';
      rows.push({
        zeit: new Date(te.timestamp).toLocaleTimeString('de-DE'),
        timestamp: te.timestamp,
        team: '',
        spieler: '',
        aktion: `${label} (Restzeit ${formatClock(te.remainingSec)})`,
      });
    });
    rows.sort((a, b) => a.timestamp - b.timestamp);
    const verlauf = rows.map((r, i) => ({ nr: i + 1, ...r }));
    return {
      nummer: games.length - index,
      beendet: new Date(game.finishedAt).toLocaleString('de-DE'),
      ergebnis: `${game.teams.A.name} ${totalA} : ${totalB} ${game.teams.B.name}`,
      teams: game.teams,
      verlauf,
    };
  });

  const payload = {
    app: 'Schlagball-Zähler',
    exportiertAm: new Date().toISOString(),
    anzahlSpiele: games.length,
    spiele,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `schlagball-spiele-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Spielübersicht: listet alle beendeten Spiele (z. B. eines Turniers) mit
 * Teamnamen, Team-Farben und Ergebnis. Ein Tippen auf eine Karte öffnet
 * die Detailansicht.
 */
export default function OverviewScreen({ games, dispatch }: OverviewScreenProps) {
  return (
    <div className="overview">
      <div className="overview-header">
        <h1>Spielübersicht</h1>
        <p className="overview-sub">
          {games.length === 0
            ? 'Noch keine Spiele beendet'
            : `${games.length} ${games.length === 1 ? 'Spiel' : 'Spiele'} gespielt`}
        </p>
      </div>

      <div className="overview-list">
        {games.length === 0 && (
          <p className="overview-empty">
            Sobald du ein Spiel beendest, erscheint es hier in der Liste.
          </p>
        )}

        {games.map((game, index) => {
          // games ist neueste-zuerst sortiert → höchste Nummer steht oben.
          const number = games.length - index;
          const totalA = teamTotal(game.teams.A);
          const totalB = teamTotal(game.teams.B);
          const winner: Winner =
            totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'draw';
          const cfgA = TEAM_COLOR_BY_ID[game.teams.A.color];
          const cfgB = TEAM_COLOR_BY_ID[game.teams.B.color];
          const date = new Date(game.finishedAt).toLocaleString('de-DE', {
            dateStyle: 'short',
            timeStyle: 'short',
          });

          return (
            <button
              key={game.id}
              className="game-card"
              onClick={() => dispatch({ type: 'OPEN_GAME', gameId: game.id })}
            >
              <div className="game-card-top">
                <span className="gc-num">SPIEL {number}</span>
                <span className="gc-reason">
                  {game.endReason === 'timer'
                    ? 'Timer abgelaufen'
                    : 'Manuell beendet'}
                </span>
              </div>

              <div className="game-card-main">
                <span
                  className={`gc-team ${winner === 'A' ? 'winner' : ''}`}
                  style={{ color: cfgA.strong }}
                >
                  <span
                    className="gc-dot"
                    style={{ background: cfgA.bg }}
                    aria-hidden="true"
                  />
                  {game.teams.A.name}
                </span>
                <span className="gc-score">
                  <span className={pointsClass(winner, 'A')}>{totalA}</span>
                  <span className="gc-sep">:</span>
                  <span className={pointsClass(winner, 'B')}>{totalB}</span>
                </span>
                <span
                  className={`gc-team right ${winner === 'B' ? 'winner' : ''}`}
                  style={{ color: cfgB.strong }}
                >
                  {game.teams.B.name}
                  <span
                    className="gc-dot"
                    style={{ background: cfgB.bg }}
                    aria-hidden="true"
                  />
                </span>
              </div>

              <div className="game-card-foot">
                <span>{date}</span>
                {winner === 'draw' && (
                  <span className="gc-draw">Unentschieden</span>
                )}
                <span className="gc-chevron">Details &#8250;</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="overview-actions">
        {games.length > 0 && (
          <button
            className="secondary-btn"
            onClick={() => downloadGames(games)}
          >
            Spiele als Datei speichern
          </button>
        )}
        <button
          className="primary-btn"
          onClick={() => dispatch({ type: 'NEW_GAME' })}
        >
          Neues Spiel
        </button>
      </div>
    </div>
  );
}
