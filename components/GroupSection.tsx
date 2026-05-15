"use client";
import React from "react";

/* ─────────────────────────────────────────────
   Rank tier config — luxury color language
───────────────────────────────────────────── */
const TIER = [
  { label: "Q",  color: "#16a34a", glow: "rgba(22,163,74,0.15)",  title: "Lolos"     },
  { label: "Q",  color: "#16a34a", glow: "rgba(22,163,74,0.15)",  title: "Lolos"     },
  { label: "✕",  color: "#dc2626", glow: "rgba(220,38,38,0.15)",  title: "Eliminasi" },
  { label: "✕",  color: "#dc2626", glow: "rgba(220,38,38,0.15)",  title: "Eliminasi" },
  { label: "✕",  color: "#dc2626", glow: "rgba(220,38,38,0.15)",  title: "Eliminasi" },
];

const getTier = (idx: number) => TIER[idx] ?? TIER[TIER.length - 1];

/* ─────────────────────────────────────────────
   GROUP TABLE
───────────────────────────────────────────── */
const GroupTable = ({ group, teams }: { group: string; teams: any[] }) => {
  const sorted = [...teams].sort((a, b) => b.pts - a.pts || b.w - a.w);

  const COLS = [
    { key: "mp",  label: "MP" },
    { key: "w",   label: "W"  },
    { key: "l",   label: "L"  },
    { key: "tb",  label: "TB" },
    { key: "st",  label: "ST" },
    { key: "pts", label: "PTS", accent: true },
  ];

  return (
    <div className="gt-wrap">
      {/* group header */}
      <div className="gt-head">
        <span className="gt-label">GRUP {group}</span>
        <div className="gt-head-line" />
        <span className="gt-count">{sorted.length} Tim</span>
      </div>

      {/* table */}
      <div className="gt-table-shell">
        <div className="gt-cyber-bg" />
        <div className="gt-corner tl" />
        <div className="gt-corner tr" />
        <div className="gt-corner bl" />
        <div className="gt-corner br" />
        
        <div className="gt-table-wrap">
        {/* thead */}
        <div className="gt-thead">
          <span className="gt-th gt-th-rank">#</span>
          <span className="gt-th gt-th-name">Nama Tim</span>
          {COLS.map(c => (
            <span
              key={c.key}
              className={[
                "gt-th gt-th-stat",
                c.accent ? "gt-th-pts" : "",
                `gt-th-${c.key}`,
              ].join(" ").trim()}
            >
              {c.label}
            </span>
          ))}
        </div>

        {/* rows */}
        <div className="gt-tbody">
          {sorted.map((team, idx) => {
            const tier = getTier(idx);
            return (
              <div
                key={team.id}
                className="gt-row"
                style={{ ["--tier-c" as string]: tier.color, ["--tier-g" as string]: tier.glow }}
              >
                {/* rank */}
                <span className="gt-td gt-rank">{idx + 1}</span>

                {/* name */}
                <span className="gt-td gt-name">{team.name}</span>

                {/* stats */}
                {COLS.map(c => (
                  <span
                    key={c.key}
                    className={[
                      "gt-td gt-stat",
                      c.accent ? "gt-pts" : "",
                      `gt-td-${c.key}`,
                    ].join(" ").trim()}
                  >
                    {team[c.key] ?? 0}
                  </span>
                ))}

                {/* left accent bar */}
                <span className="gt-row-bar" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
};

/* ─────────────────────────────────────────────
   MAIN SECTION
───────────────────────────────────────────── */
const GroupSection = ({ teams }: { teams: any[] }) => {
  const groups = ["A", "B", "C", "D"];

  return (
    <section className="gs-section">
      {/* section header */}
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

      {/* legend */}
      <div className="gs-legend">
        {[
          { color: "#4ade80", label: "Lolos ke Final Stage" },
          { color: "#f87171", label: "Eliminasi" },
        ].map(l => (
          <span key={l.label} className="gs-legend-item">
            <span className="gs-legend-dot" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
            {l.label}
          </span>
        ))}
      </div>

      {/* group grid */}
      <div className="gs-grid">
        {groups.map(g => (
          <GroupTable
            key={g}
            group={g}
            teams={teams.filter(t => t.group === g)}
          />
        ))}
      </div>

    </section>
  );
};

export default GroupSection;
