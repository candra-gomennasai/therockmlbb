"use client";
import React from 'react';
import { Save, Plus, Trash2, ShieldCheck, Settings } from 'lucide-react';

const AdminPanel = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="brutal-card admin-main">
            <div className="card-top">
               <h3 className="font-brutal text-2xl flex items-center gap-4">
                  <Settings size={28} /> MANAJEMEN PERTANDINGAN
               </h3>
            </div>
            
            <div className="p-5 md:p-10 space-y-8 md:space-y-12">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="field-group">
                  <label className="brutal-label">GRUP TURNAMEN</label>
                  <select className="brutal-select">
                    <option>GRUP A</option>
                    <option>GRUP B</option>
                  </select>
                </div>

                <div className="field-group">
                  <label className="brutal-label">STATUS MATCH</label>
                  <select className="brutal-select" style={{ borderColor: 'var(--accent-red)' }}>
                    <option>AKAN DATANG</option>
                    <option>LIVE</option>
                    <option>SELESAI</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="team-entry blue-brutal">
                  <div className="side">TIM BIRU</div>
                  <select className="brutal-select transparent">
                    <option>Venom Esport</option>
                  </select>
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="brutal-label mini">SCORE</label>
                      <input type="number" defaultValue="0" className="brutal-num-input" />
                    </div>
                    <div>
                      <label className="brutal-label mini">KILLS</label>
                      <input type="number" defaultValue="0" className="brutal-num-input" />
                    </div>
                  </div>
                </div>

                <div className="team-entry red-brutal">
                  <div className="side">TIM MERAH</div>
                  <select className="brutal-select transparent">
                    <option>Frost Legion</option>
                  </select>
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div>
                      <label className="brutal-label mini">SCORE</label>
                      <input type="number" defaultValue="0" className="brutal-num-input" />
                    </div>
                    <div>
                      <label className="brutal-label mini">KILLS</label>
                      <input type="number" defaultValue="0" className="brutal-num-input" />
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-brutal btn-blue w-full flex justify-center py-5 text-xl">
                <Save size={24} /> SIMPAN DATA MATCH
              </button>
            </div>
          </div>
        </div>

        <div className="admin-sidebar space-y-10">
          <div className="brutal-card p-10 bg-accent-yellow">
            <h4 className="font-brutal text-sm mb-6">AKSI CEPAT</h4>
            <div className="space-y-4">
              <button className="sidebar-btn"><Plus size={18} /> DAFTARKAN TIM</button>
              <button className="sidebar-btn"><ShieldCheck size={18} /> VERIFIKASI ROSTER</button>
              <button className="sidebar-btn red"><Trash2 size={18} /> RESET DATA</button>
            </div>
          </div>
          
          <div className="brutal-card p-10">
             <div className="flex items-center gap-4 mb-6">
                <div className="status-dot green" />
                <span className="font-brutal text-xs">DATABASE TERSINKRON</span>
             </div>
             <p className="text-sm font-medium leading-relaxed">
                Perubahan dikirim ke semua client live secara langsung. Pastikan skor sudah dicek ulang sebelum menyimpan.
             </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-main { border-radius: 14px; overflow: hidden; }
        .card-top { background: #000; color: white; padding: 20px 40px; }
        .brutal-label { display: block; font-family: var(--font-heading); font-weight: 800; font-size: 11px; margin-bottom: 12px; }
        .brutal-label.mini { font-size: 9px; opacity: 0.5; }
        .brutal-select { width: 100%; border: var(--brutal-border); border-radius: 10px; padding: 15px; font-family: var(--font-heading); font-weight: 800; font-size: 14px; background: white; outline: none; box-shadow: 3px 3px 0px #1f2937; }
        .brutal-select:focus { background: #F8FAFC; }
        .team-entry { padding: 30px; border: var(--brutal-border); border-radius: 12px; box-shadow: 4px 4px 0px #1f2937; }
        .team-entry.blue-brutal { background: rgba(59, 130, 246, 0.05); }
        .team-entry.red-brutal { background: rgba(239, 68, 68, 0.05); }
        .side { font-family: var(--font-heading); font-weight: 900; font-size: 10px; margin-bottom: 20px; letter-spacing: 2px; }
        .blue-brutal .side { color: var(--accent-blue); }
        .red-brutal .side { color: var(--accent-red); }
        .brutal-num-input { width: 100%; border: var(--brutal-border); border-radius: 10px; padding: 15px; font-family: var(--font-heading); font-weight: 900; font-size: 2rem; text-align: center; background: white; outline: none; }
        .sidebar-btn { width: 100%; text-align: left; background: white; border: var(--brutal-border); border-radius: 10px; padding: 15px; font-family: var(--font-heading); font-weight: 800; font-size: 10px; display: flex; align-items: center; gap: 12px; cursor: pointer; box-shadow: 3px 3px 0px #1f2937; transition: all 0.1s; }
        .sidebar-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0px #1f2937; }
        .sidebar-btn.red { background: var(--accent-red); color: white; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; border: 1px solid #000; }
        .status-dot.green { background: var(--accent-green); }
        @media (max-width: 640px) {
          .card-top { padding: 14px 16px; }
          .team-entry { padding: 18px; }
          .brutal-select { padding: 10px; font-size: 12px; }
          .brutal-num-input { padding: 10px; font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
