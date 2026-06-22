"use client";

import { useState } from "react";
import SmoothScroll from "@/app/components/SmoothScroll";
import { Navbar } from "@/app/components/Navbar";
import { Hero } from "@/app/components/Hero";
import { Stats } from "@/app/components/Stats";
import { HowItWorks } from "@/app/components/HowItWorks";
import { TrustMetrics } from "@/app/components/TrustMetrics";
import { Features } from "@/app/components/Features";
import { TechStack } from "@/app/components/TechStack";
import { Footer } from "@/app/components/Footer";
import { LoadingState } from "@/app/components/LoadingState";

// Module-level flag: resets on hard refresh, persists across client-side navigation
let hasLoadedOnce = false;

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(hasLoadedOnce);
  const [showLoader, setShowLoader] = useState(!hasLoadedOnce);

  const handleLoadingComplete = () => {
    setIsLoaded(true);
  };

  const handleLoadingUnmount = () => {
    setShowLoader(false);
    hasLoadedOnce = true;
  };

  return (
    <>
      {showLoader && (
        <LoadingState 
          onComplete={handleLoadingComplete} 
          onUnmount={handleLoadingUnmount} 
        />
      )}
      <SmoothScroll>
        <div className="min-h-screen selection:bg-[#845EEB] selection:text-white flex flex-col relative w-full border-x-8 border-[#1C1941] max-w-[1920px] mx-auto shadow-2xl overflow-x-hidden">
          <Navbar />
          <main className="flex-1 w-full pt-16">
            <Hero isLoaded={isLoaded} />
            <Stats />
            <HowItWorks />
            <TrustMetrics />
            <Features />
            <TechStack />
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </>
  );
}