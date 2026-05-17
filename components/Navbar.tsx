"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NAV = [
  { id: "dashboard", label: "Beranda", href: "/" },
  { id: "teams", label: "Tim", href: "/teams" },
  { id: "matches", label: "Pertandingan", href: "/matches" },
  { id: "groups", label: "Klasemen Grup Stage", href: "/groupstage" },
  { id: "roundrobin", label: "Final Stage", href: "/finalstage" },
  { id: "champion", label: "Juara", href: "/champion" },
] as const;

const BrandLogo = () => {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <circle cx="21" cy="21" r="20" fill="none" stroke="url(#fb)" strokeWidth="1.5" />
        <text x="21" y="16" textAnchor="middle" fill="#fde68a" style={{ fontSize: "7px", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "0.08em" }}>THE</text>
        <text x="21" y="27" textAnchor="middle" fill="#f1f5f9" style={{ fontSize: "11px", fontWeight: 900, fontFamily: "sans-serif", letterSpacing: "-0.01em" }}>ROCK</text>
        <defs>
          <linearGradient id="fb" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
        </defs>
      </svg>
    );
  }
  return (
    <Image
      src="/logo.png"
      alt="The Rock Cafe"
      width={46}
      height={46}
      sizes="46px"
      onError={() => setErr(true)}
      className="brand-logo-img"
    />
  );
};

export default function Navbar({
  activeTab,
  selectedDate = 8,
  onDateChange,
}: {
  activeTab: string;
  selectedDate?: number;
  onDateChange?: (day: number) => void;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mob, setMob] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [mobDateOpen, setMobDateOpen] = useState(false);
  const [line, setLine] = useState({ left: 0, width: 0 });
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const dates = [8, 9, 15, 16, 22, 23, 29, 30];
  const getDayName = (day: number) => ({ 8: "JUMAT", 9: "SABTU", 15: "JUMAT", 16: "SABTU", 22: "JUMAT", 23: "SABTU", 29: "JUMAT", 30: "SABTU" }[day] || "");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const el = refs.current[activeTab];
    if (!el) return;
    const par = el.closest(".nav-rail") as HTMLElement | null;
    if (!par) return;
    const pr = par.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    setLine({ left: er.left - pr.left, width: er.width });
  }, [activeTab]);

  const gotoRoute = (id: string, href: string) => {
    if (id === "matches") {
      router.push(`/matches?date=${selectedDate}`);
      return;
    }
    router.push(href);
  };

  return (
    <header className={`hdr ${scrolled ? "hdr-solid" : ""}`}>
      <span className="hdr-shimmer" />
      <div className="hdr-row">
        <button className="brand" onClick={() => router.push("/")}>
          <span className="brand-gem"><BrandLogo /></span>
          <span className="brand-copy">
            <span className="brand-name">The Rock Cafe</span>
            <span className="brand-sub">MLBB TOURNAMENT</span>
          </span>
        </button>

        <nav className="nav-rail" aria-label="Main navigation">
          <span className="nav-underline" style={{ left: line.left, width: line.width }} />
          {NAV.map((item) => {
            const isMatches = item.id === "matches";
            const isAct = activeTab === item.id;
            return (
              <div key={item.id} className="nav-item-wrap">
                <button
                  ref={(el) => { refs.current[item.id] = el; }}
                  onClick={() => {
                    if (isMatches) {
                      if (isAct) setDateOpen(!dateOpen);
                      else { gotoRoute(item.id, item.href); setDateOpen(true); }
                    } else { gotoRoute(item.id, item.href); setDateOpen(false); }
                  }}
                  className={`nav-btn ${isAct ? "nav-btn-on" : ""}`}
                >
                  <span className="nav-btn-text">{item.label}</span>
                  {isMatches && (
                    <svg className={`nav-chevron ${dateOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>

                {isMatches && dateOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-grid">
                      {dates.map((d) => (
                        <button
                          key={d}
                          className={`nav-drop-item ${selectedDate === d ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDateChange?.(d);
                            router.push(`/matches?date=${d}`);
                            setDateOpen(false);
                          }}
                        >
                          <span className="nav-drop-day">{d < 10 ? `0${d}` : d}</span>
                          <span className="nav-drop-name">{getDayName(d)} MEI</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hdr-right">
          <span className="season-tag"><span className="season-gem">•</span>Season 2026</span>
          <button className={`burger ${mob ? "burger-open" : ""}`} onClick={() => setMob((o) => !o)} aria-label="Toggle menu"><span /><span /><span /></button>
        </div>
      </div>

      <span className="hdr-sep" />

      <div className={`mob-drawer ${mob ? "mob-open" : ""}`}>
        {NAV.map((item, i) => {
          const isMatches = item.id === "matches";
          const isSelected = activeTab === item.id;
          return (
            <React.Fragment key={item.id}>
              <div className="mob-row-wrap">
                <button
                  onClick={() => {
                    if (isMatches) {
                      if (!isSelected) gotoRoute(item.id, item.href);
                      setMobDateOpen(!mobDateOpen);
                    } else {
                      gotoRoute(item.id, item.href);
                      setMobDateOpen(false);
                      setMob(false);
                    }
                  }}
                  className={`mob-row ${isSelected ? "mob-row-on" : ""}`}
                  style={{ transitionDelay: mob ? `${i * 45}ms` : "0ms" }}
                >
                  <span className="mob-num">0{i + 1}</span>
                  <span className="mob-label">{item.label}</span>
                  {isMatches && (
                    <svg className={`mob-chevron ${mobDateOpen ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                  {isSelected && <span className="mob-accent-bar" />}
                </button>

                {isMatches && mobDateOpen && (
                  <div className="mob-dates">
                    <div className="mob-dates-label">PILIH TANGGAL:</div>
                    <div className="mob-dates-grid">
                      {dates.map((d) => (
                        <button
                          key={d}
                          className={`mob-date-btn ${selectedDate === d ? "active" : ""}`}
                          onClick={() => {
                            onDateChange?.(d);
                            router.push(`/matches?date=${d}`);
                            setMob(false);
                          }}
                        >
                          <span className="mob-date-day">{d < 10 ? `0${d}` : d}</span>
                          <span className="mob-date-name">{getDayName(d).slice(0, 3)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
}
