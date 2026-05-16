"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, updateDoc, doc, query, orderBy, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const DATES = [8, 9, 15, 16, 22, 23, 29, 30];

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [finalStandings, setFinalStandings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedDateFilter, setSelectedDateFilter] = useState<number>(8);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    message: string; 
    onConfirm?: (val?: string) => void;
    showInput?: boolean;
    inputValue?: string;
  }>({ isOpen: false, title: '', message: '' });

  const router = useRouter();

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (title: string, message: string, onConfirm?: (val?: string) => void, showInput = false) => {
    setModal({ isOpen: true, title, message, onConfirm, showInput, inputValue: '' });
  };

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
    // ORDER BY 'order' field for drag-and-drop support
    const unsubMatches = onSnapshot(query(collection(db, 'matches'), orderBy('order', 'asc')), (snap) => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubStandings = onSnapshot(query(collection(db, 'standings'), orderBy('points', 'desc')), (snap) => {
      setStandings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubFinalStandings = onSnapshot(query(collection(db, 'finalStandings'), orderBy('points', 'desc')), (snap) => {
      setFinalStandings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubMatches(); unsubStandings(); unsubFinalStandings(); };
  }, [user]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
       const day = m.day || parseInt(String(m.time).split(" ")[0], 10) || parseInt(String(m.date).split(" ")[0], 10);
       return day === selectedDateFilter;
    });
  }, [matches, selectedDateFilter]);

  const updateDocField = async (col: string, id: string, field: string, value: any) => {
    try {
      const ref = doc(db, col, id);
      await updateDoc(ref, { [field]: value });
    } catch (e) {
      showToast("Update gagal!", "error");
    }
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    
    const newItems = [...filteredMatches];
    const [movedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIdx, 0, movedItem);

    const batch = writeBatch(db);
    // Only update the 'order' field for the items in the current view
    newItems.forEach((item, index) => {
      const ref = doc(db, 'matches', item.id);
      batch.update(ref, { order: index });
    });

    try {
      await batch.commit();
      showToast("Urutan diperbarui!");
    } catch (e) {
      showToast("Gagal memperbarui urutan", "error");
    }
    setDraggedIndex(null);
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
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span className="toast-icon">{toast.type === 'success' ? '✓' : '×'}</span>
          <span className="toast-msg">{toast.msg}</span>
        </div>
      )}

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modal.title}</h3>
            <p>{modal.message}</p>
            {modal.showInput && (
              <input 
                autoFocus
                className="modal-input" 
                placeholder="Ketik di sini..."
                value={modal.inputValue} 
                onChange={(e) => setModal(prev => ({ ...prev, inputValue: e.target.value }))} 
              />
            )}
            <div className="modal-actions">
              <button className="m-btn cancel" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>Batal</button>
              <button className="m-btn confirm" onClick={() => {
                if (modal.onConfirm) modal.onConfirm(modal.inputValue);
                setModal(prev => ({ ...prev, isOpen: false }));
              }}>Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      <main className="admin-main">
        <header className="main-header">
          <div className="header-title">
            <div className="brand-box"><div className="brand-dot" /><span>TRC ADMIN</span></div>
            <h1>{activeTab === 'matches' ? 'MATCH' : activeTab === 'standings' ? 'GRUP' : 'FINAL'} CONTROL</h1>
          </div>
          <div className="header-right">
             <div className="user-info">
               <span className="u-email">{user?.email}</span>
               <button className="u-logout" onClick={() => signOut(auth)}>LOGOUT</button>
             </div>
          </div>
        </header>

        <div className="main-scroll">
          <section className="content-shell">
          {activeTab === 'matches' && (
            <div className="match-manager">
              <div className="manager-toolbar">
                <div className="date-picker-wrap">
                  <span className="toolbar-label">PILIH TANGGAL PERTANDINGAN:</span>
                  <div className="date-chips">
                    {DATES.map(d => (
                      <button key={d} className={`chip ${selectedDateFilter === d ? 'active' : ''}`} onClick={() => setSelectedDateFilter(d)}>
                        <span className="d-num">{d}</span>
                        <span className="d-label">MEI</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button className="add-btn-main" onClick={() => addDoc(collection(db, 'matches'), { team1: 'TEAM A', team2: 'TEAM B', score1: 0, score2: 0, status: 'UPCOMING', time: '13:00', day: selectedDateFilter, date: 'ROUND 1', phase: 'GROUP STAGE', format: 'BO1', order: matches.length })}>+ TAMBAH MATCH</button>
              </div>

              <div className="match-grid-admin">
                {filteredMatches.map((m, idx) => (
                  <div 
                    key={m.id} 
                    className={`match-ctrl-card ${draggedIndex === idx ? 'is-dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                  >
                    <div className="ctrl-header">
                       <div className="ctrl-header-left">
                         <div className="drag-handle">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 9h14M5 15h14" /></svg>
                         </div>
                         <div className="input-field">
                           <span className="field-label">JAM (WIB)</span>
                           <input placeholder="13:00" value={m.time} onChange={(e) => updateDocField('matches', m.id, 'time', e.target.value)} />
                         </div>
                         <div className="input-field">
                           <span className="field-label">FASE</span>
                           <input placeholder="GROUP STAGE" value={m.phase || ''} onChange={(e) => updateDocField('matches', m.id, 'phase', e.target.value)} />
                         </div>
                         <div className="input-field">
                           <span className="field-label">BABAK</span>
                           <input placeholder="ROUND 1" value={m.date || ''} onChange={(e) => updateDocField('matches', m.id, 'date', e.target.value)} />
                         </div>
                         <div className="input-field">
                           <span className="field-label">FORMAT</span>
                           <input placeholder="BO1" value={m.format || ''} onChange={(e) => updateDocField('matches', m.id, 'format', e.target.value)} />
                         </div>
                       </div>
                       <div className="ctrl-header-right">
                         <div className="status-dropdown-custom">
                            <select 
                              className={`sel-status ${m.status.toLowerCase()}`}
                              value={m.status}
                              onChange={(e) => updateDocField('matches', m.id, 'status', e.target.value)}
                            >
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="FINISHED">FINISHED</option>
                            </select>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                         </div>
                         <button className="delete-icon-btn" onClick={() => deleteDoc(doc(db, 'matches', m.id))}>×</button>
                       </div>
                    </div>

                    <div className="ctrl-body">
                       <div className="team-entry">
                         <input className="team-name-input" value={m.team1} onChange={(e) => updateDocField('matches', m.id, 'team1', e.target.value)} />
                         <div className="score-ctrl">
                           <button onClick={() => updateDocField('matches', m.id, 'score1', Math.max(0, m.score1 - 1))}>-</button>
                           <span>{m.score1}</span>
                           <button onClick={() => updateDocField('matches', m.id, 'score1', m.score1 + 1)}>+</button>
                         </div>
                       </div>
                       <div className="vs-sep">VS</div>
                       <div className="team-entry">
                         <input className="team-name-input" value={m.team2} onChange={(e) => updateDocField('matches', m.id, 'team2', e.target.value)} />
                         <div className="score-ctrl">
                           <button onClick={() => updateDocField('matches', m.id, 'score2', Math.max(0, m.score2 - 1))}>-</button>
                           <span>{m.score2}</span>
                           <button onClick={() => updateDocField('matches', m.id, 'score2', m.score2 + 1)}>+</button>
                         </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="standings-manager">
              <div className="standings-actions">
                <button className="add-group-btn" onClick={() => openModal("TAMBAH GRUP", "Nama Grup:", (val) => { if (val) addDoc(collection(db, 'standings'), { team: 'TIM BARU', group: val.toUpperCase(), played: 0, won: 0, lost: 0, points: 0 }); }, true)}>+ TAMBAH GRUP</button>
              </div>
              {Array.from(new Set(standings.map(s => s.group))).sort().map(groupName => (
                <div key={groupName} className="group-container">
                  <div className="group-header">
                    <div className="group-pill">GRUP {groupName}</div>
                    <div className="group-line" />
                    <button className="add-team-btn" onClick={() => addDoc(collection(db, 'standings'), { team: 'TIM BARU', group: groupName, played: 0, won: 0, lost: 0, points: 0 })}>+ TIM</button>
                  </div>
                  <div className="table-container">
                    <table className="minimal-table">
                      <thead><tr><th>TIM</th><th>M</th><th>W</th><th>L</th><th>TB</th><th>ST</th><th>PTS</th><th></th></tr></thead>
                      <tbody>
                        {standings.filter(s => s.group === groupName).map(s => (
                          <tr key={s.id}>
                            <td><input className="cell-input team" value={s.team} onChange={(e) => updateDocField('standings', s.id, 'team', e.target.value)} /></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('standings', s.id, 'played', Math.max(0, s.played - 1))}>-</button><span>{s.played}</span><button onClick={() => updateDocField('standings', s.id, 'played', s.played + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('standings', s.id, 'won', Math.max(0, s.won - 1))}>-</button><span>{s.won}</span><button onClick={() => updateDocField('standings', s.id, 'won', s.won + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('standings', s.id, 'lost', Math.max(0, s.lost - 1))}>-</button><span>{s.lost}</span><button onClick={() => updateDocField('standings', s.id, 'lost', s.lost + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('standings', s.id, 'tb', Math.max(0, (s.tb || 0) - 1))}>-</button><span>{s.tb || 0}</span><button onClick={() => updateDocField('standings', s.id, 'tb', (s.tb || 0) + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('standings', s.id, 'st', Math.max(0, (s.st || 0) - 1))}>-</button><span>{s.st || 0}</span><button onClick={() => updateDocField('standings', s.id, 'st', (s.st || 0) + 1)}>+</button></div></td>
                            <td><div className="cell-widget pts"><button onClick={() => updateDocField('standings', s.id, 'points', Math.max(0, s.points - 1))}>-</button><span>{s.points}</span><button onClick={() => updateDocField('standings', s.id, 'points', s.points + 1)}>+</button></div></td>
                            <td><button className="del-btn" onClick={() => deleteDoc(doc(db, 'standings', s.id))}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'final-standings' && (
            <div className="standings-manager">
               <div className="standings-actions">
                <button className="add-group-btn" onClick={() => addDoc(collection(db, 'finalStandings'), { team: 'TIM FINAL', played: 0, won: 0, lost: 0, tb: 0, st: 0, points: 0 })}>+ TAMBAH TIM FINAL</button>
              </div>
              <div className="group-container">
                  <div className="group-header">
                    <div className="group-pill">KLASEMEN FINAL</div>
                    <div className="group-line" />
                  </div>
                  <div className="table-container">
                    <table className="minimal-table">
                      <thead><tr><th>TIM</th><th>M</th><th>W</th><th>L</th><th>TB</th><th>ST</th><th>PTS</th><th></th></tr></thead>
                      <tbody>
                        {finalStandings.map(s => (
                          <tr key={s.id}>
                            <td><input className="cell-input team" value={s.team} onChange={(e) => updateDocField('finalStandings', s.id, 'team', e.target.value)} /></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('finalStandings', s.id, 'played', Math.max(0, s.played - 1))}>-</button><span>{s.played}</span><button onClick={() => updateDocField('finalStandings', s.id, 'played', s.played + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('finalStandings', s.id, 'won', Math.max(0, s.won - 1))}>-</button><span>{s.won}</span><button onClick={() => updateDocField('finalStandings', s.id, 'won', s.won + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('finalStandings', s.id, 'lost', Math.max(0, s.lost - 1))}>-</button><span>{s.lost}</span><button onClick={() => updateDocField('finalStandings', s.id, 'lost', s.lost + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('finalStandings', s.id, 'tb', Math.max(0, (s.tb || 0) - 1))}>-</button><span>{s.tb || 0}</span><button onClick={() => updateDocField('finalStandings', s.id, 'tb', (s.tb || 0) + 1)}>+</button></div></td>
                            <td><div className="cell-widget"><button onClick={() => updateDocField('finalStandings', s.id, 'st', Math.max(0, (s.st || 0) - 1))}>-</button><span>{s.st || 0}</span><button onClick={() => updateDocField('finalStandings', s.id, 'st', (s.st || 0) + 1)}>+</button></div></td>
                            <td><div className="cell-widget pts"><button onClick={() => updateDocField('finalStandings', s.id, 'points', Math.max(0, s.points - 1))}>-</button><span>{s.points}</span><button onClick={() => updateDocField('finalStandings', s.id, 'points', s.points + 1)}>+</button></div></td>
                            <td><button className="del-btn" onClick={() => deleteDoc(doc(db, 'finalStandings', s.id))}>×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
          )}
          </section>
        </div>
      </main>

      <nav className="bottom-nav">
        {[
          { id: 'matches', label: 'MATCH', icon: 'M' },
          { id: 'standings', label: 'GRUP', icon: 'G' },
          { id: 'final-standings', label: 'FINAL', icon: 'K' }
        ].map(tab => (
          <button key={tab.id} className={`b-nav-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="b-nav-icon">{tab.icon}</span>
            <span className="b-nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <style jsx>{`
        .admin-root { height: 100vh; background: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; overflow: hidden; display: flex; flex-direction: column; }
        .admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .main-header { padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; background: #fff; border-bottom: 1px solid #e2e8f0; }
        .brand-box { display: flex; align-items: center; gap: 10px; }
        .brand-dot { width: 8px; height: 8px; background: #2563eb; border-radius: 2px; }
        .brand-box span { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #64748b; }
        .header-title h1 { font-size: 1.25rem; font-weight: 900; margin: 4px 0 0; color: #000; }
        .u-email { font-size: 11px; color: #94a3b8; margin-right: 16px; }
        .u-logout { background: #fee2e2; color: #dc2626; border: none; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; }
        
        .main-scroll { flex: 1; padding: 32px 40px 140px; overflow-y: auto; }
        .content-shell { max-width: 1200px; margin: 0 auto; }

        .manager-toolbar { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; background: #fff; padding: 24px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .toolbar-label { font-size: 10px; font-weight: 900; color: #94a3b8; display: block; margin-bottom: 12px; letter-spacing: 0.05em; }
        .date-chips { display: flex; gap: 8px; }
        .chip { padding: 10px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; min-width: 60px; }
        .chip .d-num { font-size: 14px; font-weight: 900; }
        .chip .d-label { font-size: 8px; opacity: 0.5; }
        .chip:hover { border-color: #2563eb; color: #2563eb; }
        .chip.active { background: #2563eb; border-color: #2563eb; color: #fff; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2); }
        .add-btn-main { background: #000; color: #fff; border: none; padding: 14px 28px; border-radius: 14px; font-size: 11px; font-weight: 900; cursor: pointer; transition: 0.2s; }

        /* DRAGGABLE CARD STYLES */
        .match-ctrl-card { 
          background: #fff; 
          border-radius: 24px; 
          padding: 24px; 
          border: 1px solid #e2e8f0; 
          margin-bottom: 20px; 
          cursor: grab; 
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
        }
        .match-ctrl-card:active { cursor: grabbing; }
        .match-ctrl-card.is-dragging { opacity: 0.4; transform: scale(0.98); }
        .drag-handle { margin-right: 12px; color: #cbd5e1; display: flex; align-items: center; }
        .drag-handle svg { width: 16px; height: 16px; }

        .ctrl-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; margin-bottom: 20px; }
        .ctrl-header-left { display: flex; flex-wrap: wrap; gap: 24px; align-items: center; }
        .input-field { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 8px; font-weight: 900; color: #94a3b8; letter-spacing: 0.05em; }
        .input-field input { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 10px; font-size: 12px; font-weight: 900; outline: none; width: 120px; cursor: text; }
        .input-field input:focus { border-color: #2563eb; background: #fff; }
        
        .ctrl-header-right { display: flex; align-items: center; gap: 16px; }
        .status-dropdown-custom { position: relative; display: flex; align-items: center; }
        .sel-status { appearance: none; border: 1px solid transparent; border-radius: 10px; padding: 10px 36px 10px 16px; font-size: 11px; font-weight: 900; cursor: pointer; min-width: 130px; }
        .sel-status.upcoming { background: #eff6ff; color: #2563eb; border-color: #dbeafe; }
        .sel-status.finished { background: #f0fdf4; color: #16a34a; border-color: #dcfce7; }
        .status-dropdown-custom svg { position: absolute; right: 12px; width: 12px; height: 12px; pointer-events: none; opacity: 0.5; }
        .delete-icon-btn { background: #fee2e2; color: #dc2626; border: none; width: 32px; height: 32px; border-radius: 10px; font-size: 20px; line-height: 1; cursor: pointer; transition: 0.2s; }

        .ctrl-body { display: flex; align-items: center; gap: 24px; }
        .team-entry { flex: 1; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 14px 24px; border-radius: 18px; border: 1px solid #f1f5f9; }
        .team-name-input { background: none; border: none; font-size: 1.15rem; font-weight: 900; color: #000; outline: none; flex: 1; cursor: text; }
        .score-ctrl { display: flex; align-items: center; gap: 12px; }
        .score-ctrl button { width: 32px; height: 32px; border: none; background: #fff; border-radius: 10px; font-weight: 900; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: 0.2s; }
        .score-ctrl span { font-size: 1.4rem; font-weight: 950; min-width: 28px; text-align: center; }
        .vs-sep { font-size: 11px; font-weight: 950; color: #cbd5e1; font-style: italic; }

        .bottom-nav { position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); background: #000; padding: 8px; border-radius: 24px; display: flex; gap: 4px; z-index: 1000; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .b-nav-btn { display: flex; align-items: center; gap: 12px; padding: 12px 24px; border: none; background: none; border-radius: 18px; color: rgba(255, 255, 255, 0.4); font-size: 12px; font-weight: 800; cursor: pointer; transition: 0.2s; }
        .b-nav-btn.active { background: #fff; color: #000; }
        
        .standings-actions { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .add-group-btn { background: #000; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-size: 10px; font-weight: 900; cursor: pointer; }
        .group-container { background: #fff; border-radius: 24px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px; }
        .group-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .group-pill { background: #f8fafc; color: #000; font-size: 10px; font-weight: 900; padding: 6px 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
        .group-line { flex: 1; height: 1px; background: #f1f5f9; }
        .add-team-btn { background: #2563eb; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-size: 9px; font-weight: 900; cursor: pointer; }
        .minimal-table { width: 100%; border-collapse: collapse; }
        .minimal-table th { padding: 12px; text-align: left; font-size: 9px; font-weight: 900; color: #94a3b8; }
        .minimal-table td { padding: 10px 12px; border-top: 1px solid #f8fafc; }
        .cell-input.team { background: none; border: none; outline: none; font-weight: 900; font-size: 0.95rem; width: 100%; cursor: text; }
        .cell-widget { display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 4px; border-radius: 8px; width: fit-content; }
        .cell-widget button { width: 22px; height: 22px; border: none; background: #fff; border-radius: 6px; font-weight: 900; cursor: pointer; }
        .cell-widget span { min-width: 20px; text-align: center; font-size: 11px; font-weight: 900; }
        .cell-widget.pts { background: #2563eb; color: #fff; }
        .del-btn { color: #ef4444; font-size: 1.2rem; background: none; border: none; cursor: pointer; }
        .toast { position: fixed; top: 32px; left: 50%; transform: translateX(-50%); background: #000; color: #fff; padding: 14px 28px; border-radius: 16px; z-index: 2000; font-size: 12px; font-weight: 800; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.05); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1500; }
        .modal-content { background: #fff; padding: 32px; border-radius: 32px; width: 380px; box-shadow: 0 30px 60px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .modal-input { width: 100%; margin-top: 16px; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; font-weight: 800; outline: none; cursor: text; }
        .m-btn { flex: 1; padding: 12px; border: none; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 11px; }
        .m-btn.confirm { background: #2563eb; color: #fff; }
        .m-btn.cancel { background: #f1f5f9; color: #64748b; }
      `}</style>
    </div>
  );
}
