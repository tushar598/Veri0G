"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Features() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".feature-item");
      if (!items.length) return;

      gsap.from(items, {
        scrollTrigger: {
          trigger: container.current,
          start: "top 90%",
          once: true,
        },
        opacity: 0,
        x: 50,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: container }
  );

  const features = [
    {
      title:
        "One-click TEE verification — paste an address, get a real check run against the live network.",
      highlight: "One-click TEE verification",
    },
    {
      title:
        "Live provider directory — search and browse every active provider, not just the ones you already know about.",
      highlight: "Live provider directory",
    },
    {
      title:
        'Honest verification receipts — "automated checks passed," never "fully verified" when it isn\'t.',
      highlight: "Honest verification receipts",
    },
    {
      title:
        "Full transparency log — every step the verifier performed, available on demand, not hidden.",
      highlight: "Full transparency log",
    },
    {
      title:
        "Zero wallet required to check — fully read-only; no gas, no signing, no funds needed.",
      highlight: "Zero wallet required",
    },
  ];

  return (
    <section
      id="features"
      ref={container}
      className="py-24 px-8 bg-[#8AF2CF] relative overflow-hidden border-b-4 border-[#1C1941]"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        {/* Left column */}
        <div className="lg:w-1/3">
          <h2 className="font-display font-black text-5xl md:text-6xl tracking-tighter mb-6 text-[#1C1941]">
            Features
          </h2>
          <p className="font-sans text-xl font-medium text-[#1C1941] mb-8">
            Everything you need to verify 0G Compute providers — honestly and
            transparently.
          </p>
          <div className="flex flex-col gap-4 items-start">
            <Link
              href="/dashboard"
              className="bg-white text-[#1C1941] px-6 py-3 rounded-full font-bold text-sm tracking-wide shadow-[4px_4px_0_#1C1941] border-2 border-[#1C1941] hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Start Verifying ►
            </Link>
            <a
              href="https://docs.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#1C1941] px-6 py-3 rounded-full font-bold text-sm tracking-wide shadow-[4px_4px_0_#1C1941] border-2 border-[#1C1941] hover:bg-gray-50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Read Documentation ►
            </a>
          </div>
        </div>

        {/* Right column — feature list */}
        <div className="lg:w-2/3 space-y-4 relative z-10">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-item flex items-center gap-6 p-6 font-sans text-lg font-medium text-[#1C1941] border-b-2 border-dashed border-[#1C1941]/20 hover:bg-white/30 transition-colors rounded-xl"
            >
              <div className="w-12 h-8 rounded-full bg-white border-2 border-[#1C1941] flex items-center justify-center font-bold text-sm shrink-0 shadow-[2px_2px_0_#1C1941]">
                0{i + 1}
              </div>
              <p
                dangerouslySetInnerHTML={{
                  __html: feature.title.replace(
                    feature.highlight,
                    `<strong class="text-[#845EEB]">${feature.highlight}</strong>`
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
