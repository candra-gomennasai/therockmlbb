"use client";
import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
const teams = [
  { id: 1, name: 'PT KKP 3', group: 'A', logo: '1', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 2, name: 'PT STP 2', group: 'A', logo: '2', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 3, name: 'PT MS1', group: 'A', logo: '3', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 4, name: 'TC LAB', group: 'A', logo: '4', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 5, name: 'PT BSK 1', group: 'A', logo: '5', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 6, name: 'RO IC', group: 'B', logo: '1', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 7, name: 'PT RHS 2', group: 'B', logo: '2', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 8, name: 'PT MS3', group: 'B', logo: '3', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 9, name: 'PT KSY 1', group: 'C', logo: '1', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 10, name: 'PT BSK 2', group: 'C', logo: '2', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 11, name: 'PT KSY 3', group: 'C', logo: '3', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 12, name: 'CWS', group: 'C', logo: '4', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 13, name: 'PT MS POM 2', group: 'D', logo: '1', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 14, name: 'PT KKP 1', group: 'D', logo: '2', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 15, name: 'PT RHS 1', group: 'D', logo: '3', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 16, name: 'PT KKP 2', group: 'D', logo: '4', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 17, name: 'PT STP 3', group: 'B', logo: '4', mp: 0, w: 0, l: 0, pts: 0 },
  { id: 18, name: 'EMU', group: 'B', logo: '5', mp: 0, w: 0, l: 0, pts: 0 },
];

const matches = [
  { id: 101, teamA: 'PT STP 2', teamB: 'PT BSK 1', scoreA: 0, scoreB: 0, status: 'UPCOMING', group: 'A', date: '08', time: 'Match 1' },
  { id: 102, teamA: 'PT MS1', teamB: 'TC LAB', scoreA: 0, scoreB: 0, status: 'UPCOMING', group: 'A', date: '08', time: 'Match 2' },
  // ... adding enough for testing
];

export default function SeedPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    setStatus('Memulai injeksi data...');

    try {
      // 1. Seed Standings
      setStatus('Menyuntik data Klasemen...');
      for (const t of teams) {
        await addDoc(collection(db, 'standings'), {
          team: t.name,
          played: t.mp || 0,
          won: t.w || 0,
          lost: t.l || 0,
          points: t.pts || 0,
          group: t.group
        });
      }

      // 2. Seed Matches
      setStatus('Menyuntik data Jadwal...');
      for (const m of matches) {
        await addDoc(collection(db, 'matches'), {
          team1: m.teamA,
          team2: m.teamB,
          score1: m.scoreA || 0,
          score2: m.scoreB || 0,
          status: m.status || 'UPCOMING',
          time: `${m.date} - ${m.time}`,
          group: m.group
        });
      }

      // 3. Seed Final Stage (Dummy)
      setStatus('Menyuntik data Final Stage...');
      const finalStages = [
        { round: 'QUARTER FINAL', team1: 'TBD', team2: 'TBD', score1: 0, score2: 0, time: 'TBA' },
        { round: 'SEMI FINAL', team1: 'TBD', team2: 'TBD', score1: 0, score2: 0, time: 'TBA' },
        { round: 'GRAND FINAL', team1: 'TBD', team2: 'TBD', score1: 0, score2: 0, time: 'TBA' }
      ];
      for (const f of finalStages) {
        await addDoc(collection(db, 'finalMatches'), f);
      }

      setStatus('Injeksi data BERHASIL! Database Firestore sekarang sudah terisi.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    setLoading(true);
    setStatus('Membersihkan data lama...');
    try {
      const collections = ['matches', 'standings', 'finalMatches'];
      for (const colName of collections) {
        const snap = await getDocs(collection(db, colName));
        for (const docItem of snap.docs) {
          await deleteDoc(docItem.ref);
        }
      }
      setStatus('Data lama berhasil dibersihkan.');
    } catch (error: any) {
      setStatus(`Gagal membersihkan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>FIREBASE DATA INJECTOR</h1>
      <p>Gunakan halaman ini untuk mengisi data awal ke Firestore.</p>
      
      <div style={{ marginTop: 40, display: 'flex', gap: 20, justifyContent: 'center' }}>
        <button 
          onClick={seedData} 
          disabled={loading}
          style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Suntik Data Sekarang'}
        </button>

        <button 
          onClick={clearData} 
          disabled={loading}
          style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Kosongkan Database'}
        </button>
      </div>

      <div style={{ marginTop: 40, padding: 20, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <strong>Status:</strong> {status || 'Menunggu aksi...'}
      </div>

      <p style={{ marginTop: 40, color: '#64748b', fontSize: '0.9rem' }}>
        Setelah selesai, kamu bisa menghapus halaman ini atau langsung menuju Dashboard Admin.
      </p>
    </div>
  );
}
