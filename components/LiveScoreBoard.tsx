"use client";
import React from 'react';
import { Sword, Shield, Target, Zap, Trophy } from 'lucide-react';

const LiveScoreBoard = ({ match }: { match: any }) => {
  if (!match) return <div className="p-20 md:p-40 text-center font-brutal text-xl md:text-2xl opacity-20">BELUM ADA PERTANDINGAN LIVE</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="brutal-card live-stage">
        <div className="stage-header">
           <div className="live-tag"><div className="pulse-dot" /> SIARAN LANGSUNG</div>
           <div className="match-meta">SERI BO3 // GAME 2 // ARENA 01</div>
        </div>

        <div className="stage-body">
          <div className="competitor left">
             <div className="team-shield cyan-border">{match.team1?.[0]}</div>
             <div className="info">
                <h2 className="team-title">{match.team1}</h2>
                <div className="team-tag cyan">TIM BIRU</div>
             </div>
          </div>

          <div className="live-clock-score">
             <div className="score-row">
                <span className="digit cyan-text">{match.score1 ?? 0}</span>
                <div className="vs-panel">
                   <div className="vs-txt">VS</div>
                   <div className="timer-brutal">LIVE</div>
                </div>
                <span className="digit">{match.score2 ?? 0}</span>
             </div>
          </div>

          <div className="competitor right">
             <div className="team-shield purple-border">{match.team2?.[0]}</div>
             <div className="info">
                <h2 className="team-title">{match.team2}</h2>
                <div className="team-tag purple">TIM MERAH</div>
             </div>
          </div>
        </div>

        <div className="stats-brutal-bar">
           <BrutalStat icon={<Sword />} label="KILL" valA="28" valB="14" />
           <BrutalStat icon={<Shield />} label="TURRETS" valA="7" valB="3" />
           <BrutalStat icon={<Target />} label="LORD" valA="1" valB="0" />
           <BrutalStat icon={<Zap />} label="TURTLE" valA="2" valB="1" />
           <div className="stat-node gold-bg">
              <Trophy size={20} />
              <div className="lbl">KEUNGGULAN GOLD</div>
              <div className="val">+5.4k</div>
           </div>
        </div>
      </div>

      <style jsx>{`
        .live-stage { border-radius: 14px; border: var(--brutal-border); box-shadow: var(--brutal-shadow), var(--brutal-shadow-soft); overflow: hidden; }
        .stage-header { background: #000; color: white; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; }
        .live-tag { font-family: var(--font-heading); font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 10px; color: var(--accent-red); letter-spacing: 2px; }
        .pulse-dot { width: 8px; height: 8px; background: var(--accent-red); border-radius: 50%; box-shadow: 0 0 10px var(--accent-red); animation: pulse 1s infinite; }
        .match-meta { font-family: var(--font-heading); font-size: 9px; opacity: 0.5; letter-spacing: 1px; }
        .stage-body { padding: 80px 40px; display: flex; align-items: center; justify-content: space-between; gap: 40px; background: white; }
        .competitor { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .competitor.left { align-items: flex-end; text-align: right; }
        .competitor.right { align-items: flex-start; text-align: left; }
        .team-shield { width: 140px; height: 140px; background: white; border: var(--brutal-border); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 5rem; box-shadow: 4px 4px 0px #1f2937; }
        .cyan-border { background: rgba(0, 242, 255, 0.05); }
        .purple-border { background: rgba(168, 85, 247, 0.05); }
        .team-title { font-size: 3rem; font-weight: 900; font-family: var(--font-heading); line-height: 1; }
        .team-tag { font-family: var(--font-heading); font-size: 11px; font-weight: 800; margin-top: 4px; }
        .team-tag.cyan { color: var(--accent-blue); }
        .team-tag.purple { color: var(--accent-purple); }
        .live-clock-score { display: flex; flex-direction: column; align-items: center; }
        .score-row { display: flex; align-items: center; gap: 40px; }
        .digit { font-size: 8rem; font-family: var(--font-heading); font-weight: 900; }
        .cyan-text { color: var(--accent-blue); }
        .vs-panel { text-align: center; }
        .vs-txt { font-family: var(--font-heading); font-size: 2rem; font-weight: 900; opacity: 0.2; }
        .timer-brutal { background: #000; color: white; padding: 4px 16px; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; margin-top: 10px; }
        .stats-brutal-bar { display: flex; background: #000; }
        .stat-node { flex: 1; padding: 25px; text-align: center; border-right: 1px solid rgba(255, 255, 255, 0.1); color: white; }
        .stat-node.gold-bg { background: var(--accent-yellow); color: black; border-right: none; }
        .stat-node .lbl { font-family: var(--font-heading); font-size: 9px; margin: 10px 0 5px; font-weight: 800; opacity: 0.6; }
        .stat-node .val { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; }
        @media (max-width: 1024px) {
          .stage-body { flex-direction: column; padding: 40px 20px; }
          .competitor { align-items: center !important; text-align: center !important; }
          .digit { font-size: 5rem; }
          .stats-brutal-bar { flex-wrap: wrap; }
          .stat-node { flex: 0 0 50%; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        }
        @media (max-width: 640px) {
          .stage-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 12px 16px;
          }
          .score-row { gap: 16px; }
          .digit { font-size: 3rem; }
          .team-shield { width: 96px; height: 96px; font-size: 3rem; }
          .team-title { font-size: 2rem; }
          .vs-txt { font-size: 1.2rem; }
          .timer-brutal { font-size: 1rem; }
          .stat-node { flex: 0 0 100%; }
        }
      `}</style>
    </div>
  );
};

const BrutalStat = ({ icon, label, valA, valB }: { icon: any; label: string; valA: string; valB: string }) => (
  <div className="stat-node">
    {icon}
    <div className="lbl">{label}</div>
    <div className="val"><span style={{ color: 'var(--accent-cyan)' }}>{valA}</span> <span style={{ opacity: 0.2 }}>/</span> {valB}</div>
  </div>
);

export default LiveScoreBoard;
