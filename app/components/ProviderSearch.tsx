// src/components/ProviderSearch.tsx
"use client";

import { useMemo, useState } from "react";
import { useProviders } from "@/app/hooks/useProviders";

export function ProviderSearch({ onSelect }: { onSelect: (providerAddress: string) => void }) {
  const { providers, loading } = useProviders();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return providers.slice(0, 8);
    return providers
      .filter(
        (p) =>
          p.provider.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.serviceType.toLowerCase().includes(q)
      )
      .slice(0, 8);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) submit(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Paste a provider address, or search by model…"
          className="w-full rounded-lg border border-copper-dim/40 bg-substrate-raised px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
        />
      </form>

      {open && (loading || matches.length > 0) && (
        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-copper-dim/40 bg-substrate-raised shadow-xl">
          {loading ? (
            <li className="px-4 py-3 font-mono text-xs text-ink-dim">Loading providers…</li>
          ) : (
            matches.map((p) => (
              <li key={p.provider}>
                <button
                  type="button"
                  onClick={() => submit(p.provider)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-copper-dim/10 focus-visible:bg-copper-dim/10 focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs text-ink-dim">{p.provider}</span>
                    <span className="block truncate font-display text-sm text-ink">{p.model}</span>
                  </span>
                  <span className="shrink-0 rounded border border-copper-dim/40 px-1.5 py-0.5 font-mono text-[10px] uppercase text-copper">
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