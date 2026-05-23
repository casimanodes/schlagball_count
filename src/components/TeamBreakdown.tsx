import { useState } from 'react';
import {
  ALL_POINT_TYPES,
  TEAM_COLOR_BY_ID,
  teamPointTotals,
} from '../types';
import type { TeamId, TeamState } from '../types';
import { PointIcon } from './icons';

interface TeamBreakdownProps {
  teams: Record<TeamId, TeamState>;
}

/**
 * Gemeinsame Aufschlüsselung der Punktarten BEIDER Teams. Wird über dem
 * Verlauf platziert und ist über genau einen Knopf ein-/ausklappbar.
 */
export default function TeamBreakdown({ teams }: TeamBreakdownProps) {
  const [open, setOpen] = useState(false);
  const totalsA = teamPointTotals(teams.A);
  const totalsB = teamPointTotals(teams.B);
  const cfgA = TEAM_COLOR_BY_ID[teams.A.color];
  const cfgB = TEAM_COLOR_BY_ID[teams.B.color];

  return (
    <section className="team-breakdown">
      <button
        className="breakdown-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>Team-Punktarten {open ? 'ausblenden' : 'anzeigen'}</span>
        <span className={`chevron ${open ? 'open' : ''}`} aria-hidden="true">
          &#9662;
        </span>
      </button>

      {open && (
        <div className="breakdown-table">
          <div className="breakdown-head">
            <span className="bh-spacer" />
            <span
              className="bh-team"
              style={{ background: cfgA.soft, color: cfgA.strong }}
            >
              <span
                className="bh-dot"
                style={{ background: cfgA.bg }}
                aria-hidden="true"
              />
              {teams.A.name}
            </span>
            <span
              className="bh-team"
              style={{ background: cfgB.soft, color: cfgB.strong }}
            >
              <span
                className="bh-dot"
                style={{ background: cfgB.bg }}
                aria-hidden="true"
              />
              {teams.B.name}
            </span>
          </div>

          {ALL_POINT_TYPES.map((pt) => (
            <div key={pt.id} className="breakdown-row">
              <span className="br-label">
                <PointIcon id={pt.id} size={14} /> {pt.label}
              </span>
              <span className="br-value">{totalsA[pt.id]}</span>
              <span className="br-value">{totalsB[pt.id]}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
