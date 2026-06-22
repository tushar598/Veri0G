"use client";

import Link from "next/link";

export function DashboardNavbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b-4 border-[#1C1941] sticky top-0 z-50">
      {/* Logo — links to home */}
      <Link
        href="/"
        className="flex items-center space-x-2 text-[#1C1941] font-display font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity"
      >
        <span className="w-8 h-8 bg-[#845EEB] rounded-lg flex items-center justify-center text-white text-sm font-black border-2 border-[#1C1941] shadow-[2px_2px_0_#1C1941]">
          0G
        </span>
        <span>
          Veri<span className="text-[#845EEB]">0G</span>
        </span>
      </Link>

      {/* Page title */}
      <div className="hidden md:block">
        <span className="bg-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border-2 border-[#1C1941] shadow-[2px_2px_0_#1C1941]">
          Proof Explorer
        </span>
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="flex items-center gap-2 font-sans font-bold text-sm text-[#1C1941] hover:text-[#845EEB] transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">Back to Home</span>
      </Link>
    </nav>
  );
}
