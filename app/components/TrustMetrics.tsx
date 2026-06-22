"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function TrustMetrics() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".metric-card");
      if (!cards.length) return;

      // Ensure elements are visible before animation fires
      gsap.set(cards, { opacity: 1, y: 0 });

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
    },
    { scope: container }
  );

  const checks = [
    {
      title: "Service Found",
      icon: "🔍",
      status: "Pass / Fail",
      statusColor: "bg-[#8AF2CF] text-[#1C1941]",
      dotColor: "bg-[#1C1941]",
      value: "Active",
      valueColor: "text-[#1C1941]",
      desc: "Is this a real, currently active 0G Compute provider on the network?",
      accent: "#845EEB",
    },
    {
      title: "TEE Signer Match",
      icon: "🛡️",
      status: "Pass / Fail",
      statusColor: "bg-[#8AF2CF] text-[#1C1941]",
      dotColor: "bg-[#1C1941]",
      value: "Verified",
      valueColor: "text-[#845EEB]",
      desc: "Does the attestation report's signer match what's registered on-chain?",
      accent: "#845EEB",
    },
    {
      title: "Compose Hash Match",
      icon: "📦",
      status: "Pass / Fail",
      statusColor: "bg-[#8AF2CF] text-[#1C1941]",
      dotColor: "bg-[#1C1941]",
      value: "Verified",
      valueColor: "text-[#845EEB]",
      desc: "Does the running configuration match what was attested at deployment?",
      accent: "#845EEB",
    },
    {
      title: "Verification Method",
      icon: "⚙️",
      status: "Per Provider",
      statusColor: "bg-[#FFD166] text-[#1C1941]",
      dotColor: "bg-[#1C1941]",
      value: "DStack",
      valueColor: "text-[#1C1941]",
      desc: "Which TEE technology is in use — shown per provider since it can vary.",
      accent: "#FFD166",
    },
    {
      title: "Manual Checks",
      icon: "📝",
      status: "Not Run",
      statusColor: "bg-white/60 text-[#1C1941]/60",
      dotColor: "bg-[#1C1941]/30",
      value: "Disclosed",
      valueColor: "text-[#1C1941]/50",
      desc: "Full verification includes manual image-integrity and quote checks the SDK documents but doesn't run automatically. We say this plainly.",
      accent: "#A292E4",
    },
  ];

  return (
    <section
      id="what-gets-checked"
      ref={container}
      className="py-24 px-8 bg-[#A292E4] relative overflow-hidden border-y-4 border-[#1C1941]"
    >
      {/* Subtle decorative dots */}
      <div className="pointer-events-none absolute top-8 right-12 grid grid-cols-6 gap-3 opacity-20">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1C1941]" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-8 left-12 grid grid-cols-6 gap-3 opacity-20">
        {Array.from({ length: 36 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1C1941]" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border-2 border-[#1C1941]/30 bg-white/30 text-[#1C1941] text-[10px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C1941]" />
              Verification Signals
            </div>
            <h2 className="font-display font-black text-5xl md:text-6xl tracking-tighter mb-4 text-[#1C1941]">
              What gets checked
            </h2>
            <p className="font-sans text-xl font-medium text-[#1C1941]/70">
              Every verification produces clear, auditable signals. No fabricated
              scores — just honest pass/fail checks.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {[
              { label: "Pass", color: "bg-[#8AF2CF]" },
              { label: "Variable", color: "bg-[#FFD166]" },
              { label: "Disclosed", color: "bg-white/60" },
            ].map((l) => (
              <span
                key={l.label}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1941]/70"
              >
                <span
                  className={`w-3 h-3 rounded-full border-2 border-[#1C1941] ${l.color}`}
                />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {checks.map((check, i) => (
            <div
              key={i}
              className="metric-card group bg-white border-4 border-[#1C1941] rounded-2xl overflow-hidden shadow-[6px_6px_0_#1C1941] hover:shadow-[10px_10px_0_#1C1941] hover:-translate-y-1 transition-all duration-300"
            >
              {/* Accent top bar */}
              <div
                className="h-1 w-full"
                style={{ background: check.accent }}
              />

              <div className="p-6">
                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 border-[#1C1941]/10 bg-[#E5D7FA]"
                    >
                      {check.icon}
                    </div>
                    <h3 className="font-display font-bold text-base text-[#1C1941] leading-tight">
                      {check.title}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border-2 border-[#1C1941] ${check.statusColor}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${check.dotColor}`} />
                    {check.status}
                  </span>
                </div>

                {/* Divider */}
                <div className="mb-4 h-px bg-gray-100" />

                {/* Value */}
                <div
                  className={`font-display font-black text-3xl mb-3 ${check.valueColor}`}
                >
                  {check.value}
                </div>

                {/* Description */}
                <p className="font-sans text-sm font-medium text-[#1C1941]/60 leading-relaxed">
                  {check.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
