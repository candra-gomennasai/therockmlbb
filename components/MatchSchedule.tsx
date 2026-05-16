"use client";
import React from 'react';

const TEAM_LOGOS: Record<string, string> = {
  AE: "https://ik.imagekit.io/7xrur26qt/ae-256.png",
  BTR: "https://ik.imagekit.io/7xrur26qt/btr_vit.png",
  DEWA: "https://ik.imagekit.io/7xrur26qt/dewa-united-500.png",
  EVOS: "https://ik.imagekit.io/7xrur26qt/evos-500.png",
  GEEK: "https://ik.imagekit.io/7xrur26qt/geek-500.png",
  NAVI: "https://ik.imagekit.io/7xrur26qt/NAVI-2.png",
  ONIC: "https://ik.imagekit.io/7xrur26qt/onic-b-256.png",
  RRQ: "https://ik.imagekit.io/7xrur26qt/rrq-500.png",
  TLID: "https://ik.imagekit.io/7xrur26qt/TLID-Primary500x500.png",
};

function getTeamLogo(teamName: string) {
  const raw = (teamName || "").toUpperCase().trim();
  const compact = raw.replace(/\s+/g, "");
  if (compact.includes("AE")) return TEAM_LOGOS.AE;
  if (compact.includes("BTR") || compact.includes("VIT")) return TEAM_LOGOS.BTR;
  if (compact.includes("DEWA")) return TEAM_LOGOS.DEWA;
  if (compact.includes("EVOS")) return TEAM_LOGOS.EVOS;
  if (compact.includes("GEEK")) return TEAM_LOGOS.GEEK;
  if (compact.includes("NAVI")) return TEAM_LOGOS.NAVI;
  if (compact.includes("ONIC")) return TEAM_LOGOS.ONIC;
  if (compact.includes("RRQ")) return TEAM_LOGOS.RRQ;
  if (compact.includes("TLID") || compact.includes("LIQUID")) return TEAM_LOGOS.TLID;
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(teamName || "team")}`;
}

const MatchCard = ({ match, showDateTime = true }: { match: any; showDateTime?: boolean }) => {
  const isFinished = match.status === 'FINISHED';
  
  const scheduleDates = [
    'Jumat, 08 Mei 2026', 'Sabtu, 09 Mei 2026',
    'Jumat, 15 Mei 2026', 'Sabtu, 16 Mei 2026',
    'Jumat, 22 Mei 2026', 'Sabtu, 23 Mei 2026',
    'Jumat, 29 Mei 2026', 'Sabtu, 30 Mei 2026'
  ];
  const slotTime = ['13:00', '15:00', '17:00', '19:00'];
  
  const matchIndex = String(match.time || '').match(/MATCH\s*(\d+)/i)?.[1];
  const ordinal = matchIndex ? Number(matchIndex) - 1 : 0;
  
  // Use match.time if it's a simple time string, otherwise fallback to slot
  const displayTime = (match.time && match.time.includes(':')) ? match.time : (slotTime[ordinal % 4] || '13:00');
  
  // Use match.day if available
  const dayIndex = DATES.indexOf(match.day);
  const displayDate = dayIndex !== -1 ? scheduleDates[dayIndex] : (scheduleDates[Math.floor(ordinal / 4) % scheduleDates.length] || 'Jumat, 08 Mei 2026');

  return (
    <div className={`ms-card ${isFinished ? 'ms-card-finished' : ''}`}>
      <div className="ms-card-head">
        <div className="ms-tags-row">
          {match.phase && <span className="ms-tag ms-tag-phase">{match.phase}</span>}
          <span className="ms-tag">{match.date || 'ROUND 1'}</span>
        </div>
        <span className="ms-time-tag">{displayTime} WIB</span>
      </div>

      <div className="ms-card-body">
        {isFinished && <div className="ms-stamp-bg finished">FINISHED</div>}

        <div className="ms-team-box" style={{ position: 'relative', zIndex: 2 }}>
          <div className="ms-team-logo-gem">
             <img src={getTeamLogo(match.team1)} alt={match.team1 || "team 1"} />
          </div>
          <span className="ms-team-name">{match.team1}</span>
        </div>

        <div className="ms-score-box" style={{ position: 'relative', zIndex: 2 }}>
          <div className="ms-digits">
            <span className={match.score1 > match.score2 ? 'ms-win' : ''}>{match.score1 ?? 0}</span>
            <span className="ms-dash">:</span>
            <span className={match.score2 > match.score1 ? 'ms-win' : ''}>{match.score2 ?? 0}</span>
          </div>
          <span className="ms-format">{match.format || 'BO1'}</span>
        </div>

        <div className="ms-team-box" style={{ position: 'relative', zIndex: 2 }}>
          <div className="ms-team-logo-gem">
             <img src={getTeamLogo(match.team2)} alt={match.team2 || "team 2"} />
          </div>
          <span className="ms-team-name">{match.team2}</span>
        </div>
      </div>

      {showDateTime && (
        <div className="ms-card-foot">
           <span className="ms-date-val">{displayDate}</span>
        </div>
      )}

      <style jsx>{`
        .ms-tags-row { display: flex; gap: 8px; }
        .ms-tag-phase { background: #000 !important; color: #fff !important; }
        .ms-stamp-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-12deg);
          z-index: 1;
          font-family: var(--font-heading);
          font-weight: 950;
          font-size: 3.5rem;
          padding: 10px 40px;
          border: 8px solid;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          pointer-events: none;
          white-space: nowrap;
          line-height: 1;
          opacity: 0.12;
        }
        .ms-stamp-bg.finished { color: #dc2626; border-color: #dc2626; }
        .ms-team-name, .ms-digits { text-shadow: 0 0 10px #fff, 0 0 5px #fff; }
      `}</style>
    </div>
  );
};

const DATES = [8, 9, 15, 16, 22, 23, 29, 30];

const MatchSchedule = ({ matches, title = 'JADWAL', showDateTime = true }: { matches: any[]; title?: string; showDateTime?: boolean; }) => {
  return (
    <section className="ms-section">
      <div className="ms-header">
        <span className="ms-eyebrow">◆ MATCH SCHEDULE</span>
        <div className="ms-title-row">
          <h2 className="ms-title">{title}</h2>
          <div className="ms-title-line" />
        </div>
      </div>
      <div className="ms-grid">
        {matches.map(m => <MatchCard key={m.id} match={m} showDateTime={showDateTime} />)}
        {matches.length === 0 && <div className="ms-empty">No matches scheduled.</div>}
      </div>
      <style jsx>{`
        .ms-empty { grid-column: 1 / -1; text-align: center; padding: 60px; color: #94a3b8; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.1em; }
      `}</style>
    </section>
  );
};

export default MatchSchedule;
