"use client";
import React from "react";

const TIER = [
  { label: "Q",  color: "#16a34a", glow: "rgba(22,163,74,0.15)",  title: "Lolos"     },
  { label: "Q",  color: "#16a34a", glow: "rgba(22,163,74,0.15)",  title: "Lolos"     },
  { label: "✕",  color: "#dc2626", glow: "rgba(220,38,38,0.15)",  title: "Eliminasi" },
  { label: "✕",  color: "#dc2626", glow: "rgba(220,38,38,0.15)",  title: "Eliminasi" },
];

const getTier = (idx: number) => TIER[idx] ?? TIER[TIER.length - 1];

const GroupTable = ({ group, teams }: { group: string; teams: any[] }) => {
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.tb || 0) - (a.tb || 0));

  const COLS = [
    { key: "played", label: "MATCHES"  },
    { key: "won",    label: "WIN"  },
    { key: "lost",   label: "LOSE"  },
    { key: "points", label: "POINTS", accent: true },
  ];

  return (
    <div className="gt-wrap">
      <div className="gt-head">
        <span className="gt-label">GRUP {group}</span>
        <div className="gt-head-line" />
        <span className="gt-count">{sorted.length} Tim</span>
      </div>

      <div className="gt-table-shell">
        <div className="gt-cyber-bg" />
        <div className="gt-table-wrap">
          <div className="gt-thead">
            <span className="gt-th gt-th-rank">#</span>
            <span className="gt-th gt-th-name">NAMA TIM</span>
            {COLS.map(c => (
              <span key={c.key} className={`gt-th gt-th-stat ${c.accent ? 'gt-th-pts' : ''}`}>
                {c.label}
              </span>
            ))}
          </div>

          <div className="gt-tbody">
            {sorted.map((team, idx) => {
              const tier = getTier(idx);
              return (
                <div key={team.id} className="gt-row">
                  <span className="gt-td gt-rank">{idx + 1}</span>
                  <span className="gt-td gt-name">{team.team}</span>
                  {COLS.map(c => (
                    <span key={c.key} className={`gt-td gt-stat ${c.accent ? 'gt-pts' : ''}`}>
                      {team[c.key] ?? 0}
                    </span>
                  ))}
                  <span className="gt-row-bar" style={{ backgroundColor: tier.color }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupSection = ({ teams }: { teams: any[] }) => {
  const groups = ["A", "B", "C", "D"];

  return (
    <section className="gs-section">
      <div className="gs-header">
        <span className="gs-eyebrow">◆ Klasemen</span>
        <div className="gs-title-row">
          <h2 className="gs-title">Group Stage</h2>
          <div className="gs-status-badge">
            <span className="gs-status-dot" />
            HASIL SEMENTARA
          </div>
          <div className="gs-title-line" />
        </div>
      </div>

      <div className="gs-legend">
        {[
          { color: "#16a34a", label: "Lolos ke Final Stage" },
          { color: "#dc2626", label: "Eliminasi" },
        ].map(l => (
          <span key={l.label} className="gs-legend-item">
            <span className="gs-legend-dot" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="gs-grid">
        {groups.map(g => (
          <GroupTable
            key={g}
            group={g}
            teams={teams.filter(t => t.group === g)}
          />
        ))}
      </div>

      <style jsx>{`
        .gs-section { max-width: 1340px; margin: 0 auto; padding: 80px 36px 100px; }
        .gs-header { margin-bottom: 10px; }
        .gs-eyebrow { font-size: 0.54rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #7a0000; opacity: 0.8; margin-bottom: 6px; display: block; }
        .gs-title-row { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
        .gs-title { font-size: clamp(1.6rem, 3.5vw, 2.6rem); font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: -0.01em; line-height: 1; margin: 0; }
        .gs-title-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(122, 0, 0, 0.2) 0%, rgba(122, 0, 0, 0.05) 50%, transparent 100%); }
        .gs-status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 999px; background: rgba(122, 0, 0, 0.06); border: 1px solid rgba(122, 0, 0, 0.15); font-size: 0.62rem; font-weight: 800; color: #7a0000; letter-spacing: 0.05em; }
        .gs-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #7a0000; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .gs-legend { display: flex; gap: 24px; margin-bottom: 40px; }
        .gs-legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .gs-legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .gs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 40px; }
        @media (max-width: 1100px) { .gs-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

export default GroupSection;
