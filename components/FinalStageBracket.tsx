"use client";
import Image from "next/image";

function optimizeBracketSrc(url: string) {
  const clean = String(url || "").trim();
  if (!clean) return "/bracket.png";
  if (clean.includes("ik.imagekit.io")) {
    return `${clean}${clean.includes("?") ? "&" : "?"}tr=w-1400,h-1400,fo-auto,f-webp,q-78`;
  }
  return clean;
}

export default function FinalStageBracket({ imageUrl }: { matches?: any[]; imageUrl?: string }) {
  const src = optimizeBracketSrc(String(imageUrl || ""));
  return (
    <section className="fb-wrap">
      <div className="teams-head">
        <h2 className="teams-title">Final Stage</h2>
      </div>
      <div className="fb-image-only">
        <Image
          src={src}
          alt="Final Stage Bracket"
          width={1400}
          height={1400}
          sizes="(max-width: 900px) 94vw, 1100px"
          priority
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
