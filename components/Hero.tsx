"use client";
import React from 'react';

export const Hero = () => {
  const [ninjaError, setNinjaError] = React.useState(false);
  const [shurikenError, setShurikenError] = React.useState(false);
  return (
    <section className="hero-clone">
      {/* local shade — keeps text readable on the global bg */}
      <div className="hero-shade" />

      <div className="content max-w-7xl mx-auto">
        <div className="left">
          <div className="heading-wrap">
            <h1>THE ROCK CAFE</h1>
            <div className="subtitle-row">
              <span className="subtext">Mobile Legends Bang Bang Tournament</span>
            </div>
          </div>
          <p>
            Semua info turnamen ada di sini: jadwal main, hasil match, dan klasemen tiap grup. Buka kapan saja buat cek progres tim kamu.
          </p>
        </div>

        <div className="right">
          <div className="hero-art">
            <div className="aura" />
            {!ninjaError ? (
              <img className="fighter" src="/ninja.png" alt="Ninja" onError={() => setNinjaError(true)} />
            ) : (
              <div className="fighter-fallback">NINJA ART</div>
            )}
          </div>
        </div>
      </div>

      {!shurikenError && <img className="shuriken one" src="/shuriken.png" alt="" onError={() => setShurikenError(true)} />}
      {!shurikenError && <img className="shuriken two" src="/shuriken.png" alt="" onError={() => setShurikenError(true)} />}

      <style jsx>{`
        .hero-clone {
          position: relative;
          min-height: min(92vh, 880px);
          /* NO overflow:hidden — that was clipping and causing the dark edge */
          background: transparent;
          border: none;
        }
        /* shade: only darkens sides for readability, fully transparent at bottom */
        .hero-shade {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 85% 40%, rgba(37,99,235,0.04), transparent 40%),
            radial-gradient(circle at 15% 30%, rgba(37,99,235,0.03), transparent 30%);
          pointer-events: none;
        }
        .content {
          position: relative;
          z-index: 2;
          min-height: min(92vh, 880px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
        }
        .left {
          max-width: 560px;
          justify-self: center;
          transform: translateY(18px);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h1 {
          margin: 0 0 12px;
          color: #0f172a;
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 7.5vw, 5.2rem);
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          text-align: center;
          white-space: nowrap;
        }
        .heading-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }
        .subtitle-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          width: 100%;
        }
        .subtext {
          color: #2563eb;
          font-family: var(--font-heading);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-align: center;
        }
        p {
          margin: 0;
          color: #64748b;
          line-height: 1.7;
          font-size: clamp(0.95rem, 1.1vw, 1.05rem);
          max-width: 520px;
          text-align: center;
          opacity: 0.9;
        }
        .right {
          display: grid;
          place-items: center;
        }
        .hero-art {
          width: min(100%, 540px);
          aspect-ratio: 1 / 1;
          position: relative;
          display: grid;
          place-items: center;
        }
        .aura {
          position: absolute;
          width: 86%;
          height: 86%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(185, 28, 28, 0.28), rgba(15,23,42,0) 70%);
          filter: blur(6px);
        }
        .fighter {
          position: relative;
          width: 106%;
          max-width: 640px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 24px 42px rgba(0, 0, 0, 0.65));
          transform: translate(8%, 4%);
          animation: ninjaFloat 4.8s ease-in-out infinite;
          will-change: transform;
        }
        .fighter-fallback {
          width: 74%;
          height: 74%;
          border: 1px dashed rgba(203, 213, 225, 0.45);
          border-radius: 18px;
          display: grid;
          place-items: center;
          color: rgba(203, 213, 225, 0.72);
          font-family: var(--font-heading);
          letter-spacing: 0.06em;
          font-size: 1.1rem;
          background: rgba(15, 23, 42, 0.32);
        }
        .shuriken {
          position: absolute;
          z-index: 2;
          width: 72px;
          height: 72px;
          object-fit: contain;
          opacity: 0.76;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.55));
          animation: shurikenSpin 8.5s linear infinite, shurikenDrift 3.6s ease-in-out infinite;
          will-change: transform;
        }
        .shuriken.one { left: 10%; top: 17%; }
        .shuriken.two { left: 52%; bottom: 8%; animation-duration: 10s, 4.2s; }

        @keyframes ninjaFloat {
          0%, 100% { transform: translate(8%, 4%) rotate(0deg); }
          50% { transform: translate(8%, 1.5%) rotate(-1deg); }
        }
        @keyframes shurikenSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shurikenDrift {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -10px; }
        }

        @media (max-width: 900px) {
          .content {
            grid-template-columns: 1fr;
            padding: 24px 16px 36px;
            align-items: center;
            gap: 20px;
          }
          .left {
            transform: none;
            justify-self: stretch;
          }
          .right {
            order: -1;
          }
          .hero-art {
            max-width: 340px;
          }
          .fighter {
            width: 110%;
            transform: translate(0, 4%);
            animation: ninjaFloatMobile 4.8s ease-in-out infinite;
          }
          .shuriken {
            width: 46px;
            height: 46px;
          }
          .shuriken.one { left: 8%; top: 14%; }
          .shuriken.two { left: auto; right: 8%; bottom: 8%; }
          @keyframes ninjaFloatMobile {
            0%, 100% { transform: translate(0, 4%) rotate(0deg); }
            50% { transform: translate(0, 1%) rotate(-0.8deg); }
          }
        }
      `}</style>
    </section>
  );
};
