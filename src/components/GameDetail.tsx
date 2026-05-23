import type { Dispatch } from 'react';
import type { GameAction } from '../gameReducer';
import type { CompletedGame, TeamId } from '../types';
import {
  ALL_POINT_TYPES,
  formatClock,
  playerTotal,
  TEAM_COLOR_BY_ID,
  teamTotal,
} from '../types';
import ScoreHistory from './ScoreHistory';
import { PointIcon } from './icons';

interface GameDetailProps {
  game: CompletedGame;
  gameNumber: number;
  dispatch: Dispatch<GameAction>;
}

const TEAM_IDS: TeamId[] = ['A', 'B'];

/**
 * Detailansicht eines beendeten Spiels: Ergebnis (in Team-Farbe), Sieger,
 * Eckdaten, Punkte je Spieler und der vollständige Verlauf.
 */
export default function GameDetail({
  game,
  gameNumber,
  dispatch,
}: GameDetailProps) {
  const totalA = teamTotal(game.teams.A);
  const totalB = teamTotal(game.teams.B);
  const winner: 'A' | 'B' | 'draw' =
    totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'draw';

  const cfgA = TEAM_COLOR_BY_ID[game.teams.A.color];
  const cfgB = TEAM_COLOR_BY_ID[game.teams.B.color];

  const durationSec = Math.round((game.finishedAt - game.startedAt) / 1000);
  const finished = new Date(game.finishedAt).toLocaleString('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="detail">
      <div className="detail-header">
        <button
          className="back-btn"
          onClick={() => dispatch({ type: 'BACK_TO_OVERVIEW' })}
        >
          &#8249; Übersicht
        </button>
        <span className="detail-title">Spiel {gameNumber}</span>
      </div>

      <div className="detail-body">
        <div className="detail-result">
          <div
            className={`dr-team ${winner === 'A' ? 'winner' : ''}`}
            style={{ background: cfgA.soft, color: cfgA.strong }}
          >
            <span
              className="dr-color"
              style={{ background: cfgA.bg }}
              aria-hidden="true"
            />
            <span className="dr-name">{game.teams.A.name}</span>
            <span className="dr-score" style={{ color: cfgA.strong }}>
              {totalA}
            </span>
          </div>
          <span className="dr-sep">:</span>
          <div
            className={`dr-team ${winner === 'B' ? 'winner' : ''}`}
            style={{ background: cfgB.soft, color: cfgB.strong }}
          >
            <span
              className="dr-color"
              style={{ background: cfgB.bg }}
              aria-hidden="true"
            />
            <span className="dr-name">{game.teams.B.name}</span>
            <span className="dr-score" style={{ color: cfgB.strong }}>
              {totalB}
            </span>
          </div>
        </div>

        <p className="detail-outcome">
          {winner === 'draw'
            ? 'Unentschieden'
            : `Sieger: ${game.teams[winner].name}`}
        </p>

        <div className="detail-meta">
          <div className="dm-item">
            <span>Beendet</span>
            <strong>{finished}</strong>
          </div>
          <div className="dm-item">
            <span>Spieldauer</span>
            <strong>{formatClock(durationSec)} min</strong>
          </div>
          <div className="dm-item">
            <span>Spielende</span>
            <strong>
              {game.endReason === 'timer'
                ? 'Timer abgelaufen'
                : 'Manuell beendet'}
            </strong>
          </div>
        </div>

        {TEAM_IDS.map((id) => {
          const team = game.teams[id];
          const cfg = TEAM_COLOR_BY_ID[team.color];
          return (
            <div key={id} className="detail-team-stats">
              <h3 style={{ color: cfg.strong }}>
                <span
                  className="dts-dot"
                  style={{ background: cfg.bg }}
                  aria-hidden="true"
                />
                {team.name}
              </h3>
              <ul className="detail-players">
                {team.players.map((p) => (
                  <li key={p.id} className="detail-player">
                    <div className="dp-top">
                      <span className="dp-num">#{p.number}</span>
                      <span className="dp-name">{p.name}</span>
                      <span className="dp-total">{playerTotal(p)}</span>
                    </div>
                    <div className="dp-types">
                      {ALL_POINT_TYPES.map((pt) => (
                        <span key={pt.id} className={`dp-type ${pt.role}`}>
                          <span className="dp-type-icon">
                            <PointIcon id={pt.id} size={12} />
                          </span>
                          {pt.short}
                          <strong>{p.points[pt.id]}</strong>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <section className="detail-history">
          <h3>Verlauf</h3>
          <ScoreHistory
            history={game.history}
            timerLog={game.timerLog ?? []}
            teams={game.teams}
          />
        </section>
      </div>
    </div>
  );
}
