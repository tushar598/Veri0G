// src/components/HeroBackground.tsx
"use client";

import React from "react";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      <div
        className="absolute inset-0 z-0"
        style={{ background: "radial-gradient(circle at 50% 40%, #b5f6e6 0%, #8cebd2 100%)" }}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-v-slow   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
        @keyframes float-v-medium { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-20px)} }
        @keyframes float-v-fast   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
        @keyframes float-star-slow{ 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-8px)  rotate(4deg)}  }
        @keyframes float-star-fast{ 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-10px) rotate(-6deg)} }
        .anim-float-slow   { animation: float-v-slow    7s   ease-in-out infinite }
        .anim-float-medium { animation: float-v-medium  5.5s ease-in-out infinite }
        .anim-float-fast   { animation: float-v-fast    4s   ease-in-out infinite }
        .anim-star-slow    { animation: float-star-slow 8s   ease-in-out infinite }
        .anim-star-fast    { animation: float-star-fast 5s   ease-in-out infinite }
      `}} />

      <svg
        className="absolute inset-0 w-full h-full z-0"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* ── 1. LARGE PINK CIRCLES (No border/shadow) ─────── */}
        <g className="anim-float-slow">
          <circle cx="120" cy="170" r="240" fill="#FF77C9" />
        </g>
        <g className="anim-float-medium">
          <circle cx="1370" cy="560" r="260" fill="#FF77C9" />
        </g>

       

        {/* ── 3. RED TRIANGLES (No border/shadow) ──────────── */}
        <g className="anim-float-fast">
          <polygon points="0,0 240,0 60,200" fill="#EE3248" />
        </g>
        <g className="anim-float-slow">
          <polygon points="1440,90 1230,10 1440,330" fill="#EE3248" />
        </g>
        <g className="anim-float-medium">
          <polygon points="1140,0 1300,0 1190,180" fill="#EE3248" />
        </g>

        {/* ── 5. PIXEL PLUS / CROSS SIGNS ──────────────────── */}
        <g transform="translate(1195, 255)" className="anim-star-slow">
          <rect x="-9"  y="-30" width="22" height="60" fill="#FFD166" rx="3" />
          <rect x="-30" y="-9"  width="60" height="22" fill="#FFD166" rx="3" />
        </g>
        <g transform="translate(175, 345)" className="anim-star-fast">
          <rect x="-6"  y="-20" width="14" height="40" fill="#FFD166" rx="2" />
          <rect x="-20" y="-6"  width="40" height="14" fill="#FFD166" rx="2" />
        </g>
        <g transform="translate(1285, 590)" className="anim-float-medium">
          <rect x="-5"  y="-16" width="11" height="32" fill="#FF77C9" rx="2" />
          <rect x="-16" y="-5"  width="32" height="11" fill="#FF77C9" rx="2" />
        </g>

        {/* ── 6. ROUNDED-SQUARE (No border/shadow) ─────────── */}
        <g transform="translate(310, 660) rotate(-14)" className="anim-float-slow">
          <rect x="-38" y="-38" width="80" height="80" rx="14" fill="#4D38D9" />
          <rect x="-28" y="-28" width="60" height="60" rx="10" fill="none" stroke="#6B54FA" strokeWidth="3" opacity="0.7" />
        </g>

        {/* ── 7. BOLD RING ─────────────────────────────────── */}
        <g transform="translate(430, 555)" className="anim-float-fast">
          <circle cx="0"  cy="0"  r="42" fill="#4D38D9" />
          <circle cx="0"  cy="0"  r="28" fill="#6B54FA" />
          <circle cx="0"  cy="0"  r="14" fill="#8B74FF" />
        </g>

        {/* ── 8. WHITE LINE ACCENTS ────────────────────────── */}
        <g>
          <line x1="1330" y1="160" x2="1390" y2="60" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </g>
        <g>
          <line x1="1290" y1="260" x2="1340" y2="170" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </g>
        <g opacity="0.8">
          <line x1="120" y1="700" x2="200" y2="580" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
        </g>
      </svg>

      {/* ── HTML LAYER ───────────────────────────────────── */}
      <div className="absolute inset-0 z-10 max-w-[1400px] mx-auto w-full h-full">
        {/* ... Pixel stars logic (removed drop shadow class from PixelStar below) ... */}
      </div>
    </div>
  );
}

function PixelStar() {
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" className="w-full h-full" aria-hidden="true">
       {/* Pixel rects remain the same, but 'drop-shadow' class removed */}
       <rect x="5" y="0"  width="2" height="1" fill="#FFD166" />
       {/* ... rest of your rects ... */}
    </svg>
  );
}