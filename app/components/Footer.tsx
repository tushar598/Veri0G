import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#2B2748] text-white pt-24 pb-8 px-8 border-t-4 border-[#1C1941] relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-24 relative z-10">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="font-display font-black text-5xl md:text-6xl tracking-tighter mb-4 text-[#8AF2CF] flex items-center justify-center md:justify-start gap-4">
            <span className="text-4xl">🔍</span> Ready to check a provider?
          </h2>
          <p className="font-sans text-lg font-medium text-gray-300">
            Paste a provider address, get an honest verification receipt. No
            SDK, no wallet, no code.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="bg-[#845EEB] text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-[#6d45d9] transition-all shadow-[0_6px_0_#5532ab] active:translate-y-1 active:shadow-[0_2px_0_#5532ab] border-2 border-transparent"
        >
          Start Verifying ►
        </Link>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm font-bold text-gray-400 border-t border-gray-600/50 pt-8 relative z-10">
        <div>Veri0G 2026 · 0G Compute Proof Explorer · Zero Gravity Labs</div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <a
            href="https://0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            0G.ai
          </a>
          <a
            href="https://docs.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Docs
          </a>
          <a
            href="#overview"
            className="hover:text-white transition-colors flex items-center gap-2"
          >
            <span>↑ Back to top</span>
          </a>
        </div>
      </div>

      {/* Decorative Dots */}
      <div className="absolute right-0 bottom-0 text-[100px] leading-none text-[#1C1941]/20 font-black tracking-[0.2em] transform translate-x-12 translate-y-12">
        ......
      </div>
    </footer>
  );
}
