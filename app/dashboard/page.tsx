"use client";

import { useState } from "react";
import { DashboardNavbar } from "@/app/components/DashboardNavbar";
import { ProviderSearch } from "@/app/components/ProviderSearch";
import { VerificationCard } from "@/app/components/VerificationCard";
import { ChatInterface } from "@/app/components/ChatInterface";
import type { VerificationResult } from "@/app/types";

export default function DashboardPage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"verify" | "chat">("verify");

  async function handleSelect(providerAddress: string) {
    setLoading(true);
    setResult(null);
    setError(null);
    setActiveTab("verify");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerAddress }),
      });
      const data = await res.json();
      if (data.error && !data.found) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reach the server"
      );
    } finally {
      setLoading(false);
    }
  }

  // Determine if the verified provider supports chat
  const isChatbot =
    result?.found &&
    result.service?.serviceType === "chatbot" &&
    result.isVerified;

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex flex-col">
      <DashboardNavbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-12">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter text-[#1C1941] mb-3">
            Proof Explorer
          </h1>
          <p className="font-sans text-lg text-[#1C1941]/60 font-medium max-w-2xl">
            Paste a provider address or pick one from the live directory.
            We&apos;ll run attestation checks and give you an honest pass/fail
            receipt.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10">
          <ProviderSearch onSelect={handleSelect} />
        </div>

        {/* Loading state */}
        {loading && (
          <div className="rounded-[2rem] border-4 border-[#1C1941] bg-white p-8 shadow-[8px_8px_0_#1C1941]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#845EEB] border-2 border-[#1C1941] flex items-center justify-center shadow-[2px_2px_0_#1C1941]">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-[#1C1941]">
                  Running attestation checks…
                </p>
                <p className="text-sm text-[#1C1941]/40 font-medium">
                  Querying the 0G network and verifying the provider
                </p>
              </div>
            </div>

            {/* Animated progress steps */}
            <div className="space-y-4">
              {[
                "Locating service on 0G Compute…",
                "Fetching attestation report…",
                "Verifying TEE signer address…",
                "Checking docker-compose hash…",
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    animation: `loading-pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#845EEB]/30 border border-[#845EEB]/20" />
                  <span className="font-sans text-sm text-[#1C1941]/30">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-2 bg-[#FDF8F5] rounded-full border-2 border-[#1C1941]/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#845EEB] to-[#8AF2CF] rounded-full"
                style={{ animation: "loading-bar 4s ease-in-out infinite" }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-[2rem] border-4 border-[#EF4A6B] bg-white p-8 shadow-[8px_8px_0_#EF4A6B]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EF4A6B] border-2 border-[#1C1941] flex items-center justify-center shadow-[2px_2px_0_#1C1941]">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-lg text-[#EF4A6B]">
                  Something went wrong
                </p>
                <p className="text-sm text-[#1C1941]/60 font-medium">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Result with optional Chat tab */}
        {result && !loading && (
          <>
            {/* Tab bar — only shown when chat is available */}
            {isChatbot && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab("verify")}
                  className={`rounded-xl border-2 border-[#1C1941] px-5 py-2.5 font-display text-sm font-black tracking-wide transition-all ${
                    activeTab === "verify"
                      ? "bg-[#1C1941] text-white shadow-[3px_3px_0_#845EEB]"
                      : "bg-white text-[#1C1941]/60 hover:bg-[#1C1941]/5 shadow-[3px_3px_0_#1C1941]/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    Verification
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`rounded-xl border-2 border-[#1C1941] px-5 py-2.5 font-display text-sm font-black tracking-wide transition-all ${
                    activeTab === "chat"
                      ? "bg-[#1C1941] text-white shadow-[3px_3px_0_#845EEB]"
                      : "bg-white text-[#1C1941]/60 hover:bg-[#1C1941]/5 shadow-[3px_3px_0_#1C1941]/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    Verified Chat
                    <span className="h-2 w-2 rounded-full bg-[#8AF2CF] animate-pulse" />
                  </span>
                </button>
              </div>
            )}

            {/* Tab content */}
            {activeTab === "verify" && <VerificationCard result={result} />}
            {activeTab === "chat" && isChatbot && (
              <ChatInterface providerAddress={result.providerAddress} />
            )}
          </>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="rounded-[2rem] border-4 border-dashed border-[#1C1941]/15 bg-white/50 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#845EEB]/10 border-2 border-[#845EEB]/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#845EEB]/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <p className="font-display font-bold text-xl text-[#1C1941]/30 mb-2">
              No provider selected
            </p>
            <p className="font-sans text-sm text-[#1C1941]/20 max-w-sm mx-auto">
              Search for a provider address above or pick one from the dropdown
              to run an attestation check.
            </p>
          </div>
        )}

        {/* Info footer */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          {[
            "No wallet required",
            "Read-only verification",
            "Full log available",
          ].map((tag) => (
            <span
              key={tag}
              className="bg-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border-2 border-[#1C1941]/10 text-[#1C1941]/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}