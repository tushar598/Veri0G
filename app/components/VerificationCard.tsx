// src/components/VerificationCard.tsx
"use client";

import { useState } from "react";
import type { VerificationResult } from "@/app/types/index";
import { extractHashPair, cleanDockerImage } from "@/app/lib/parseSteps";

function formatPrice(wei: string): string {
  try {
    const value = BigInt(wei);
    if (value === 0n) return "Free";
    const divisor = 10n ** 18n;
    const whole = value / divisor;
    const frac = value % divisor;
    const fracStr = frac.toString().padStart(18, "0").replace(/0+$/, "") || "0";
    return `${whole}.${fracStr} 0G`;
  } catch {
    return `${wei} (raw)`;
  }
}

interface CheckpointProps {
  label: string;
  state: "pass" | "fail" | "manual";
  delayMs: number;
}

function Checkpoint({ label, state, delayMs }: CheckpointProps) {
  const dot =
    state === "pass" ? "bg-signal shadow-[0_0_8px_rgb(var(--signal))]" :
    state === "fail" ? "bg-alert shadow-[0_0_8px_rgb(var(--alert))]" :
    "bg-copper-dim";

  return (
    <div
      className="flex items-center gap-3 motion-safe:animate-[checkpointIn_0.4s_ease-out_both]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      <span className={`font-mono text-sm ${state === "manual" ? "text-ink-dim" : "text-ink"}`}>
        {label}
      </span>
    </div>
  );
}

export function VerificationCard({ result }: { result: VerificationResult }) {
  const [showLog, setShowLog] = useState(false);
  const { service } = result;

  if (!result.found || !service) {
    return (
      <div className="rounded-lg border border-copper-dim/40 bg-substrate-raised p-6 font-body">
        <p className="mb-1 font-mono text-xs text-ink-dim">{result.providerAddress}</p>
        <p className="font-display text-lg text-alert">No service found</p>
        <p className="mt-1 text-sm text-ink-dim">{result.error}</p>
      </div>
    );
  }

  const hashPair = extractHashPair(result.steps);
  const images = Array.from(new Set(result.dockerImages.map(cleanDockerImage)));

  return (
    <div className="overflow-hidden rounded-lg border border-copper-dim/40 bg-substrate-raised font-body">
      <div className="flex items-start justify-between gap-4 border-b border-copper-dim/30 p-6">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-ink-dim" title={result.providerAddress}>
            {result.providerAddress}
          </p>
          <p className="mt-1 font-display text-xl text-ink">{service.model}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded border border-copper-dim/50 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-copper">
              {service.serviceType}
            </span>
            <span className="rounded border border-copper-dim/50 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-copper">
              {service.verifiability || "unverified"}
            </span>
          </div>
        </div>
        <div
          className={`shrink-0 rounded-md border px-3 py-1.5 text-center font-display text-xs font-semibold uppercase tracking-wide ${
            result.isVerified
              ? "border-signal/40 bg-signal/10 text-signal"
              : "border-alert/40 bg-alert/10 text-alert"
          }`}
        >
          {result.isVerified ? "Automated checks passed" : "Checks did not pass"}
        </div>
      </div>

      <div className="space-y-4 p-6">
        <Checkpoint label="Service located on 0G Compute" state="pass" delayMs={0} />
        <Checkpoint
          label="TEE signer address matches contract"
          state={result.signerMatch ? "pass" : "fail"}
          delayMs={120}
        />
        <Checkpoint
          label="Docker compose hash matches event log"
          state={result.composeHashPassed ? "pass" : "fail"}
          delayMs={240}
        />
        <Checkpoint
          label="Full hardware quote verification (manual — not run)"
          state="manual"
          delayMs={360}
        />
      </div>

      {hashPair && (
        <div className="border-t border-copper-dim/30 p-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim">
            Docker compose hash
          </p>
          <div className="space-y-1 font-mono text-xs">
            <p className="break-all text-ink-dim">calc&nbsp; {hashPair.calculated}</p>
            <p className={`break-all ${hashPair.calculated === hashPair.eventLog ? "text-signal" : "text-alert"}`}>
              log&nbsp;&nbsp; {hashPair.eventLog}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 border-t border-copper-dim/30 p-6 text-sm">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-dim">Input price</p>
          <p className="mt-0.5 font-mono text-ink">{formatPrice(service.inputPrice)}</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-dim">Output price</p>
          <p className="mt-0.5 font-mono text-ink">{formatPrice(service.outputPrice)}</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="border-t border-copper-dim/30 p-6">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-dim">
            Verified components
          </p>
          <div className="flex flex-wrap gap-1.5">
            {images.map((img) => (
              <span
                key={img}
                className="rounded border border-copper-dim/40 px-2 py-1 font-mono text-[11px] text-ink-dim"
              >
                {img}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-copper-dim/30">
        <button
          onClick={() => setShowLog((s) => !s)}
          className="flex w-full items-center justify-between p-4 font-mono text-xs text-ink-dim hover:text-copper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
        >
          <span>{showLog ? "Hide" : "View"} full verification log</span>
          <span aria-hidden>{showLog ? "−" : "+"}</span>
        </button>
        {showLog && (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all border-t border-copper-dim/20 bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-ink-dim">
            {result.steps.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}