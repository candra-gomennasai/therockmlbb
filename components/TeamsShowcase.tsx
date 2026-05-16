"use client";
import React from "react";

type TeamLike = {
  id?: string;
  name?: string;
  team?: string;
};

const FALLBACK = ["PT MS3", "PT KKP 2", "PT STP 3", "RO IC", "PT RHS 2", "EMU", "CWS", "TIM BARU", "PT KSY 3"];
const LOGOS = [
  "https://ik.imagekit.io/7xrur26qt/ae-256.png",
  "https://ik.imagekit.io/7xrur26qt/btr_vit.png",
  "https://ik.imagekit.io/7xrur26qt/dewa-united-500.png",
  "https://ik.imagekit.io/7xrur26qt/evos-500.png",
  "https://ik.imagekit.io/7xrur26qt/geek-500.png",
  "https://ik.imagekit.io/7xrur26qt/NAVI-2.png",
  "https://ik.imagekit.io/7xrur26qt/onic-b-256.png",
  "https://ik.imagekit.io/7xrur26qt/rrq-500.png",
  "https://ik.imagekit.io/7xrur26qt/TLID-Primary500x500.png",
];

function normalizeTeams(teams: TeamLike[]) {
  const labels = teams
    .map((t) => String(t?.name || t?.team || "").trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  return labels.length ? labels.slice(0, 12) : FALLBACK;
}

export default function TeamsShowcase({ teams }: { teams: TeamLike[] }) {
  const normalized = normalizeTeams(teams || []).slice(0, 9);
  const list = FALLBACK.map((code, i) => normalized[i] || code);

  return (
    <section className="teams-section">
      <div className="teams-head">
        <h2 className="teams-title">Tim</h2>
      </div>

      <div className="teams-track">
        {list.map((team, idx) => (
          <article key={`${team}-${idx}`} className="team-pennant">
            <div className="team-top-strip" />
            <div className="team-cap" title={team}>
              {(FALLBACK[idx] || team.toUpperCase()).toUpperCase()}
            </div>
            <div className="team-body">
              <img src={LOGOS[idx] || `https://api.dicebear.com/7.x/identicon/svg?seed=${team}`} alt={team} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
