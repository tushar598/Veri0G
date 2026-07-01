"use client";

import { useMemo, useState } from "react";
import { useProviders } from "@/app/hooks/useProviders";

export function ProviderSearch({
  onSelect,
  defaultValue,
}: {
  onSelect: (providerAddress: string) => void;
  /** Pre-fill the search input (used for deep-link auto-verify). */
  defaultValue?: string;
}) {
  const { providers, loading } = useProviders();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        p.provider.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.serviceType.toLowerCase().includes(q)
    );
  }, [providers, query]);

  function submit(address: string) {
    setQuery(address);
    setOpen(false);
    onSelect(address);
  }

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      {/* Search input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) submit(query.trim());
        }}
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1941]/40">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            id="provider-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Paste a provider address, or search by model…"
            className="w-full rounded-2xl border-4 border-[#1C1941] bg-white pl-12 pr-4 py-4 font-sans text-sm text-[#1C1941] placeholder:text-[#1C1941]/30 shadow-[4px_4px_0_#1C1941] focus:shadow-[6px_6px_0_#1C1941] focus:-translate-y-0.5 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#845EEB] text-white px-4 py-2 rounded-xl font-bold text-xs tracking-wide hover:bg-[#6d45d9] transition-all border-2 border-[#1C1941] shadow-[2px_2px_0_#1C1941] active:translate-y-0.5 active:shadow-none"
          >
            Verify
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {open && (loading || matches.length > 0) && (
        <ul className="absolute z-10 mt-3 w-full max-h-80 overflow-y-auto rounded-2xl border-4 border-[#1C1941] bg-white shadow-[8px_8px_0_#1C1941] scrollbar-thin scrollbar-thumb-[#845EEB]/30 scrollbar-track-transparent">
          {loading ? (
            <li className="px-6 py-4 font-sans text-sm text-[#1C1941]/50 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#845EEB] border-t-transparent rounded-full animate-spin" />
              Loading providers…
            </li>
          ) : (
            matches.map((p) => (
              <li key={p.provider} className="border-b-2 border-[#1C1941]/5 last:border-b-0">
                <button
                  type="button"
                  onClick={() => submit(p.provider)}
                  className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left hover:bg-[#845EEB]/5 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs text-[#1C1941]/40">
                      {p.provider}
                    </span>
                    <span className="block truncate font-display font-bold text-sm text-[#1C1941] mt-0.5">
                      {p.model}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full border-2 border-[#1C1941] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#845EEB] bg-[#845EEB]/5">
                    {p.verifiability || "—"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}