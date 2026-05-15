"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/manage-trc/dashboard'); 
    } catch (err: any) {
      console.error(err);
      setError('Akses ditolak. Email atau kode keamanan tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-root">
      {/* ── BACKGROUND ── */}
      <div className="admin-bg">
        <div className="admin-bg-mesh" />
        <div className="admin-bg-glow g1" />
        <div className="admin-bg-glow g2" />
        <div className="admin-bg-grid" />
      </div>

      <main className="admin-main">
        <div className="admin-login-card">
          {/* Card Accent */}
          <div className="card-accent" />
          
          <div className="admin-head">
            <div className="admin-logo-outer">
              <div className="admin-logo-inner">
                <img src="/logo.png" alt="Logo" />
              </div>
              <div className="admin-logo-scan" />
            </div>
            
            <div className="admin-title-group">
              <h1 className="admin-title">LOGIN ADMIN</h1>
              <div className="admin-status">
                Silakan masuk untuk mengelola turnamen.
              </div>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleLogin}>
            <div className="admin-input-group">
              <label>ALAMAT EMAIL</label>
              <div className="admin-input-wrapper">
                <div className="admin-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  placeholder="admin@therockcafe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="admin-input-line" />
              </div>
            </div>

            <div className="admin-input-group">
              <label>KATA SANDI</label>
              <div className="admin-input-wrapper">
                <div className="admin-input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="admin-input-line" />
              </div>
            </div>

            {error && (
              <div className="admin-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className={`admin-login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              <div className="btn-shine" />
              {loading ? (
                <div className="admin-loader" />
              ) : (
                <>
                  <span className="btn-label">MASUK SEKARANG</span>
                  <svg className="btn-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="admin-footer">
            <button className="admin-back-btn" onClick={() => router.push('/')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              KEMBALI KE BERANDA
            </button>
          </div>
        </div>

        <div className="admin-copy-bar">
          <span className="copy-text">© 2026 THE ROCK CAFE</span>
        </div>
      </main>

      <style jsx>{`
        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          color: #0f172a;
        }

        /* ── BACKGROUND ── */
        .admin-bg { position: absolute; inset: 0; z-index: 1; }
        .admin-bg-mesh {
          position: absolute; inset: 0;
          background: 
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.03) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(37, 99, 235, 0.03) 0%, transparent 50%);
        }
        .admin-bg-glow {
          position: absolute; width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
        .admin-bg-glow.g1 { top: -20%; right: -10%; animation: floatGlow 15s ease-in-out infinite alternate; }
        .admin-bg-glow.g2 { bottom: -20%; left: -10%; animation: floatGlow 15s ease-in-out infinite alternate-reverse; }
        
        @keyframes floatGlow {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(-5%, 5%) scale(1.1); }
        }

        .admin-bg-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        /* ── MAIN ── */
        .admin-main {
          position: relative; z-index: 10;
          width: 100%; max-width: 460px;
          padding: 24px;
          display: flex; flex-direction: column; align-items: center; gap: 32px;
        }

        .admin-login-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 40px;
          padding: 60px 48px;
          box-shadow: 
            0 40px 80px rgba(15, 23, 42, 0.08),
            0 10px 30px rgba(15, 23, 42, 0.03),
            inset 0 0 0 1px rgba(255, 255, 255, 0.4);
          position: relative;
          overflow: hidden;
          animation: cardSlide 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardSlide {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 6px;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          opacity: 0.8;
        }

        /* ── HEAD ── */
        .admin-head {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; margin-bottom: 56px;
        }
        
        .admin-logo-outer {
          position: relative; margin-bottom: 32px;
          padding: 6px; background: rgba(15, 23, 42, 0.03);
          border-radius: 28px;
        }
        .admin-logo-inner {
          width: 88px; height: 88px;
          background: #ffffff; border-radius: 22px;
          padding: 14px; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.04);
          position: relative; z-index: 2;
        }
        .admin-logo-inner img { width: 100%; height: 100%; object-fit: contain; }
        
        .admin-logo-scan {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.1), transparent);
          background-size: 100% 200%;
          animation: scan 3s linear infinite;
          pointer-events: none; border-radius: 28px;
        }
        @keyframes scan {
          0% { background-position: 0 -100%; }
          100% { background-position: 0 100%; }
        }

        .admin-title {
          font-size: 1.5rem; font-weight: 900; color: #0f172a;
          letter-spacing: -0.01em; margin-bottom: 10px;
        }
        .admin-status {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.1em;
        }
        .status-dot {
          width: 6px; height: 6px; background: #16a34a; border-radius: 50%;
          box-shadow: 0 0 8px rgba(22, 163, 74, 0.5);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* ── FORM ── */
        .admin-form { display: flex; flex-direction: column; gap: 28px; }
        .admin-input-group { display: flex; flex-direction: column; gap: 12px; }
        .admin-input-group label {
          font-size: 10px; font-weight: 800; color: #475569;
          letter-spacing: 0.1em; padding-left: 2px;
        }
        
        .admin-input-wrapper { position: relative; }
        .admin-input-icon {
          position: absolute; left: 20px; top: 50%; transform: translateY(-50%);
          width: 20px; height: 20px; color: #94a3b8; transition: color 0.3s;
        }
        
        .admin-input-wrapper input {
          width: 100%; height: 58px;
          background: rgba(15, 23, 42, 0.03);
          border: 1px solid rgba(15, 23, 42, 0.04);
          border-radius: 18px; padding: 0 20px 0 54px;
          color: #0f172a; font-size: 1rem; font-weight: 600;
          transition: all 0.3s;
        }
        .admin-input-wrapper input:focus {
          outline: none; background: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 10px 20px rgba(37, 99, 235, 0.04);
        }
        
        .admin-input-line {
          position: absolute; bottom: 0; left: 50%; width: 0; height: 2px;
          background: #2563eb; transition: all 0.3s ease; transform: translateX(-50%);
        }
        .admin-input-wrapper input:focus ~ .admin-input-line { width: 40%; }
        .admin-input-wrapper input:focus ~ .admin-input-icon { color: #2563eb; }

        .admin-error {
          display: flex; align-items: center; gap: 10px;
          background: rgba(220, 38, 38, 0.05); border: 1px solid rgba(220, 38, 38, 0.1);
          color: #dc2626; padding: 14px 18px; border-radius: 16px;
          font-size: 0.8rem; font-weight: 700; text-align: left;
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
          40%, 60% { transform: translate3d(3px, 0, 0); }
        }

        .admin-login-btn {
          margin-top: 12px; height: 64px;
          background: #2563eb; border: none; border-radius: 20px;
          color: #ffffff; font-weight: 800; font-size: 0.95rem;
          letter-spacing: 0.05em; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 14px; position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .admin-login-btn:hover:not(:disabled) {
          background: #1d4ed8; transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
        }
        .admin-login-btn:active { transform: translateY(0); }
        .admin-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .btn-shine {
          position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-25deg);
        }
        .admin-login-btn:hover .btn-shine { animation: shine 1s; }
        @keyframes shine { to { left: 150%; } }

        .btn-chevron { width: 18px; height: 18px; transition: transform 0.3s; }
        .admin-login-btn:hover .btn-chevron { transform: translateX(5px); }

        .admin-loader {
          width: 26px; height: 26px;
          border: 3px solid rgba(255,255,255,0.2);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ── FOOTER ── */
        .admin-footer {
          margin-top: 48px; border-top: 1px solid rgba(15, 23, 42, 0.05);
          padding-top: 32px; display: flex; justify-content: center;
        }
        .admin-back-btn {
          background: none; border: none; display: flex; align-items: center;
          gap: 10px; color: #94a3b8; font-size: 0.8rem; font-weight: 800;
          cursor: pointer; transition: all 0.3s; letter-spacing: 0.05em;
        }
        .admin-back-btn:hover { color: #0f172a; transform: translateX(-6px); }
        .admin-back-btn svg { width: 18px; height: 18px; }

        .admin-copy-bar {
          display: flex; align-items: center; gap: 16px;
          font-size: 0.65rem; font-weight: 800; color: #94a3b8;
          letter-spacing: 0.1em;
        }
        .copy-sep { width: 4px; height: 4px; background: #cbd5e1; border-radius: 50%; }

        @media (max-width: 480px) {
          .admin-login-card { padding: 48px 24px; border-radius: 32px; }
          .admin-main { gap: 24px; }
          .admin-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
}
