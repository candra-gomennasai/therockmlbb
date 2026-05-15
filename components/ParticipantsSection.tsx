"use client";
import React from "react";

/* ─────────────────────────────────────────────────
   Org accent colors — keyed to match the tone of
   the hero (amber/orange as primary, cool secondaries)
───────────────────────────────────────────────── */
const ORG_ACCENTS: Record<string, { color: string; glow: string }> = {
  "PT BSK":  { color: "#3b82f6", glow: "rgba(59, 130, 246, 0.15)" },
  "PT KKP":  { color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.15)"  },
  "PT KSY":  { color: "#10b981", glow: "rgba(16, 185, 129, 0.15)"  },
  "PT MS":   { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.18)"  },
  "PT RHS":  { color: "#ec4899", glow: "rgba(236, 72, 153, 0.15)"  },
  "PT STP":  { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.15)"  },
  "CWS":     { color: "#f97316", glow: "rgba(249, 115, 22, 0.18)"  },
  "EMU":     { color: "#22c55e", glow: "rgba(34, 197, 94, 0.15)"   },
  "RO":      { color: "#84cc16", glow: "rgba(132, 204, 22, 0.15)"  },
  "TC":      { color: "#d946ef", glow: "rgba(217, 70, 239, 0.15)"  },
};
const DEFAULT_ACCENT = { color: "#94a3b8", glow: "rgba(148,163,184,0.18)" };

const ParticipantsSection = ({ teams }: { teams: any[] }) => {
  const getOrgKey = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0].toUpperCase() === "PT") {
      const second = parts[1].toUpperCase().replace(/[0-9]/g, "");
      if (second.startsWith("MS")) return "PT MS";
      return `${parts[0]} ${second || parts[1].toUpperCase()}`.toUpperCase();
    }
    const first = parts[0].toUpperCase();
    if (first === "MS") return "PT MS";
    return first;
  };

  const groupedByOrg = teams.reduce<Record<string, any[]>>((acc, team) => {
    const key = getOrgKey(team.name);
    if (!acc[key]) acc[key] = [];
    acc[key].push(team);
    return acc;
  }, {});

  const orgKeys = Object.keys(groupedByOrg).sort((a, b) => {
    const aIsPt = a.startsWith("PT ");
    const bIsPt = b.startsWith("PT ");
    if (aIsPt && !bIsPt) return -1;
    if (!aIsPt && bIsPt) return 1;
    return a.localeCompare(b);
  });

  return (
    <section className="ps-wrap">

      <div className="ps-inner">
        {/* ── Section header ── */}
        <div className="ps-head">
          <span className="ps-eyebrow">◆ Peserta Resmi</span>
          <div className="ps-title-row">
            <h2 className="ps-title">Daftar Tim Peserta</h2>
            <div className="ps-title-line" />
            <span className="ps-count">{teams.length}<span className="ps-count-label"> Tim</span></span>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="ps-grid">
          {orgKeys.map((org) => {
            const acc = ORG_ACCENTS[org] ?? DEFAULT_ACCENT;
            const groupedTeams = groupedByOrg[org].sort((a, b) => {
              const numFromName = (n: string) => {
                const m = n.match(/(\d+)\s*$/);
                return m ? Number(m[1]) : Infinity;
              };
              const nA = numFromName(a.name), nB = numFromName(b.name);
              if (nA !== nB) return nA - nB;
              const numA = Number(a.logo), numB = Number(b.logo);
              if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
              return a.name.localeCompare(b.name);
            });

            return (
              <div
                key={org}
                className="org-card"
                style={{
                  ["--c"  as string]: acc.color,
                  ["--gl" as string]: acc.glow,
                }}
              >
                {/* inner surface */}
                <div className="org-inner">
                  {/* corner glow orb */}
                  <div className="org-orb" aria-hidden />

                  {/* header row */}
                  <div className="org-head">
                    <span className="org-pip" />
                    <span className="org-name">{org}</span>
                  </div>

                  {/* divider */}
                  <div className="org-divider" />

                  {/* team rows */}
                  <div className="org-teams">
                    {groupedTeams.map((team, idx) => (
                      <div key={team.id} className="team-row">
                        {/* rank mark */}
                        <span className="team-rank">{String(idx + 1).padStart(2, "0")}</span>
                        {/* name */}
                        <span className="team-name">{team.name}</span>
                        {/* seed chip */}
                        <span className="team-seed">{team.logo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};

export default ParticipantsSection;
