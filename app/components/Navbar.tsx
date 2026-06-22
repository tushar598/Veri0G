"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#overview", label: "Overview" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#what-gets-checked", label: "What gets checked" },
    { href: "#features", label: "Features" },
  ];

  return (
    <nav
      id="main-nav"
      className={`flex items-center justify-between border-y-3 border-[#1C1941] px-8 py-4 fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FDF8F5]/90 backdrop-blur-md border-b border-[#1C1941]/5 shadow-sm"
          : "bg-transparent"
      }`}
    >
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

      {/* Desktop Links */}
      <div className="hidden md:flex space-x-8 font-sans font-bold text-sm text-[#1C1941]">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-[#845EEB] transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#845EEB] hover:after:w-full after:transition-all"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA Button — links to dashboard */}
     <Link
  href="/dashboard"
  className="hidden md:block bg-[#845EEB] text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide 
             transition-all duration-300 ease-out
             hover:bg-[#7854d6] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_#1C1941] 
             shadow-[5px_5px_0_#1C1941] 
             active:translate-y-1 active:shadow-none"
>
  Start Verifying →
</Link>

      {/* Mobile Hamburger */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
      >
        <span
          className={`w-6 h-0.5 bg-[#1C1941] transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
        />
        <span
          className={`w-6 h-0.5 bg-[#1C1941] transition-all ${mobileOpen ? "opacity-0" : ""}`}
        />
        <span
          className={`w-6 h-0.5 bg-[#1C1941] transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
        />
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[#8cebd2] border-b-4 border-[#1C1941] shadow-lg md:hidden">
          <div className="flex flex-col p-8 gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-sans font-bold text-lg text-[#1C1941] hover:text-[#845EEB] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="bg-[#845EEB] text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide text-center shadow-[0_4px_0_#5532ab] active:translate-y-1 active:shadow-none"
            >
              Start Verifying →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}