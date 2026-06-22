"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HowItWorks() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray<HTMLElement>(".step-node");
      if (!nodes.length) return;

      gsap.from(nodes, {
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          once: true,
        },
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.12,
        ease: "back.out(1.5)",
      });
    },
    { scope: container }
  );

  const steps = [
    {
      id: 1,
      title: "Submit a provider",
      text: "Paste any 0G Compute provider address, or pick one from the live directory.",
      badge: "STEP 1",
      color: "bg-[#FFD166]",
      icon: "📋",
    },
    {
      id: 2,
      title: "Locate the service",
      text: "Looked up directly from the on-chain 0G Compute provider registry.",
      badge: "STEP 2",
      color: "bg-[#845EEB]",
      icon: "🔗",
    },
    {
      id: 3,
      title: "Run attestation checks",
      text: "The provider\u2019s TEE signer address and docker-compose configuration are checked against its live, signed attestation report.",
      badge: "STEP 3",
      color: "bg-[#845EEB]",
      icon: "🛡️",
    },
    {
      id: 4,
      title: "Get a verification receipt",
      text: "A clear pass/fail result, with the full technical log available if you want to see exactly what was checked.",
      badge: "RESULT",
      color: "bg-[#8AF2CF]",
      icon: "✅",
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={container}
      className="py-24 px-8 max-w-7xl mx-auto bg-[#FDF8F5]"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h2 className="font-display font-black text-5xl md:text-6xl tracking-tighter text-[#1C1941] mb-4">
            How it works
          </h2>
          <p className="font-sans text-lg md:text-xl text-[#1C1941] font-medium">
            From provider address to verified receipt — four steps, fully
            transparent.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-[#1C1941]">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 block bg-[#FFD166] border-2 border-[#1C1941]" />
            Input
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 block bg-[#845EEB] border-2 border-[#1C1941]" />
            Process
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 block bg-[#8AF2CF] border-2 border-[#1C1941]" />
            Output
          </span>
        </div>
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connection line */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-1 bg-[#1C1941]/10 z-0" />

        {steps.map((step) => (
          <div
            key={step.id}
            className="step-node flex flex-col items-center text-center relative z-10"
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center font-black font-display text-3xl mb-6 shadow-[4px_4px_0_#1C1941] border-4 border-[#1C1941] ${step.color}`}
            >
              {step.icon}
            </div>
            <div className="bg-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border-2 border-[#1C1941] mb-4 shadow-[2px_2px_0_#1C1941]">
              {step.badge}
            </div>
            <h3 className="font-bold text-xl mb-2 text-[#1C1941]">
              {step.title}
            </h3>
            <p className="text-sm font-medium text-[#1C1941]/70">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
