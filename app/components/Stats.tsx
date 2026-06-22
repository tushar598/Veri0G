export function Stats() {
  const stats = [
    { label: "PROTOCOL", value: "0G Compute" },
    { label: "TEE STACK", value: "DStack — Intel TDX" },
    { label: "VERIFICATION", value: "Pass / Fail" },
    { label: "WALLET NEEDED", value: "None — read-only" },
  ];

  return (
    <div className="border-b-4 border-[#1C1941] bg-white relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-[#1C1941]">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex-1 px-8 py-6 flex flex-col justify-center group hover:bg-[#845EEB]/5 transition-colors"
          >
            <div className="text-[10px] font-bold tracking-widest text-[#1C1941]/50 uppercase mb-1">
              {stat.label}
            </div>
            <div className="font-display font-bold text-xl md:text-2xl text-[#1C1941] group-hover:text-[#845EEB] transition-colors">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
