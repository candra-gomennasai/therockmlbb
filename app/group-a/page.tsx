"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-db";

type Standing = {
  id: string;
  team: string;
  group: string;
};

type Match = {
  id: string;
  team1: string;
  team2: string;
  time?: string;
  date?: string;
  group?: string;
};

export default function GroupAPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const unsubStandings = onSnapshot(doc(db, "standings", "data"), (snap) => {
      const payload = (snap.data() || {}) as { items?: Standing[] };
      setStandings(Array.isArray(payload.items) ? payload.items : []);
    });
    const unsubMatches = onSnapshot(doc(db, "matches", "data"), (snap) => {
      const payload = (snap.data() || {}) as { items?: Match[] };
      setMatches(Array.isArray(payload.items) ? payload.items : []);
    });
    return () => {
      unsubStandings();
      unsubMatches();
    };
  }, []);

  const groupATeams = useMemo(
    () => standings.filter((t) => String(t.group).toUpperCase() === "A"),
    [standings]
  );

  const groupAMatches = useMemo(
    () =>
      matches.filter((m) => {
        const group = String(m.group || "").toUpperCase();
        const phase = String((m as any).phase || "").toUpperCase();
        return group === "A" || phase.includes("(A)") || phase.includes("GRUP A") || phase.includes("GROUP A");
      }),
    [matches]
  );

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ margin: 0, color: "#7a0000", fontWeight: 900, letterSpacing: ".04em" }}>GRUP A</h1>
      <p style={{ marginTop: 8, color: "#475569" }}>Total tim: {groupATeams.length}</p>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 12, color: "#0f172a" }}>Daftar Tim</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {groupATeams.map((team, i) => (
            <div
              key={team.id}
              style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "12px 14px", fontWeight: 800, color: "#0f172a" }}
            >
              {i + 1}. {team.team}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12, color: "#0f172a" }}>Jadwal Grup A</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {groupAMatches.length === 0 && (
            <div style={{ border: "1px solid #e2e8f0", background: "#fff", padding: 14, color: "#64748b" }}>
              Belum ada jadwal untuk Grup A.
            </div>
          )}
          {groupAMatches.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #e2e8f0",
                background: "#fff",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div style={{ fontWeight: 800, color: "#0f172a" }}>
                {m.team1} vs {m.team2}
              </div>
              <div style={{ color: "#7a0000", fontWeight: 800, whiteSpace: "nowrap" }}>
                {(m.time || m.date || "TBA").toString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
