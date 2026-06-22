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
    const fracStr =
      frac
        .toString()
        .padStart(18, "0")
        .replace(/0+$/, "") || "0";
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
  const dotStyle =
    state === "pass"
      ? "bg-[#8AF2CF] border-[#1C1941] shadow-[0_0_8px_rgba(138,242,207,0.5)]"
      : state === "fail"
        ? "bg-[#EF4A6B] border-[#1C1941] shadow-[0_0_8px_rgba(239,74,107,0.5)]"
        : "bg-[#1C1941]/10 border-[#1C1941]/20";

  const textStyle =
    state === "manual"
      ? "text-[#1C1941]/40"
      : "text-[#1C1941]";

  return (
    <div
      className="flex items-center gap-4 motion-safe:animate-[checkpointIn_0.4s_ease-out_both]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <span
        className={`h-3 w-3 shrink-0 rounded-full border-2 ${dotStyle}`}
        aria-hidden
      />
      <span className={`font-sans text-sm font-medium ${textStyle}`}>
        {label}
      </span>
      {state === "pass" && (
        <span className="ml-auto text-[10px] font-black tracking-widest uppercase text-[#1C1941] bg-[#8AF2CF] px-2 py-0.5 rounded-full border-2 border-[#1C1941]">
          Pass
        </span>
      )}
      {state === "fail" && (
        <span className="ml-auto text-[10px] font-black tracking-widest uppercase text-white bg-[#EF4A6B] px-2 py-0.5 rounded-full border-2 border-[#1C1941]">
          Fail
        </span>
      )}
      {state === "manual" && (
        <span className="ml-auto text-[10px] font-bold tracking-widest uppercase text-[#1C1941]/30 bg-[#1C1941]/5 px-2 py-0.5 rounded-full border-2 border-[#1C1941]/10">
          Manual
        </span>
      )}
    </div>
  );
}

export function VerificationCard({
  result,
}: {
  result: VerificationResult;
}) {
  const [showLog, setShowLog] = useState(false);
  const { service } = result;

  if (!result.found || !service) {
    return (
      <div className="rounded-[2rem] border-4 border-[#1C1941] bg-white p-8 shadow-[8px_8px_0_#1C1941]">
        <p className="mb-2 font-mono text-xs text-[#1C1941]/40 break-all">
          {result.providerAddress}
        </p>
        <p className="font-display font-black text-2xl text-[#EF4A6B]">
          No service found
        </p>
        <p className="mt-2 text-sm font-medium text-[#1C1941]/60">
          {result.error}
        </p>
      </div>
    );
  }

  const hashPair = extractHashPair(result.steps);
  const images = Array.from(
    new Set(result.dockerImages.map(cleanDockerImage))
  );

  return (
    <div className="overflow-hidden rounded-[2rem] border-4 border-[#1C1941] bg-white shadow-[8px_8px_0_#1C1941]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b-4 border-[#1C1941] p-6">
        <div className="min-w-0">
          <p
            className="truncate font-mono text-xs text-[#1C1941]/40"
            title={result.providerAddress}
          >
            {result.providerAddress}
          </p>
          <p className="mt-1 font-display font-black text-2xl text-[#1C1941]">
            {service.model}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-[#1C1941] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#845EEB] bg-[#845EEB]/5">
              {service.serviceType}
            </span>
            <span className="rounded-full border-2 border-[#1C1941] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#845EEB] bg-[#845EEB]/5">
              {service.verifiability || "unverified"}
            </span>
          </div>
        </div>
        <div
          className={`shrink-0 rounded-xl border-4 px-4 py-2 text-center font-display text-xs font-black uppercase tracking-widest ${
            result.isVerified
              ? "border-[#1C1941] bg-[#8AF2CF] text-[#1C1941] shadow-[3px_3px_0_#1C1941]"
              : "border-[#1C1941] bg-[#EF4A6B] text-white shadow-[3px_3px_0_#1C1941]"
          }`}
        >
          {result.isVerified
            ? "Automated checks passed"
            : "Checks did not pass"}
        </div>
      </div>

      {/* Checkpoints */}
      <div className="space-y-5 p-6">
        <Checkpoint
          label="Service located on 0G Compute"
          state="pass"
          delayMs={0}
        />
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

      {/* Hash comparison */}
      {hashPair && (
        <div className="border-t-4 border-[#1C1941] p-6">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1941]/40">
            Docker compose hash
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#1C1941]/30 w-8">
                calc
              </span>
              <span className="break-all text-[#1C1941]/60">
                {hashPair.calculated}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#1C1941]/30 w-8">
                log
              </span>
              <span
                className={`break-all ${
                  hashPair.calculated === hashPair.eventLog
                    ? "text-[#8AF2CF]"
                    : "text-[#EF4A6B]"
                }`}
              >
                {hashPair.eventLog}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4 border-t-4 border-[#1C1941] p-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1941]/40">
            Input price
          </p>
          <p className="mt-1 font-display font-bold text-lg text-[#1C1941]">
            {formatPrice(service.inputPrice)}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1941]/40">
            Output price
          </p>
          <p className="mt-1 font-display font-bold text-lg text-[#1C1941]">
            {formatPrice(service.outputPrice)}
          </p>
        </div>
      </div>

      {/* Docker images */}
      {images.length > 0 && (
        <div className="border-t-4 border-[#1C1941] p-6">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1C1941]/40">
            Verified components
          </p>
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <span
                key={img}
                className="rounded-full border-2 border-[#1C1941]/20 bg-[#FDF8F5] px-3 py-1.5 font-mono text-[11px] text-[#1C1941]/60"
              >
                {img}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full log toggle */}
      <div className="border-t-4 border-[#1C1941]">
        <button
          id="toggle-verification-log"
          onClick={() => setShowLog((s) => !s)}
          className="flex w-full items-center justify-between p-5 font-sans font-bold text-sm text-[#1C1941]/60 hover:text-[#845EEB] hover:bg-[#845EEB]/5 transition-all"
        >
          <span>
            {showLog ? "Hide" : "View"} full verification log
          </span>
          <span
            className={`w-6 h-6 rounded-lg border-2 border-[#1C1941] flex items-center justify-center text-xs font-black transition-transform ${showLog ? "rotate-45" : ""}`}
            aria-hidden
          >
            +
          </span>
        </button>
        {showLog && (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all border-t-2 border-[#1C1941]/10 bg-[#1C1941] p-6 font-mono text-[11px] leading-relaxed text-[#8AF2CF]/80">
            {result.steps.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}