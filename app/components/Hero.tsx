// src/components/Hero.tsx
"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { HeroBackground } from "./HeroBackground";

gsap.registerPlugin(useGSAP);



const CHECKS = [
  { label: "Service Found",      status: "ACTIVE", icon: "✓", passing: true  },
  { label: "TEE Signer Match",   status: "PASS",   icon: "✓", passing: true  },
  { label: "Compose Hash Match", status: "PASS",   icon: "✓", passing: true  },
  { label: "Hardware Quote",     status: "MANUAL", icon: "—", passing: false },
];

export function Hero({ isLoaded = true }: { isLoaded?: boolean }) {
  const container  = useRef<HTMLDivElement>(null);
  const shieldRef  = useRef<HTMLDivElement>(null);
  const squareRef  = useRef<HTMLDivElement>(null);

   
  useGSAP(
    () => {
      if (!isLoaded) return;

      // entrance sequence
      const tl = gsap.timeline();
      tl.from(".hero-badge", {
          y: 20, opacity: 0, duration: 0.5, ease: "back.out(1.5)",
        })
        .from(".hero-title-line", {
          y: 70, opacity: 0, duration: 0.75, stagger: 0.1, ease: "power4.out",
        }, "-=0.2")
        .from(".hero-desc", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
        .from(".hero-btn",  {
          scale: 0.85, opacity: 0, duration: 0.4, stagger: 0.1, ease: "back.out(2)",
          clearProps: "all",
        }, "-=0.2")
        .from(".hero-graphic", {
          x: 60, opacity: 0, duration: 0.9, ease: "power3.out",
        }, "-=0.7");

      // ambient float on decorative elements
      gsap.to(shieldRef.current, {
        y: -8, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
      gsap.to(squareRef.current, {
        y: 6, rotate: -9, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
    },
    { dependencies: [isLoaded], scope: container }
  );

  return (
    <section id="overview" ref={container} className="relative overflow-hidden mt-3 ">

      {/* ── MAIN HERO AREA ───────────────────────────────────────── */}
      <div className="relative bg-transparent pt-28 pb-4 px-6 md:px-14 z-10 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-10 min-h-[85vh]">

        {/* Neo-Brutalist & Memphis Hero Background */}
        <HeroBackground />

        {/* ── LEFT — copy ─────────────────────────────────────────── */}
        <div className="flex-1 z-10 w-full max-w-[640px]">

          {/* Badge — mirrors Zero Cup's tournament pill */}
          <div className="hero-badge inline-flex items-center gap-2.5 bg-white text-[10px] font-silkscreen font-bold tracking-[0.22em] uppercase px-5 py-2.5 rounded-full border-2 border-[#1C1941] mb-10 shadow-[3px_3px_0_#1C1941]">
            <span className="w-2 h-2  rounded-full bg-[#8AF2CF] border border-[#1C1941] shrink-0" />
            0G Compute Proof Explorer
          </div>

         {/* Title — stacked like "ZERO" / "CUP" */}
          <div className="mb-8 overflow-hidden flex flex-row">
            <div
              className="hero-title-line font-display font-black uppercase text-[#1C1941] leading-[0.85] tracking-[-0.03em]"
              style={{ 
                fontSize: "clamp(76px, 11.5vw, 152px)",
                textShadow: "4px 4px #fff, 7px 7px #241b4a2e"
              }}
            >
              VERI
            </div>
            <div
              className="hero-title-line font-display font-black uppercase text-[#845EEB] leading-[0.85] tracking-[-0.03em] -mt-1"
              style={{ 
                fontSize: "clamp(76px, 11.5vw, 152px)",
                textShadow: "4px 4px #fff, 7px 7px #241b4a2e"
              }}
            >
              0G
            </div>
          </div>

          {/* Description */}
          <p
            className="hero-desc text-[#1C1941]/75 font-medium leading-relaxed max-w-[480px] mb-10"
            style={{ fontSize: "clamp(16px, 1.4vw, 20px)" }}
          >
            Paste a provider address. See whether it&apos;s really running
            inside attested secure hardware — in plain language, not a CLI log.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="hero-btn bg-[#845EEB] text-white px-8 py-[14px] rounded-full font-bold text-[15px] tracking-wide 
             transition-all duration-300 ease-out
             hover:bg-[#7854d6] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#1C1941] 
             shadow-[5px_5px_0_#1C1941] 
             active:translate-y-1 active:shadow-none"
            >
              Start Verifying →
            </Link>
            
            <a
              href="#how-it-works"
              className="hero-btn bg-white text-[#1C1941] px-8 py-[14px] rounded-full font-bold text-[15px] tracking-wide 
             transition-all duration-300 ease-out
             hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#1C1941] 
             shadow-[5px_5px_0_#1C1941] 
             active:translate-y-1 active:shadow-none"
            >
              How it works
            </a>
          </div>
        </div>

        {/* ── RIGHT — receipt card ─────────────────────────────────── */}
        <div className="hero-graphic flex-1 relative w-full max-w-[460px] self-center">

          {/* Floating dark network badge — mirrors Zero Cup's deadline pill */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#1C1941] text-white text-[10px] font-black tracking-[0.2em] uppercase px-5 py-[10px] rounded-full whitespace-nowrap shadow-[3px_3px_0_rgba(28,25,65,0.35)]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#8AF2CF] shrink-0 animate-pulse" />
            Galileo Testnet
          </div>

          {/* Verification card */}
          <div className="relative rounded-[1.75rem] border-4 border-[#1C1941] bg-white overflow-hidden shadow-[14px_14px_0_rgba(28,25,65,0.11)]">

            {/* Traffic-light titlebar */}
            <div className="h-11 border-b-4 border-[#1C1941] bg-white flex items-center px-5 justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4A6B] border-2 border-[#1C1941]" />
                <div className="w-3 h-3 rounded-full bg-[#FFD166] border-2 border-[#1C1941]" />
                <div className="w-3 h-3 rounded-full bg-[#8AF2CF] border-2 border-[#1C1941]" />
              </div>
              <span className="text-[9px] font-black tracking-[0.2em] text-[#1C1941]/30 uppercase">
                verification.receipt
              </span>
            </div>

            {/* Checks */}
            <div className="p-6 space-y-1">
              {CHECKS.map((check, idx) => (
                <div
                  key={check.label}
                  className={`flex items-center justify-between py-3 ${idx < CHECKS.length - 1 ? "border-b border-[#1C1941]/6" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-[8px] border-2 border-[#1C1941] flex items-center justify-center text-xs font-black shadow-[1px_1px_0_#1C1941] shrink-0 ${
                        check.passing
                          ? "bg-[#8AF2CF] text-[#1C1941]"
                          : "bg-[#1C1941]/5 text-[#1C1941]/22"
                      }`}
                    >
                      {check.icon}
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        check.passing ? "text-[#1C1941]" : "text-[#1C1941]/28"
                      }`}
                    >
                      {check.label}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-[0.15em] uppercase px-3 py-1 rounded-full border-2 ${
                      check.passing
                        ? "border-[#1C1941] bg-[#8AF2CF] text-[#1C1941]"
                        : "border-[#1C1941]/15 text-[#1C1941]/25"
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
              ))}

              {/* Signer address */}
              <div className="bg-[#F7F3FF] rounded-2xl border-2 border-[#845EEB]/18 p-4 mt-3">
                <p className="text-[9px] font-black tracking-[0.18em] text-[#845EEB]/45 uppercase mb-2">
                  Attestation Signer
                </p>
                <p className="font-mono text-[11px] text-[#845EEB] break-all leading-relaxed">
                  0x83df4B8EbA7c0B3B740019b8c9a77ffF77D508cF
                </p>
              </div>

              {/* Final verdict badge */}
              <div className="flex justify-center pt-3">
                <span className="bg-[#8AF2CF] text-[#1C1941] text-[9px] font-black tracking-[0.18em] uppercase px-5 py-2 rounded-full border-2 border-[#1C1941] shadow-[2px_2px_0_#1C1941]">
                  Automated checks passed
                </span>
              </div>
            </div>
          </div>

          {/* Shield — now using GSAP float, not animate-float */}
          <div
            ref={shieldRef}
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-[#FFD166] border-4 border-[#1C1941] rounded-2xl rotate-12 flex items-center justify-center shadow-[4px_4px_0_#1C1941]"
          >
            <span className="text-xl" role="img" aria-label="shield">🛡️</span>
          </div>

          {/* Decorative square — border-4, not border-3 */}
          <div
            ref={squareRef}
            className="absolute -top-3 -left-5 w-10 h-10 bg-[#845EEB] border-4 border-[#1C1941] rounded-xl -rotate-6 shadow-[3px_3px_0_#1C1941]"
          />
        </div>
      </div>

    </section>
  );
}