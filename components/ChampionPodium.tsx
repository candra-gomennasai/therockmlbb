"use client";
import React from "react";
import Image from "next/image";
type Item = { id?: string; team?: string; logo?: string; points?: number; won?: number };

export default function ChampionPodium({ teams, imageUrl }: { teams: Item[]; imageUrl?: string }) {
  const img = String(imageUrl || "").trim();
  const optimizedImg =
    img && img.includes("ik.imagekit.io")
      ? `${img}${img.includes("?") ? "&" : "?"}tr=w-1400,h-1400,fo-auto,f-webp,q-78`
      : img;
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
      <Image src={optimizedImg} alt="Champion" width={1400} height={1400} sizes="(max-width: 860px) 96vw, 1120px" />
      <style jsx>{`
        .ch-image { max-width: 1120px; margin: 0 auto; padding: 76px 24px 90px; }
        .ch-image :global(img) { width: 100%; height: auto; display: block; border-radius: 12px; border: 1px solid rgba(0,0,0,.08); }
        @media (max-width: 860px) { .ch-image { padding: 56px 12px 70px; } }
      `}</style>
    </section>
  );
}
