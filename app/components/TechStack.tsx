"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const techs = [
  {
    name: "0G Compute SDK",
    desc: "Provider registry lookups and attestation verification pipeline",
    badge: "CORE",
    icon: "⚡",
    accentColor: "#845EEB",
    features: ["Provider Registry", "Verification", "API Layer"],
  },
  {
    name: "DStack TEE (Intel TDX)",
    desc: "The actual hardware verification layer that providers run on top of",
    badge: "TEE",
    icon: "🔐",
    accentColor: "#1C1941",
    features: ["Intel TDX", "Hardware Root", "Attestation"],
  },
  {
    name: "0G Chain",
    desc: "On-chain provider registry; source of truth for registered signer addresses",
    badge: "CHAIN",
    icon: "⛓️",
    accentColor: "#845EEB",
    isGradient: true,
    features: ["Registry", "Signer Store", "Source of Truth"],
  },
];

const archSteps = [
  { label: "0G Chain", sublabel: "Provider Registry", color: "#845EEB", bg: "#E5D7FA" },
  { label: "DStack TEE", sublabel: "Attestation Engine", color: "#1C1941", bg: "#FFD166" },
  { label: "Veri0G", sublabel: "Pass / Fail Receipt", color: "#1C1941", bg: "#8AF2CF" },
];

export function TechStack() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".tech-card");
      const diagram = container.current?.querySelector<HTMLElement>(".arch-diagram");

      gsap.set([...cards, ...(diagram ? [diagram] : [])], { opacity: 1, y: 0, x: 0 });

      if (cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%",
            once: true,
          },
          opacity: 0,
          y: 40,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "all",
        });
      }

      if (diagram) {
        gsap.from(diagram, {
          scrollTrigger: {
            trigger: container.current,
            start: "top 85%",
            once: true,
          },
          opacity: 0,
          x: -30,
          duration: 0.8,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="py-28 px-8 bg-[#E5D7FA] border-b-4 border-[#1C1941] relative overflow-hidden"
    >
      {/* Decorative dot grids */}
      <div className="pointer-events-none absolute top-10 right-14 grid grid-cols-7 gap-3 opacity-20">
        {Array.from({ length: 49 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1C1941]" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-10 left-10 grid grid-cols-5 gap-3 opacity-15">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#845EEB]" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border-2 border-[#1C1941]/20 bg-white/60 text-[#1C1941] text-[10px] font-black tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#845EEB]" />
            Infrastructure
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display font-black text-5xl md:text-6xl lg:text-7xl tracking-tighter text-[#1C1941] mb-4">
                Built on{" "}
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #845EEB, #EF4A6B)" }}
                >
                  0G
                </span>
              </h2>
              <p className="font-sans text-xl font-medium text-[#1C1941]/60 max-w-lg">
                Every check runs against real infrastructure — not simulated data.
              </p>
            </div>
            {/* Stack label */}
            <div className="shrink-0 bg-white border-4 border-[#1C1941] rounded-2xl px-5 py-3 shadow-[4px_4px_0_#1C1941]">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#1C1941]/40 mb-1">
                Stack Depth
              </div>
              <div className="font-display font-black text-3xl text-[#1C1941]">
                3 Layers
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="flex flex-col xl:flex-row gap-10 items-start">

          {/* LEFT — Architecture flow diagram */}
          <div className="arch-diagram w-full xl:w-[360px] shrink-0">
            <div
              className="rounded-3xl border-4 border-[#1C1941] bg-white overflow-hidden"
              style={{ boxShadow: "10px 10px 0 #1C1941" }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b-4 border-[#1C1941] bg-[#1C1941]">
                <div className="w-3 h-3 rounded-full bg-[#EF4A6B] border-2 border-white/20" />
                <div className="w-3 h-3 rounded-full bg-[#FFD166] border-2 border-white/20" />
                <div className="w-3 h-3 rounded-full bg-[#8AF2CF] border-2 border-white/20" />
                <span className="ml-2 text-white/50 text-xs font-mono">
                  architecture.flow
                </span>
              </div>

              {/* Diagram body */}
              <div className="p-8 flex flex-col items-center gap-0 bg-[#FDF8F5]">
                {archSteps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center w-full">
                    <div
                      className="w-full rounded-2xl px-5 py-4 border-2 border-[#1C1941] flex justify-between items-center"
                      style={{ background: step.bg }}
                      >
                      <div>
                        <div
                          className="font-display font-black text-sm"
                          style={{ color: step.color }}
                        >
                          {step.label}
                        </div>
                        <div className="text-[#1C1941]/50 text-xs font-medium mt-0.5">
                          {step.sublabel}
                        </div>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-[#1C1941] flex items-center justify-center text-xs font-black"
                        style={{ background: step.color === "#1C1941" ? "#fff" : step.color, color: step.color === "#1C1941" ? "#1C1941" : "#1C1941" }}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {i < archSteps.length - 1 && (
                      <div className="flex flex-col items-center py-3 gap-1">
                        <div className="w-px h-4 bg-[#1C1941]/20" />
                        <svg
                          className="w-4 h-4 text-[#1C1941]/40"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <path d="M8 12L2 6h12L8 12z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}

                {/* Live badge */}
                <div className="mt-6 w-full rounded-xl bg-[#8AF2CF]/30 border-2 border-[#1C1941] px-4 py-3 flex items-center gap-3 shadow-[3px_3px_0_#1C1941]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8AF2CF] border-2 border-[#1C1941] animate-pulse" />
                  <div>
                    <div className="text-[#1C1941] font-black text-xs">
                      Live verification flow
                    </div>
                    <div className="text-[#1C1941]/50 text-[10px] font-mono mt-0.5">
                      Real chain · Real TEE
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#1C1941]/40 font-bold uppercase tracking-wider">
              <span className="w-4 h-px bg-[#1C1941]/30" />
              Data Flow
              <span className="w-4 h-px bg-[#1C1941]/30" />
            </div>
          </div>

          {/* RIGHT — Tech cards */}
          <div className="flex-1 space-y-5">
            {techs.map((tech, i) => (
              <div
                key={i}
                className="tech-card group bg-white border-4 border-[#1C1941] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: "6px 6px 0 #1C1941" }}
              >
                {/* Left accent bar */}
                <div className="flex">
                  <div
                    className="w-1.5 shrink-0"
                    style={{
                      background: tech.isGradient
                        ? "linear-gradient(180deg, #845EEB, #EF4A6B)"
                        : tech.accentColor,
                    }}
                  />
                  <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl border-2 border-[#1C1941]/10"
                      style={{ background: "#E5D7FA" }}
                    >
                      {tech.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3
                          className={`font-display font-black text-xl ${
                            tech.isGradient
                              ? "text-transparent bg-clip-text"
                              : "text-[#1C1941]"
                          }`}
                          style={
                            tech.isGradient
                              ? { backgroundImage: "linear-gradient(135deg, #845EEB, #EF4A6B)" }
                              : undefined
                          }
                        >
                          {tech.name}
                        </h3>
                        <span
                          className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border-2 border-[#845EEB]/40 bg-[#845EEB]/10 text-[#845EEB]"
                        >
                          {tech.badge}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#1C1941]/55 leading-relaxed">
                        {tech.desc}
                      </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      {tech.features.map((f, j) => (
                        <span
                          key={j}
                          className="text-[10px] font-bold tracking-wide uppercase whitespace-nowrap px-3 py-1 rounded-lg bg-[#E5D7FA] text-[#1C1941]/60 border-2 border-[#1C1941]/10"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
