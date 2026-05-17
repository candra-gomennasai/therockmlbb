"use client";
import React, { useMemo } from "react";

type Item = {
  id?: string;
  team?: string;
  logo?: string;
  points?: number;
  won?: number;
};

function rankTeams(list: Item[]) {
  return [...(list || [])]
    .sort((a, b) => Number(b.points || 0) - Number(a.points || 0) || Number(b.won || 0) - Number(a.won || 0))
    .slice(0, 3);
}

function fallbackLogo(name: string) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name || "team")}`;
}

export default function ChampionPodium({ teams, imageUrl }: { teams: Item[]; imageUrl?: string }) {
  const img = String(imageUrl || "").trim();
  if (!img) {
    return (
      <section className="ch-soon">
        <span>COMING SOON</span>
        <style jsx>{`
          .ch-soon {
            min-height: 60vh;
            display: grid;
            place-items: center;
            max-width: 1120px;
            margin: 0 auto;
            padding: 80px 24px 100px;
          }
          .ch-soon span {
            color: #7a0000;
            font-weight: 900;
            letter-spacing: 0.14em;
            font-size: clamp(1.4rem, 4vw, 2.8rem);
            text-transform: uppercase;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="ch-image">
      <img src={img} alt="Champion" />
      <style jsx>{`
        .ch-image { max-width: 1120px; margin: 0 auto; padding: 76px 24px 90px; }
        .ch-image img { width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid rgba(0,0,0,.08); }
        @media (max-width: 860px) { .ch-image { padding: 56px 12px 70px; } }
      `}</style>
    </section>
  );
}

function _LegacyPodium({ teams }: { teams: Item[] }) {
  const top3 = useMemo(() => rankTeams(teams), [teams]);
  const first = top3[0] || { team: "Juara 1", logo: "", points: 0 };
  const second = top3[1] || { team: "Juara 2", logo: "", points: 0 };
  const third = top3[2] || { team: "Juara 3", logo: "", points: 0 };

  const Box = ({ title, item, cls }: { title: string; item: any; cls: string }) => (
    <article className={`ch-card ${cls}`}>
      <div className="ch-rank">{title}</div>
      <img className="ch-logo" src={item.logo || fallbackLogo(item.team)} alt={item.team || title} />
      <h3>{item.team || title}</h3>
    </article>
  );

  return (
    <section className="ch-wrap">
      <span className="ch-eyebrow">Hall of Champions</span>
      <h2>Juara Season 2026</h2>
      <div className="ch-podium">
        <Box title="Juara 2" item={second} cls="ch-second" />
        <Box title="Juara 1" item={first} cls="ch-first" />
        <Box title="Juara 3" item={third} cls="ch-third" />
      </div>
      <style jsx>{`
        .ch-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 80px 24px 100px;
          text-align: center;
          background:
            radial-gradient(600px 220px at 50% 0%, rgba(122,0,0,.07), transparent 70%);
        }
        .ch-eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #7a0000;
          font-size: .66rem;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        h2 {
          margin: 0 0 34px;
          color: #0f172a;
          font-size: clamp(2rem,4vw,3rem);
          text-transform: uppercase;
        }
        .ch-podium {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          align-items: end;
        }
        .ch-card {
          background:
            linear-gradient(180deg, rgba(122,0,0,.03), rgba(122,0,0,0)),
            #fff;
          border: 1px solid rgba(122,0,0,.12);
          border-radius: 16px;
          padding: 16px 14px 18px;
          box-shadow: 0 14px 30px rgba(15,23,42,.06);
          position: relative;
          overflow: hidden;
        }
        .ch-card::before {
          content: "";
          position: absolute;
          left: 0; right: 0; top: 0;
          height: 4px;
          background: linear-gradient(90deg, #7a0000, #b91c1c, #7a0000);
        }
        .ch-rank {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 26px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(122,0,0,.1);
          color: #7a0000;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          font-size: .65rem;
          margin-bottom: 12px;
        }
        .ch-logo {
          width: 110px;
          height: 110px;
          object-fit: contain;
          display: block;
          margin: 0 auto 10px;
        }
        h3 {
          margin: 0;
          font-size: 1.12rem;
          color: #0f172a;
          text-transform: uppercase;
          line-height: 1.1;
        }
        .ch-first {
          min-height: 330px;
          border-color: rgba(122,0,0,.26);
          transform: translateY(-10px);
        }
        .ch-second, .ch-third { min-height: 292px; }
        @media (max-width: 860px) {
          .ch-wrap { padding: 56px 12px 70px; }
          .ch-podium { grid-template-columns: 1fr; }
          .ch-first, .ch-second, .ch-third { min-height: unset; }
        }
      `}</style>
    </section>
  );
}
