import React from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";

type SiteFrameProps = {
  activeTab: "dashboard" | "teams" | "matches" | "groups" | "roundrobin" | "champion";
  selectedDate?: number;
  onDateChange?: (day: number) => void;
  children: React.ReactNode;
};

export default function SiteFrame({
  activeTab,
  selectedDate = 8,
  onDateChange,
  children,
}: SiteFrameProps) {
  const optimizeImageKit = (url: string, width: number) =>
    `${url}${url.includes("?") ? "&" : "?"}tr=w-${width},h-${width},fo-auto,f-webp,q-75`;

  const sponsors = [
    { name: "Prima Karya", logo: "https://ik.imagekit.io/7xrur26qt/PRIMA%20KARYA.png" },
    { name: "PAI", logo: "https://ik.imagekit.io/7xrur26qt/pai.png" },
    { name: "RMB", logo: "https://ik.imagekit.io/7xrur26qt/rmb.png" },
  ];

  return (
    <div className="page-root">
      <div className="dashboard-wrapper">
        <div className="brutal-grid" />

        <Navbar
          activeTab={activeTab}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />

        <main className="main-viewport">
          <div className="tab-content-wrapper">{children}</div>
        </main>

        <section className="spx">
          <div className="spx-inner">
            <p className="spx-label">Sponsorship By</p>
            <div className="spx-grid">
              {sponsors.map((s) => (
                <Image
                  key={s.name}
                  className="spx-logo"
                  src={optimizeImageKit(s.logo, 220)}
                  alt={s.name}
                  title={s.name}
                  width={220}
                  height={72}
                  sizes="(max-width: 900px) 33vw, 220px"
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="ft ft-min">
          <div className="ft-min-inner">
            <span className="ft-min-brand">THE ROCK CAFE</span>
            <span className="ft-min-sep">•</span>
            <span className="ft-min-copy">© 2026</span>
            <a
              href="https://www.instagram.com/therockcafe_krmb/"
              target="_blank"
              rel="noopener noreferrer"
              className="ft-min-link"
            >
              Instagram
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
