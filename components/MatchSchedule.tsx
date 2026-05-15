"use client";
import React from 'react';

/* ─────────────────────────────────────────────
   SUB-COMPONENT: MATCH CARD (PREMIUM)
───────────────────────────────────────────── */
const MatchCard = ({ match, showDateTime = true }: { match: any; showDateTime?: boolean }) => {
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  
  const scheduleDates = [
    'Jumat, 08 Mei 2026', 'Sabtu, 09 Mei 2026',
    'Jumat, 15 Mei 2026', 'Sabtu, 16 Mei 2026',
    'Jumat, 22 Mei 2026', 'Sabtu, 23 Mei 2026',
    'Jumat, 29 Mei 2026', 'Sabtu, 30 Mei 2026'
  ];
  const slotTime = ['13:00', '15:00', '17:00', '19:00'];
  
  const rawDate = typeof match.date === 'string' ? match.date.toUpperCase() : '';
  const roundNum = rawDate.match(/^R(\d+)$/)?.[1];
  const roundLabel = roundNum ? `ROUND ${roundNum}` : match.date;
  
  const matchIndex = String(match.time || '').match(/MATCH\s*(\d+)/i)?.[1];
  const ordinal = matchIndex ? Number(matchIndex) - 1 : 0;
  
  const displayTime = slotTime[ordinal % 4] || '13:00';
  const displayDate = scheduleDates[Math.floor(ordinal / 4) % scheduleDates.length] || 'Jumat, 08 Mei 2026';

  return (
    <div className={`ms-card ${isLive ? 'ms-card-live' : ''}`}>
      {/* header strip */}

      {/* header strip */}
      <div className="ms-card-head">
        <span className="ms-tag">{roundLabel}</span>
        {isLive ? (
          <div className="ms-live-indicator">
            <span className="ms-live-dot" />
            <span>LIVE NOW</span>
          </div>
        ) : (
          <span className="ms-time-tag">{displayTime} WIB</span>
        )}
      </div>

      {/* main vs area */}
      <div className="ms-card-body">
        <div className="ms-team-box">
          <div className="ms-team-logo-gem">
             <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamA}`} alt="" />
          </div>
          <span className="ms-team-name">{match.teamA}</span>
        </div>

        <div className="ms-score-box">
          <div className="ms-digits">
            <span className={match.scoreA > match.scoreB ? 'ms-win' : ''}>{match.scoreA ?? 0}</span>
            <span className="ms-dash">:</span>
            <span className={match.scoreB > match.scoreA ? 'ms-win' : ''}>{match.scoreB ?? 0}</span>
          </div>
          <span className="ms-format">{match.format}</span>
        </div>

        <div className="ms-team-box">
          <div className="ms-team-logo-gem">
             <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${match.teamB}`} alt="" />
          </div>
          <span className="ms-team-name">{match.teamB}</span>
        </div>
      </div>

      {/* footer date */}
      {showDateTime && (
        <div className="ms-card-foot">
          <div className="ms-date-wrap">
            <span className="ms-date-val">{displayDate}</span>
          </div>
        </div>
      )}

      {/* decorative glow */}
      <div className="ms-card-glow" />

    </div>
  );
};

const MatchSchedule = ({ 
  matches, 
  title = 'JADWAL PERTANDINGAN', 
  showDateTime = true,
  selectedDate,
  onDateChange
}: { 
  matches: any[]; 
  title?: string; 
  showDateTime?: boolean;
  selectedDate?: number;
  onDateChange?: (date: number) => void;
}) => {
  const isCompact = !showDateTime;
  return (
    <section className={`ms-section ${isCompact ? 'ms-compact' : ''}`}>
      {/* header */}
      <div className="ms-header">
        <div className="ms-head-left">
          <span className="ms-eyebrow">◆ Schedule</span>
          <div className="ms-title-row">
            <h2 className="ms-title">{title}</h2>
            <div className="ms-title-line" />
          </div>
        </div>

      </div>

      {/* matches grid */}
      <div className="ms-grid">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} showDateTime={showDateTime} />
        ))}
      </div>

    </section>
  );
};

export default MatchSchedule;
