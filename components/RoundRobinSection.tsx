"use client";
import React from 'react';

const RoundRobinSection = ({ teams }: { teams: any[] }) => {
  const sorted = [...teams].sort((a, b) => b.points - a.points || (b.tb || 0) - (a.tb || 0));

  const COLS = [
    { key: "played", label: "MP" },
    { key: "won",    label: "W"  },
    { key: "lost",   label: "L"  },
    { key: "tb",     label: "TB" },
    { key: "st",     label: "ST" },
    { key: "points", label: "PTS", accent: true },
  ];

  return (
    <section className="rs-section">
      <div className="rs-header">
        <span className="rs-eyebrow">◆ CHAMPIONSHIP ROUND</span>
        <div className="rs-title-row">
          <h2 className="rs-title">Final Stage Standings</h2>
          <div className="rs-status-badge">
            <span className="rs-status-dot" />
            LIVE TABLE
          </div>
          <div className="rs-title-line" />
        </div>
      </div>

      <div className="rs-table-shell">
        <table className="rs-table">
          <thead>
            <tr>
              <th className="rs-th-rank">#</th>
              <th className="rs-th-name">Tim</th>
              {COLS.map(c => (
                <th key={c.key} className={`rs-th-stat ${c.accent ? 'rs-th-pts' : ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((team, idx) => (
              <tr key={team.id} className="rs-row">
                <td className="rs-td-rank">{idx + 1}</td>
                <td className="rs-td-name">{team.team}</td>
                {COLS.map(c => (
                  <td key={c.key} className={`rs-td-stat ${c.accent ? 'rs-pts' : ''}`}>
                    {team[c.key] ?? 0}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="rs-empty">Belum ada data klasemen final.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .rs-section { padding: 60px 20px; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .rs-header { margin-bottom: 48px; }
        .rs-eyebrow { font-size: 11px; font-weight: 900; color: #94a3b8; letter-spacing: 0.2em; }
        .rs-title-row { display: flex; align-items: center; gap: 20px; margin-top: 12px; }
        .rs-title { font-size: 2.5rem; font-weight: 900; color: #000; letter-spacing: -0.04em; margin: 0; }
        .rs-status-badge { display: flex; align-items: center; gap: 8px; background: #000; color: #fff; padding: 6px 14px; border-radius: 99px; font-size: 10px; font-weight: 900; }
        .rs-status-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .rs-title-line { flex: 1; height: 1px; background: #f1f5f9; }

        .rs-table-shell { background: #fff; border-radius: 32px; padding: 24px; box-shadow: 0 40px 80px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.02); overflow-x: auto; }
        .rs-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .rs-table th { padding: 24px 20px; text-align: left; font-size: 11px; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; }
        .rs-table td { padding: 20px; border-top: 1px solid #f8fafc; font-size: 1rem; color: #0f172a; }

        .rs-th-rank, .rs-td-rank { width: 60px; text-align: center; }
        .rs-td-rank { font-weight: 900; color: #94a3b8; }
        .rs-td-name { font-weight: 900; font-size: 1.1rem; }
        .rs-td-stat { font-weight: 800; color: #64748b; width: 80px; }
        .rs-pts { color: #000; font-weight: 900; font-size: 1.2rem; }
        .rs-th-pts { color: #000; }

        .rs-empty { text-align: center; padding: 80px; color: #94a3b8; font-weight: 800; font-style: italic; }

        @media (max-width: 768px) {
          .rs-title { font-size: 1.8rem; }
          .rs-table-shell { padding: 12px; border-radius: 20px; }
        }
      `}</style>
    </section>
  );
};

export default RoundRobinSection;
