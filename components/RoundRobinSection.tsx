"use client";
import React from 'react';

/* ─────────────────────────────────────────────
   SUB-COMPONENT: FINAL STAGE TABLE (PREMIUM)
───────────────────────────────────────────── */
const TIER = [
  { color: "#16a34a", glow: "rgba(22,163,74,0.15)" },
  { color: "#16a34a", glow: "rgba(22,163,74,0.15)" },
  { color: "#dc2626", glow: "rgba(220,38,38,0.15)" },
];
const getTier = (idx: number) => TIER[idx] ?? TIER[TIER.length - 1];

const FinalStageTable = ({ teams }: { teams: any[] }) => {
  const COLS = [
    { key: "mp",  label: "MP" },
    { key: "w",   label: "W"  },
    { key: "l",   label: "L"  },
    { key: "tb",  label: "TB" },
    { key: "st",  label: "ST" },
    { key: "pts", label: "PTS", accent: true },
  ];

  return (
    <div className="fs-table-shell">
      <div className="fs-table-wrap">
        {/* thead */}
        <div className="fs-thead">
          <span className="fs-th fs-th-rank">#</span>
          <span className="fs-th fs-th-name">NAMA TIM</span>
          {COLS.map(c => (
            <span key={c.key} className={`fs-th fs-th-stat ${c.accent ? 'fs-th-pts' : ''}`}>
              {c.label}
            </span>
          ))}
        </div>

        {/* tbody */}
        <div className="fs-tbody">
          {teams.map((team, idx) => {
            const tier = getTier(idx);
            return (
              <div
                key={team.id}
                className="fs-row"
                style={{ ["--tier-c" as string]: tier.color, ["--tier-g" as string]: tier.glow }}
              >
                <span className="fs-td fs-rank">{idx + 1}</span>
                <span className="fs-td fs-name">
                  <div className="fs-team-info">
                    <div className="fs-logo-gem">
                      <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${team.name}`} alt="" />
                    </div>
                    <span>{team.name}</span>
                  </div>
                </span>
                {COLS.map(c => (
                  <span key={c.key} className={`fs-td fs-stat ${c.accent ? 'fs-pts' : ''}`}>
                    {team[c.key] ?? 0}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT: FINAL STAGE (ROUND ROBIN)
───────────────────────────────────────────── */
const RoundRobinSection = ({ teams }: { teams: any[] }) => {
  const top8 = teams.slice(0, 8);

  const seedToTeam: Record<string, any> = {
    A1: top8[0], A2: top8[1],
    B1: top8[2], B2: top8[3],
    C1: top8[4], C2: top8[5],
    D1: top8[6], D2: top8[7],
  };

  const rounds = [
    [{ id: 1, home: 'D2', away: 'A1' }, { id: 2, home: 'B1', away: 'C2' }, { id: 3, home: 'C1', away: 'B2' }, { id: 4, home: 'D1', away: 'A2' }],
    [{ id: 5, home: 'B2', away: 'D1' }, { id: 6, home: 'A2', away: 'D2' }, { id: 7, home: 'C2', away: 'C1' }, { id: 8, home: 'A1', away: 'B1' }],
    [{ id: 9, home: 'D1', away: 'C2' }, { id: 10, home: 'C1', away: 'A1' }, { id: 11, home: 'D2', away: 'B1' }, { id: 12, home: 'A2', away: 'B2' }],
    [{ id: 13, home: 'B1', away: 'C1' }, { id: 14, home: 'C2', away: 'A2' }, { id: 15, home: 'A1', away: 'D1' }, { id: 16, home: 'B2', away: 'D2' }],
    [{ id: 17, home: 'B2', away: 'C2' }, { id: 18, home: 'D1', away: 'B1' }, { id: 19, home: 'A2', away: 'A1' }, { id: 20, home: 'D2', away: 'C1' }],
    [{ id: 21, home: 'B1', away: 'A2' }, { id: 22, home: 'A1', away: 'B2' }, { id: 23, home: 'C2', away: 'D2' }, { id: 24, home: 'C1', away: 'D1' }],
    [{ id: 25, home: 'A2', away: 'C1' }, { id: 26, home: 'D2', away: 'D1' }, { id: 27, home: 'B2', away: 'B1' }, { id: 28, home: 'C2', away: 'A1' }],
  ];

  const weekDateMap = [
    'Jumat, 08 Mei 2026', 'Sabtu, 09 Mei 2026', 'Jumat, 15 Mei 2026',
    'Sabtu, 16 Mei 2026', 'Jumat, 22 Mei 2026', 'Sabtu, 23 Mei 2026', 'Jumat, 29 Mei 2026'
  ];
  const slotTime = ['13:00', '15:00', '17:00', '19:00'];

  return (
    <section className="fs-section">
      {/* header */}
      <div className="fs-header">
        <span className="fs-eyebrow">◆ Tournament Finals</span>
        <div className="fs-title-row">
          <h2 className="fs-title">Final Stage</h2>
          <div className="fs-status-badge">
            <span className="fs-status-dot" />
            HASIL SEMENTARA
          </div>
          <div className="fs-title-line" />
        </div>
      </div>

      <p className="fs-desc">
        Top 8 dari fase grup bertanding dalam format Round Robin. Klasemen akhir menentukan juara turnamen.
      </p>

      {/* Standings Table */}
      <FinalStageTable teams={top8} />

    </section>
  );
};

export default RoundRobinSection;
