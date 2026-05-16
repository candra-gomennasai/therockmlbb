"use client";
import React from 'react';
import { Trophy } from 'lucide-react';

const BracketView = ({ matches }: { matches: any[] }) => {
  // Organizing data for the Neo-Brutalist bracket
  const getMatch = (round: string) => {
    return matches.find(m => m.round?.toUpperCase().includes(round.toUpperCase())) || {
      team1: 'TBD',
      team2: 'TBD',
      score1: '0',
      score2: '0',
      status: 'UPCOMING'
    };
  };

  const qf1 = getMatch('QUARTER FINAL');
  const sf1 = getMatch('SEMI FINAL');
  const gf = getMatch('GRAND FINAL');

  return (
    <div className="px-4 md:px-6 py-16 md:py-32 overflow-x-auto">
      <div className="flex items-start justify-center gap-20 min-w-[1200px]">
        {/* Quarter Finals */}
        <div className="bracket-col">
          <div className="col-header">PEREMPAT FINAL</div>
          <div className="match-stack">
            <BrutalMatchNode 
              teamA={qf1.team1} 
              teamB={qf1.team2} 
              scoreA={qf1.score1} 
              scoreB={qf1.score2} 
              winner={qf1.score1 > qf1.score2 ? 'A' : qf1.score2 > qf1.score1 ? 'B' : undefined} 
            />
          </div>
        </div>

        {/* Semi Finals */}
        <div className="bracket-col pt-20">
          <div className="col-header">SEMIFINAL</div>
          <div className="match-stack">
            <BrutalMatchNode 
              teamA={sf1.team1} 
              teamB={sf1.team2} 
              scoreA={sf1.score1} 
              scoreB={sf1.score2} 
              winner={sf1.score1 > sf1.score2 ? 'A' : sf1.score2 > sf1.score1 ? 'B' : undefined} 
            />
          </div>
        </div>

        {/* Grand Final */}
        <div className="bracket-col pt-40">
          <div className="col-header yellow">GRAND FINAL</div>
          <div className="brutal-card final-node p-12">
             <div className="final-info">MATCH #{gf.id?.slice(-2).toUpperCase() || '??'} // BO5 // PENENTUAN JUARA</div>
             <div className="final-teams">
                <div className="tm">
                   <div className="ico">A</div>
                   <div className="nm">{gf.team1}</div>
                </div>
                <div className="vs-circle">VS</div>
                <div className="tm">
                   <div className="ico">B</div>
                   <div className="nm">{gf.team2}</div>
                </div>
             </div>
             <div className="winner-claim">
                <Trophy size={48} />
                <div className="font-brutal text-2xl mt-4">JUARA THE ROCK CAFE</div>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bracket-col { flex: 0 0 300px; }
        .col-header { 
          background: #000; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 999px; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          font-size: 10px; 
          font-weight: 800; 
          text-align: center; 
          margin-bottom: 40px; 
          box-shadow: 3px 3px 0px rgba(31,41,55,0.9); 
        }
        .col-header.yellow { background: #fbbf24; color: black; box-shadow: 3px 3px 0px #000; }
        .match-stack { display: flex; flex-direction: column; gap: 60px; }
        .final-node { 
          background: #fff;
          border: 4px solid #000; 
          box-shadow: 12px 12px 0px #000; 
          transform: scale(1.05); 
          padding: 48px;
          border-radius: 4px;
        }
        .final-info { text-align: center; font-size: 9px; font-weight: 800; opacity: 0.5; margin-bottom: 32px; }
        .final-teams { display: flex; align-items: center; justify-content: center; gap: 40px; }
        .tm { text-align: center; }
        .tm .ico { font-size: 3rem; margin-bottom: 12px; font-weight: 900; }
        .tm .nm { font-weight: 900; font-size: 14px; }
        .vs-circle { width: 60px; height: 60px; background: #000; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 900; font-size: 1.25rem; }
        .winner-claim { margin-top: 48px; border-top: 2px solid #000; padding-top: 48px; text-align: center; }
        
        .brutal-card { background: #fff; border: 4px solid #000; box-shadow: 8px 8px 0px #000; border-radius: 4px; }
        
        @media (max-width: 640px) {
          .bracket-col { flex: 0 0 260px; }
          .match-stack { gap: 30px; }
          .final-node { transform: none; padding: 24px; }
          .final-teams { gap: 18px; }
          .vs-circle { width: 44px; height: 44px; font-size: 0.9rem; }
          .winner-claim { margin-top: 24px; padding-top: 24px; }
        }
      `}</style>
    </div>
  );
};

const BrutalMatchNode = ({ teamA, teamB, scoreA, scoreB, winner }: { teamA: string; teamB: string; scoreA: string; scoreB: string; winner?: string }) => (
  <div className="brutal-card node-box">
    <div className={`row ${winner === 'A' ? 'winner-row' : ''}`}>
      <span className="name">{teamA}</span>
      <span className="pts">{scoreA}</span>
    </div>
    <div className={`row ${winner === 'B' ? 'winner-row' : ''}`}>
      <span className="name">{teamB}</span>
      <span className="pts">{scoreB}</span>
    </div>
    <style jsx>{`
      .node-box { border-radius: 4px; overflow: hidden; border-width: 4px; }
      .row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; font-weight: 800; font-size: 11px; border-bottom: 2px solid #000; }
      .row:last-child { border-bottom: none; }
      .row.winner-row { background: #fbbf24; }
      .pts { font-size: 1.25rem; font-weight: 900; }
      .brutal-card { background: #fff; border: 4px solid #000; box-shadow: 8px 8px 0px #000; }
    `}</style>
  </div>
);

export default BracketView;
