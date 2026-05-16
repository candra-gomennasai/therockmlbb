"use client";
import React from "react";

type FinalMatch = {
  id?: string;
  round?: string;
  phase?: string;
  team1?: string;
  team2?: string;
  team1Logo?: string;
  team2Logo?: string;
  team1LogoScale?: number;
  team2LogoScale?: number;
  score1?: number;
  score2?: number;
  time?: string;
  day?: number;
  date?: string;
  status?: string;
};

const DEFAULTS = {
  quarter: [
    { id: "qf1", round: "MATCH 1", team1: "TIM A", team2: "TIM B", score1: 0, score2: 0, time: "13:00" },
    { id: "qf2", round: "MATCH 2", team1: "TIM C", team2: "TIM D", score1: 0, score2: 0, time: "15:00" },
    { id: "qf3", round: "MATCH 3", team1: "TIM E", team2: "TIM F", score1: 0, score2: 0, time: "17:00" },
    { id: "qf4", round: "MATCH 4", team1: "TIM G", team2: "TIM H", score1: 0, score2: 0, time: "19:00" },
  ],
  semi: [
    { id: "sf1", round: "MATCH 5", team1: "WIN MATCH 1", team2: "WIN MATCH 2", score1: 0, score2: 0, time: "20:00" },
    { id: "sf2", round: "MATCH 6", team1: "WIN MATCH 3", team2: "WIN MATCH 4", score1: 0, score2: 0, time: "21:00" },
  ],
  final: [{ id: "f1", round: "MATCH 7", team1: "WIN MATCH 5", team2: "WIN MATCH 6", score1: 0, score2: 0, time: "22:00" }],
};

function phaseFromMatch(m: FinalMatch): "quarter" | "semi" | "final" | null {
  const raw = `${m.phase || ""} ${m.round || ""}`.toUpperCase();
  if (raw.includes("QF") || raw.includes("QUARTER") || raw.includes("MATCH 1") || raw.includes("MATCH 2") || raw.includes("MATCH 3") || raw.includes("MATCH 4")) return "quarter";
  if (raw.includes("SF") || raw.includes("SEMI") || raw.includes("MATCH 5") || raw.includes("MATCH 6")) return "semi";
  if (raw.includes("FINAL") || raw.includes("MATCH 7")) return "final";
  return null;
}

function normalizeLen(list: FinalMatch[], fallback: FinalMatch[]) {
  const merged = list.length ? list : fallback;
  if (merged.length >= fallback.length) return merged.slice(0, fallback.length);
  return [...merged, ...fallback.slice(merged.length)];
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
    quarter: normalizeLen(buckets.quarter, DEFAULTS.quarter),
    semi: normalizeLen(buckets.semi, DEFAULTS.semi),
    final: normalizeLen(buckets.final, DEFAULTS.final),
  };
}

function MatchCard({ m }: { m: FinalMatch }) {
  const team1 = m.team1 || "-";
  const team2 = m.team2 || "-";
  const team1Logo = String(m.team1Logo || "").trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(team1)}`;
  const team2Logo = String(m.team2Logo || "").trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(team2)}`;
  const scale1 = Number(m.team1LogoScale ?? 1) || 1;
  const scale2 = Number(m.team2LogoScale ?? 1) || 1;

  const dateText = String(m.date || "").trim() || "JUMAT, 08 MEI 2026";

  return (
    <article className="fb-card">
      <header className="fb-card-head">
        <div className="ms-tags-row">
          <span className="ms-tag">{m.round || "MATCH"}</span>
        </div>
        <span className="ms-time-tag">{m.time || "TBA"}</span>
      </header>
      <div className="fb-vs">
        <div className="fb-side fb-side-left">
          <div className="fb-logo-wrap">
            <img className="fb-team-logo" src={team1Logo} alt={team1} style={{ transform: `scale(${scale1})` }} />
          </div>
          <span className="fb-team fb-team-left">{team1}</span>
        </div>
        <div className="fb-score-box">
          <span className="fb-vs-mid">VS</span>
          <div className="fb-score">
            <strong>{m.score1 ?? 0}</strong>
            <span>-</span>
            <strong>{m.score2 ?? 0}</strong>
          </div>
        </div>
        <div className="fb-side fb-side-right">
          <div className="fb-logo-wrap">
            <img className="fb-team-logo" src={team2Logo} alt={team2} style={{ transform: `scale(${scale2})` }} />
          </div>
          <span className="fb-team fb-team-right">{team2}</span>
        </div>
      </div>
      <div className="fb-date"><span className="ms-date-val">{dateText}</span></div>
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

      <div className="fb-knockout">
        <div className="fb-col fb-col-qf">
          <div className="fb-qf-pair">
            <div className="fb-node fb-node-right"><MatchCard m={b.quarter[0]} /></div>
            <div className="fb-node fb-node-right"><MatchCard m={b.quarter[1]} /></div>
          </div>
          <div className="fb-qf-pair">
            <div className="fb-node fb-node-right"><MatchCard m={b.quarter[2]} /></div>
            <div className="fb-node fb-node-right"><MatchCard m={b.quarter[3]} /></div>
          </div>
        </div>

        <div className="fb-col fb-col-sf">
          <div className="fb-sf-stack">
            <div className="fb-node fb-node-left fb-node-right"><MatchCard m={b.semi[0]} /></div>
            <div className="fb-node fb-node-left fb-node-right"><MatchCard m={b.semi[1]} /></div>
          </div>
        </div>

        <div className="fb-col fb-col-final">
          <div className="fb-final-wrap">
            <div className="fb-node fb-node-left"><MatchCard m={b.final[0]} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}
