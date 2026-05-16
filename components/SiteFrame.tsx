import React from "react";
import Navbar from "@/components/Navbar";

type SiteFrameProps = {
  activeTab: "dashboard" | "teams" | "matches" | "groups" | "roundrobin";
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
