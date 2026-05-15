"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [finalMatches, setFinalMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('matches');
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/manage-trc');
      else setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    
    const unsubMatches = onSnapshot(query(collection(db, 'matches'), orderBy('time', 'asc')), (snap) => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubStandings = onSnapshot(query(collection(db, 'standings'), orderBy('points', 'desc')), (snap) => {
      setStandings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubFinal = onSnapshot(query(collection(db, 'finalMatches'), orderBy('time', 'asc')), (snap) => {
      setFinalMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubMatches(); unsubStandings(); unsubFinal(); };
  }, [user]);

  const updateDocField = async (col: string, id: string, field: string, value: any) => {
    try {
      const ref = doc(db, col, id);
      await updateDoc(ref, { [field]: value });
    } catch (e) {
      console.error("Update failed:", e);
    }
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="loader-ring" />
      <style jsx>{`
        .dash-loading { height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; }
        .loader-ring { width: 40px; height: 40px; border: 2px solid #f1f5f9; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div className="admin-root">
      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-dot" />
          <span>TRC SYSTEM</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'matches', label: 'JADWAL & SKOR', icon: 'M' },
            { id: 'standings', label: 'KLASEMEN', icon: 'K' },
            { id: 'final', label: 'FINAL STAGE', icon: 'F' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {activeTab === tab.id && <div className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-meta">
            <span className="user-email">{user?.email}</span>
            <button className="logout-btn" onClick={() => signOut(auth)}>Log Out</button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="admin-main">
        <header className="main-header">
          <div className="header-title">
            <h1>{activeTab.toUpperCase()} CONTROL</h1>
            <div className="sync-status">
              <span className="pulse-dot" />
              REAL-TIME SYNC
            </div>
          </div>
          <div className="quick-stats">
            <div className="stat-chip"><span>Matches</span><strong>{matches.length}</strong></div>
            <div className="stat-chip"><span>Standings</span><strong>{standings.length}</strong></div>
            <div className="stat-chip"><span>Final</span><strong>{finalMatches.length}</strong></div>
          </div>
        </header>

        <div className="main-scroll">
          <section className="content-shell">
          {activeTab === 'matches' && (
            <div className="match-manager">
              <div className="match-list">
                {matches.map(m => (
                  <div key={m.id} className="modern-card">
                    <div className="card-top">
                      <span className="card-tag">{m.time}</span>
                      <select 
                        className={`status-pill ${m.status.toLowerCase()}`}
                        value={m.status}
                        onChange={(e) => updateDocField('matches', m.id, 'status', e.target.value)}
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="LIVE">LIVE</option>
                        <option value="FINISHED">FINISHED</option>
                      </select>
                    </div>

                    <div className="card-teams">
                      <div className="team-row">
                        <input 
                          className="minimal-input"
                          value={m.team1}
                          onChange={(e) => updateDocField('matches', m.id, 'team1', e.target.value)}
                        />
                        <div className="score-widget">
                          <button onClick={() => updateDocField('matches', m.id, 'score1', Math.max(0, m.score1 - 1))}>-</button>
                          <span className="score-val">{m.score1}</span>
                          <button onClick={() => updateDocField('matches', m.id, 'score1', m.score1 + 1)}>+</button>
                        </div>
                      </div>
                      <div className="row-divider" />
                      <div className="team-row">
                        <input 
                          className="minimal-input"
                          value={m.team2}
                          onChange={(e) => updateDocField('matches', m.id, 'team2', e.target.value)}
                        />
                        <div className="score-widget">
                          <button onClick={() => updateDocField('matches', m.id, 'score2', Math.max(0, m.score2 - 1))}>-</button>
                          <span className="score-val">{m.score2}</span>
                          <button onClick={() => updateDocField('matches', m.id, 'score2', m.score2 + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="null-state">
                    <h3>Belum ada data pertandingan</h3>
                    <p>Tambahkan data di Firestore collection <code>matches</code> untuk mulai mengelola skor.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="standings-manager">
              <div className="table-container">
                <table className="minimal-table">
                  <thead>
                    <tr>
                      <th>TIM</th>
                      <th>M</th>
                      <th>W</th>
                      <th>L</th>
                      <th>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map(s => (
                      <tr key={s.id}>
                        <td>
                          <input 
                            className="cell-input team"
                            value={s.team}
                            onChange={(e) => updateDocField('standings', s.id, 'team', e.target.value)}
                          />
                        </td>
                        <td><input type="number" className="cell-input" value={s.played} onChange={(e) => updateDocField('standings', s.id, 'played', parseInt(e.target.value) || 0)} /></td>
                        <td><input type="number" className="cell-input" value={s.won} onChange={(e) => updateDocField('standings', s.id, 'won', parseInt(e.target.value) || 0)} /></td>
                        <td><input type="number" className="cell-input" value={s.lost} onChange={(e) => updateDocField('standings', s.id, 'lost', parseInt(e.target.value) || 0)} /></td>
                        <td><input type="number" className="cell-input pts" value={s.points} onChange={(e) => updateDocField('standings', s.id, 'points', parseInt(e.target.value) || 0)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'final' && (
            <div className="final-manager">
               <div className="match-list">
                {finalMatches.map(f => (
                  <div key={f.id} className="modern-card final">
                    <div className="card-top">
                      <input 
                        className="minimal-tag-input"
                        value={f.round}
                        onChange={(e) => updateDocField('finalMatches', f.id, 'round', e.target.value)}
                      />
                      <span className="card-tag">{f.time}</span>
                    </div>

                    <div className="card-teams">
                      <div className="team-row">
                        <input 
                          className="minimal-input"
                          value={f.team1}
                          onChange={(e) => updateDocField('finalMatches', f.id, 'team1', e.target.value)}
                        />
                        <div className="score-widget">
                          <button onClick={() => updateDocField('finalMatches', f.id, 'score1', Math.max(0, f.score1 - 1))}>-</button>
                          <span className="score-val">{f.score1}</span>
                          <button onClick={() => updateDocField('finalMatches', f.id, 'score1', f.score1 + 1)}>+</button>
                        </div>
                      </div>
                      <div className="row-divider" />
                      <div className="team-row">
                        <input 
                          className="minimal-input"
                          value={f.team2}
                          onChange={(e) => updateDocField('finalMatches', f.id, 'team2', e.target.value)}
                        />
                        <div className="score-widget">
                          <button onClick={() => updateDocField('finalMatches', f.id, 'score2', Math.max(0, f.score2 - 1))}>-</button>
                          <span className="score-val">{f.score2}</span>
                          <button onClick={() => updateDocField('finalMatches', f.id, 'score2', f.score2 + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </section>
        </div>
      </main>

      <style jsx>{`
        .admin-root {
          display: flex;
          height: 100vh;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #1e293b;
          overflow: hidden;
        }

        /* ── SIDEBAR ── */
        .admin-sidebar {
          width: 260px;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          padding: 40px 24px;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          font-size: 0.8rem;
          letter-spacing: 0.15em;
          margin-bottom: 60px;
        }
        .brand-dot { width: 8px; height: 8px; background: #2563eb; border-radius: 2px; }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .nav-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border: none;
          background: none;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
          text-align: left;
        }
        .nav-btn:hover { color: #1e293b; background: #f8fafc; }
        .nav-btn.active { color: #2563eb; background: rgba(37, 99, 235, 0.04); }
        .nav-indicator {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 3px; height: 16px; background: #2563eb; border-radius: 0 4px 4px 0;
        }
        .nav-icon { width: 24px; font-family: monospace; font-size: 0.9rem; opacity: 0.5; }

        .sidebar-user { border-top: 1px solid #f1f5f9; padding-top: 24px; }
        .user-meta { display: flex; flex-direction: column; gap: 4px; }
        .user-email { font-size: 0.7rem; font-weight: 700; color: #64748b; word-break: break-all; }
        .logout-btn { 
          background: none; border: none; padding: 0; color: #ef4444; 
          font-size: 0.7rem; font-weight: 800; cursor: pointer; text-align: left;
          width: fit-content;
        }

        /* ── MAIN CONTENT ── */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.04) 0%, transparent 30%),
            #f8fafc;
        }
        .main-header { padding: 34px 40px 22px; display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; }
        .header-title h1 { font-size: 1.4rem; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.01em; }
        .sync-status { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: #16a34a; opacity: 0.8; }
        .pulse-dot { width: 6px; height: 6px; background: #16a34a; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .quick-stats { display: flex; gap: 10px; flex-wrap: wrap; }
        .stat-chip {
          min-width: 96px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
        }
        .stat-chip span { font-size: 0.62rem; font-weight: 700; color: #64748b; }
        .stat-chip strong { font-size: 1rem; line-height: 1.1; color: #0f172a; }

        .main-scroll { flex: 1; padding: 0 40px 36px; overflow-y: auto; }
        .content-shell {
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.04);
        }

        /* ── CARDS ── */
        .match-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
        .modern-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(15, 23, 42, 0.04);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .modern-card:hover { transform: translateY(-2px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.05); }

        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-tag { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.05em; }
        .status-pill {
          appearance: none; border: none; border-radius: 8px; padding: 6px 12px;
          font-size: 10px; font-weight: 800; cursor: pointer; outline: none;
        }
        .status-pill.upcoming { background: #f1f5f9; color: #64748b; }
        .status-pill.live { background: #fef2f2; color: #dc2626; }
        .status-pill.finished { background: #f0fdf4; color: #16a34a; }

        .card-teams { display: flex; flex-direction: column; gap: 16px; }
        .team-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .row-divider { height: 1px; background: #f1f5f9; margin: 4px 0; }
        
        .minimal-input {
          flex: 1; background: none; border: none;
          font-size: 0.95rem; font-weight: 800; color: #1e293b;
          outline: none; padding: 4px 0;
        }
        .minimal-input:focus { color: #2563eb; }

        .minimal-tag-input {
          background: #f1f5f9; border: none; border-radius: 6px;
          padding: 4px 8px; font-size: 10px; font-weight: 800;
          color: #475569; width: 140px; outline: none;
        }

        .score-widget { display: flex; align-items: center; gap: 4px; background: #f8fafc; padding: 4px; border-radius: 10px; }
        .score-widget button { 
          width: 28px; height: 28px; border: none; background: #fff; 
          border-radius: 6px; font-weight: 800; cursor: pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.1s;
        }
        .score-widget button:hover { background: #2563eb; color: #fff; }
        .score-val { width: 32px; text-align: center; font-weight: 900; font-size: 1.1rem; color: #1e293b; }

        /* ── TABLE ── */
        .table-container { background: #fff; border-radius: 24px; padding: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
        .minimal-table { width: 100%; border-collapse: collapse; }
        .minimal-table th { padding: 16px; text-align: left; font-size: 0.7rem; font-weight: 900; color: #94a3b8; letter-spacing: 0.1em; }
        .minimal-table td { padding: 12px 16px; border-top: 1px solid #f8fafc; }
        
        .cell-input {
          width: 100%; background: none; border: none;
          font-size: 0.9rem; font-weight: 700; color: #1e293b;
          outline: none;
        }
        .cell-input.team { font-weight: 800; }
        .cell-input.pts { color: #2563eb; font-weight: 900; }
        .cell-input::-webkit-inner-spin-button { display: none; }

        .null-state {
          padding: 56px 20px;
          text-align: center;
          border: 2px dashed #dbeafe;
          border-radius: 16px;
          background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
        }
        .null-state h3 { margin: 0 0 8px; font-size: 1rem; color: #0f172a; }
        .null-state p { margin: 0; color: #64748b; font-size: 0.9rem; }
        .null-state code { background: #eff6ff; color: #1d4ed8; padding: 1px 6px; border-radius: 6px; }

        @media (max-width: 900px) {
          .admin-sidebar { width: 80px; padding: 40px 16px; }
          .nav-label, .sidebar-brand span, .user-meta { display: none; }
          .main-header, .main-scroll { padding: 24px; }
          .content-shell { padding: 12px; }
          .quick-stats { display: none; }
        }
      `}</style>
    </div>
  );
}
