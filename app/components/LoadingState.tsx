"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface LoadingStateProps {
  onComplete: () => void;
  onUnmount: () => void;
}

const BOOT_LOGS = [
  { max: 15, text: "INIT: Loading Veri0G kernel..." },
  { max: 30, text: "NET: Connecting to Galileo Testnet..." },
  { max: 48, text: "TEE: Verifying Intel SGX enclave quotes..." },
  { max: 65, text: "RESOLVE: Fetching attestation registries..." },
  { max: 80, text: "ZKP: Structuring zero-knowledge verifier nodes..." },
  { max: 95, text: "MEMPHIS: Aligning geometric matrix layouts..." },
  { max: 100, text: "READY: Secure handshake completed successfully." }
];

export function LoadingState({ onComplete, onUnmount }: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState(BOOT_LOGS[0].text);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const splitLineRef = useRef<HTMLDivElement>(null);

  // Counter logic with retro feel
  useEffect(() => {
    let current = 0;
    const duration = 2000; // 2 seconds loader
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      // Add slight random noise to count progress naturally
      current += step + (Math.random() > 0.6 ? Math.random() * 3.5 : 0);
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setProgress(100);
      } else {
        setProgress(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Lock scrolling on page body while loading screen is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Update booting log console messages based on progress percentage
  useEffect(() => {
    const log = BOOT_LOGS.find(l => progress <= l.max);
    if (log) {
      setCurrentLog(log.text);
    }
  }, [progress]);

  // Trigger GSAP curtain split animation upon reaching 100% progress
  useGSAP(
    () => {
      if (progress !== 100) return;

      // Small delay so user registers the 100% state
      const tl = gsap.timeline({ delay: 0.4 });

      // 1. Center card scale down
      tl.to(cardRef.current, {
        scale: 0.1,
        opacity: 0,
        rotate: -8,
        duration: 0.4,
        ease: "back.in(1.8)",
      });

      // 2. Hide the split divider line
      tl.to(splitLineRef.current, {
        scaleX: 0,
        duration: 0.2,
        opacity: 0
      }, "-=0.2");

      // 3. Simultaneously slide curtains up and down
      tl.to(
        topCurtainRef.current,
        {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
          onStart: () => {
            // Trigger landing page animations at the exact start of curtains parting
            onComplete();
          }
        },
        "-=0.1"
      );

      tl.to(
        bottomCurtainRef.current,
        {
          yPercent: 100,
          duration: 0.8,
          ease: "power4.inOut",
          onComplete: () => {
            // Completely unmount loader from page once curtain finishes sliding
            onUnmount();
          }
        },
        "<" // run in sync with the top curtain slide
      );
    },
    { dependencies: [progress], scope: containerRef }
  );

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-auto"
    >
      {/* ── SPLIT DOORS (CURTAINS) ─────────────────────────────────── */}
      {/* Top half */}
      <div 
        ref={topCurtainRef} 
        className="absolute top-0 left-0 w-full h-[50vh] bg-[#1C1941] z-10 flex flex-col justify-end items-center overflow-hidden"
      >
        {/* Accent floating circles inside curtains */}
        <div className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full border-4 border-[#2E2C5B] bg-[#2E2C5B]/20" />
        <div className="absolute bottom-[10%] right-[15%] w-48 h-48 rounded-full border-4 border-[#2E2C5B] bg-[#2E2C5B]/15" />
      </div>

      {/* Bottom half */}
      <div 
        ref={bottomCurtainRef} 
        className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#1C1941] z-10 flex flex-col justify-start items-center overflow-hidden"
      >
        <div className="absolute top-[20%] right-[8%] w-40 h-40 rounded-full border-4 border-[#2E2C5B] bg-[#2E2C5B]/20" />
        <div className="absolute bottom-[20%] left-[20%] w-24 h-24 rounded-full border-4 border-[#2E2C5B] bg-[#2E2C5B]/15" />
      </div>

      {/* Brutalist split-border divider line */}
      <div 
        ref={splitLineRef}
        className="absolute left-0 right-0 h-[6px] bg-black z-20"
        style={{ top: "calc(50vh - 3px)" }}
      />

      {/* ── CENTRAL BRUTALIST PANEL ─────────────────────────────── */}
      <div 
        ref={cardRef}
        className="relative z-30 w-[92%] max-w-[480px] bg-white border-[4px] border-black shadow-[10px_10px_0_0_#000] p-8 flex flex-col select-none text-black rounded-2xl"
      >
        {/* Retro Titlebar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b-4 border-black">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EE3248] border-2 border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF77C9] border-2 border-black" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#8cebd2] border-2 border-black animate-pulse" />
          </div>
          <span className="font-silkscreen font-bold text-xs uppercase tracking-widest text-black">
            System.boot
          </span>
        </div>

        {/* Boot logo / heading */}
        <div className="mb-6">
          <div className="font-display font-black text-3xl leading-none text-black tracking-tighter uppercase mb-1">
            VERI<span className="text-[#4D38D9]">0G</span>
          </div>
          <p className="text-[10px] font-silkscreen text-gray-500 font-bold uppercase tracking-wider">
            Compute Proof Attestation
          </p>
        </div>

        {/* Progress Value Counter */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-mono font-bold text-black/40 uppercase">
            Progress
          </span>
          <span className="font-display font-black text-5xl text-[#4D38D9] tracking-tight">
            {progress}%
          </span>
        </div>

        {/* Neo-Brutalist Progress Bar */}
        <div className="h-8 w-full border-[3px] border-black bg-white rounded-xl overflow-hidden p-1 mb-6 shadow-[3px_3px_0_0_rgba(0,0,0,0.15)]">
          <div 
            className="h-full rounded-lg bg-[#FF77C9] border-r-2 border-black transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Boot console log */}
        <div className="bg-[#1C1941] text-[#8cebd2] border-[3px] border-black p-4 rounded-xl font-mono text-xs shadow-[inner_0_2px_4px_rgba(0,0,0,0.4)] min-h-[58px] flex items-center">
          <div className="flex gap-2.5 items-start">
            <span className="text-white shrink-0 animate-ping font-bold">▶</span>
            <span className="leading-relaxed font-bold tracking-wide break-all">
              {currentLog}
            </span>
          </div>
        </div>

        {/* Memphis corner decorations on card */}
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#FFD166] border-2 border-black rounded-lg -rotate-12 shadow-[2px_2px_0_0_#000]" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#EE3248] border-2 border-black rounded-lg rotate-12 shadow-[2px_2px_0_0_#000]" />
      </div>
    </div>
  );
}
