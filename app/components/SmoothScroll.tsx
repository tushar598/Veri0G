"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerSync() {
  const lenisRef = useRef<ReturnType<typeof useLenis> | null>(null);

  useLenis((lenis) => {
    lenisRef.current = lenis;
    ScrollTrigger.update();
  });

  useEffect(() => {
    // Connect Lenis scroll events to GSAP ScrollTrigger
    ScrollTrigger.defaults({
      scroller: document.documentElement,
    });
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
