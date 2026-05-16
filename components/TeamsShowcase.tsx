"use client";
import React from "react";

type TeamLike = {
  id?: string;
  name?: string;
  team?: string;
  logo?: string;
  teamOrder?: number;
  logoScale?: number;
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
  const sorted = [...teams].sort((a: any, b: any) => {
    const ao = Number(a?.teamOrder ?? 999999);
    const bo = Number(b?.teamOrder ?? 999999);
    if (ao !== bo) return ao - bo;
    const an = String(a?.name || a?.team || "").toUpperCase();
    const bn = String(b?.name || b?.team || "").toUpperCase();
    return an.localeCompare(bn);
  });

  const seen = new Set<string>();
  const list = sorted
    .map((t) => ({
      label: String(t?.name || t?.team || "").trim(),
      logo: String(t?.logo || "").trim(),
      logoScale: Number(t?.logoScale ?? 1),
    }))
    .filter((t) => t.label)
    .filter((t) => {
      const k = t.label.toUpperCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  return list.length ? list.slice(0, 20) : FALLBACK.map((f, i) => ({ label: f, logo: LOGOS[i] || "", logoScale: 1 }));
}

function getDefaultScale(label: string, logoUrl: string) {
  const name = label.toUpperCase();
  const url = logoUrl.toLowerCase();
  if (name.includes("PT MS 1") || url.includes("casper")) return 1.22;
  return 1;
}

function getCapClass(label: string): string {
  const len = label.trim().length;
  if (len >= 12) return "cap-xs";
  if (len >= 10) return "cap-sm";
  return "";
}

export default function TeamsShowcase({ teams }: { teams: TeamLike[] }) {
  const normalized = normalizeTeams(teams || []);

  return (
    <section className="teams-section">
      <div className="teams-head">
        <h2 className="teams-title">Tim</h2>
      </div>

      <div className="teams-track">
        {normalized.map((item, idx) => (
          <article key={`${item.label}-${idx}`} className="team-pennant">
            <div className="team-top-strip" />
            <div className={`team-cap ${getCapClass(item.label)}`} title={item.label}>
              {item.label.toUpperCase()}
            </div>
            <div className="team-body">
              <img
                src={item.logo || LOGOS[idx] || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.label}`}
                alt={item.label}
                style={{ transform: `scale(${item.logoScale && item.logoScale > 0 ? item.logoScale : getDefaultScale(item.label, item.logo || "")})` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
