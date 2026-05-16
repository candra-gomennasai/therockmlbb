"use client";
import React from "react";

type FinalMatch = {
  id?: string;
  round?: string;
  phase?: string;
  team1?: string;
  team2?: string;
  score1?: number;
  score2?: number;
  time?: string;
  status?: string;
};

const DEFAULTS = {
  quarter: [
    { id: "qf1", round: "QF 1", team1: "TIM A", team2: "TIM B", score1: 0, score2: 0, time: "13:00" },
    { id: "qf2", round: "QF 2", team1: "TIM C", team2: "TIM D", score1: 0, score2: 0, time: "15:00" },
    { id: "qf3", round: "QF 3", team1: "TIM E", team2: "TIM F", score1: 0, score2: 0, time: "17:00" },
    { id: "qf4", round: "QF 4", team1: "TIM G", team2: "TIM H", score1: 0, score2: 0, time: "19:00" },
  ],
  semi: [
    { id: "sf1", round: "SF 1", team1: "WIN QF1", team2: "WIN QF2", score1: 0, score2: 0, time: "17:00" },
    { id: "sf2", round: "SF 2", team1: "WIN QF3", team2: "WIN QF4", score1: 0, score2: 0, time: "19:00" },
  ],
  final: [{ id: "f1", round: "FINAL", team1: "WIN SF1", team2: "WIN SF2", score1: 0, score2: 0, time: "20:00" }],
};

function phaseFromMatch(m: FinalMatch): "quarter" | "semi" | "final" | null {
  const raw = `${m.phase || ""} ${m.round || ""}`.toUpperCase();
  if (raw.includes("QF") || raw.includes("QUARTER")) return "quarter";
  if (raw.includes("SF") || raw.includes("SEMI")) return "semi";
  if (raw.includes("FINAL")) return "final";
  return null;
}

function bucketMatches(matches: FinalMatch[]) {
  const buckets: Record<"quarter" | "semi" | "final", FinalMatch[]> = {
    quarter: [],
    semi: [],
    final: [],
  };
  for (const m of matches) {
    const p = phaseFromMatch(m);
    if (p) buckets[p].push(m);
  }
  return {
    quarter: buckets.quarter.length ? buckets.quarter : DEFAULTS.quarter,
    semi: buckets.semi.length ? buckets.semi : DEFAULTS.semi,
    final: buckets.final.length ? buckets.final : DEFAULTS.final,
  };
}

function MatchCard({ m }: { m: FinalMatch }) {
  return (
    <article className="fb-card">
      <header className="fb-card-head">
        <span>{m.round || "MATCH"}</span>
        <span>{m.time || "-"}</span>
      </header>
      <div className="fb-vs">
        <span className="fb-team">{m.team1 || "-"}</span>
        <span className="fb-vs-mid">VS</span>
        <span className="fb-team">{m.team2 || "-"}</span>
      </div>
      <div className="fb-score">
        <strong>{m.score1 ?? 0}</strong>
        <span>-</span>
        <strong>{m.score2 ?? 0}</strong>
      </div>
    </article>
  );
}

export default function FinalStageBracket({ matches }: { matches: FinalMatch[] }) {
  const b = bucketMatches(matches || []);
  return (
    <section className="fb-wrap">
      <div className="fb-head">
        <span className="fb-eyebrow">◆ Championship Bracket</span>
        <h2>Final Stage</h2>
      </div>

      <div className="fb-grid">
        <div className="fb-col">
          <h3>Quarter Final</h3>
          <div className="fb-list">{b.quarter.map((m) => <MatchCard key={m.id || `${m.round}-${m.team1}`} m={m} />)}</div>
        </div>

        <div className="fb-col">
          <h3>Semi Final</h3>
          <div className="fb-list">{b.semi.map((m) => <MatchCard key={m.id || `${m.round}-${m.team1}`} m={m} />)}</div>
        </div>

        <div className="fb-col">
          <h3>Final</h3>
          <div className="fb-list">{b.final.map((m) => <MatchCard key={m.id || `${m.round}-${m.team1}`} m={m} />)}</div>
        </div>
      </div>
    </section>
  );
}
