import type { Metadata } from "next";
import "./globals.css";
import BfCacheBuster from "@/components/BfCacheBuster";
import { Lexend, Space_Grotesk } from "next/font/google";

const fontMain = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-main",
  display: "swap",
});

const fontHeading = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Rock Cafe MLBB Tournament",
  description: "Platform turnamen Mobile Legends The Rock Cafe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>

        <style dangerouslySetInnerHTML={{ __html: `
          /* CRITICAL: Preloader — injected server-side before any JS */
          #site-preloader {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            /* Fade out after 1.5s, over 0.7s */
            animation: sitePreloaderFade 0.7s ease 1.5s forwards;
            pointer-events: none;
          }
          #site-preloader > * {
            pointer-events: auto;
          }
          @keyframes sitePreloaderFade {
            0%   { opacity: 1; }
            100% { opacity: 0; }
          }
          #site-preloader .pl-logo-box {
            position: relative;
            width: 90px; height: 90px;
            background: #ffffff;
            border-radius: 26px;
            padding: 15px;
            box-shadow: 0 20px 40px rgba(15,23,42,0.08);
            border: 1px solid rgba(15,23,42,0.06);
          }
          #site-preloader .pl-logo-box img {
            width: 100%; height: 100%; object-fit: contain;
          }
          #site-preloader .pl-ring {
            position: absolute;
            inset: -12px;
            border: 2.5px solid rgba(122,0,0,0.12);
            border-radius: 38px;
            border-top-color: #7a0000;
            animation: plRingSpin 1s linear infinite;
          }
          @keyframes plRingSpin { to { transform: rotate(360deg); } }
          #site-preloader .pl-name {
            display: flex; gap: 8px;
            font-family: system-ui, sans-serif;
            font-size: 1.1rem; font-weight: 900;
            letter-spacing: 0.12em;
          }
          #site-preloader .pl-rock { color: #0f172a; }
          #site-preloader .pl-cafe { color: #7a0000; }
          #site-preloader .pl-track {
            width: 120px; height: 3px;
            background: #e2e8f0;
            border-radius: 10px; overflow: hidden;
          }
          #site-preloader .pl-fill {
            width: 100%; height: 100%;
            background: linear-gradient(90deg, #7a0000, #b91c1c);
            transform: translateX(-100%);
            animation: plBarFill 1.4s cubic-bezier(0.65, 0, 0.35, 1) forwards;
          }
          @keyframes plBarFill { to { transform: translateX(0); } }
        `}} />
      </head>
      <body className={`${fontMain.variable} ${fontHeading.variable}`}>
        {/* Server-rendered preloader — visible BEFORE any JS runs */}
        <div id="site-preloader" aria-hidden="true">
          <div className="pl-logo-box">
            <img src="/logo.png" alt="" width="60" height="60" loading="eager" fetchPriority="high" decoding="async" />
            <div className="pl-ring" />
          </div>
          <div className="pl-name">
            <span className="pl-rock">THE ROCK</span>
            <span className="pl-cafe">CAFE</span>
          </div>
          <div className="pl-track">
            <div className="pl-fill" />
          </div>
        </div>

        <div className="bg-mesh" />
        <div className="grid-overlay" />
        <BfCacheBuster />
        {children}
      </body>
    </html>
  );
}
