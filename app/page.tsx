// src/app/page.tsx
"use client";

import { useState } from "react";
import { ProviderSearch } from "@/app/components/ProviderSearch";
import { VerificationCard } from "@/app/components/VerificationCard";
import type { VerificationResult } from "@/app/types";

export default function HomePage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSelect(providerAddress: string) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerAddress }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl text-ink">0G Proof Explorer</h1>
      <p className="mt-2 text-ink-dim">
        Check whether a 0G Compute provider is running inside a genuine, attested TEE.
      </p>
      <div className="mt-8">
        <ProviderSearch onSelect={handleSelect} />
      </div>
      <div className="mt-8">
        {loading && <p className="font-mono text-sm text-ink-dim">Running attestation checks…</p>}
        {result && <VerificationCard result={result} />}
      </div>
    </main>
  );
}