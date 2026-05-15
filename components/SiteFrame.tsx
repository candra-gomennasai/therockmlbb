import React from "react";
import Navbar from "@/components/Navbar";

type SiteFrameProps = {
  activeTab: "dashboard" | "matches" | "groups" | "roundrobin";
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

        <footer className="ft">
          <div className="ft-rule" />
          <div className="ft-body">
            <div className="ft-brand">
              <div className="ft-wordmark">
                <span className="ft-wm-rock">THE ROCK</span>
                <span className="ft-wm-cafe">CAFE</span>
              </div>
              <p className="ft-tagline">
                Turnamen komunitas Mobile Legends: Bang Bang.
                <br />
                Kompetitif, seru, dan terbuka untuk semua.
              </p>
              <span className="ft-status">
                <span className="ft-status-dot" />
                Season 2026 sedang berjalan
              </span>
            </div>

            <div className="ft-col">
              <span className="ft-col-head">Ikuti Kami</span>
              <div className="ft-social-grid">
                <a
                  href="https://www.instagram.com/therockcafe_krmb/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-social-btn"
                  title="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="ft-map-wrap">
              <div className="ft-map-card">
                <iframe
                  src="https://www.google.com/maps?q=-2.584444,112.513861&z=19&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="The Rock Cafe Location"
                />
              </div>
              <div className="ft-map-label">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  width="12"
                  height="12"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  Jl Jendral Sudirman KM 62, Sampit - Pangkalanbun, PT Mustika
                  Sembuluh 1
                </span>
              </div>
            </div>
          </div>

          <div className="ft-bottom">
            <div className="ft-bottom-inner">
              <span className="ft-copy">
                (c) 2026 The Rock Cafe · Regional Office Cafe &amp; Koperasi
              </span>
              <div className="ft-bottom-badges">
                <span className="ft-badge">MLBB</span>
                <span className="ft-badge">ESPORTS</span>
                <span className="ft-badge ft-badge-live">LIVE</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
