"use client";

import { useState, useRef, useEffect } from "react";
import type { InferenceResult, VerificationReceipt } from "@/app/types";

// ── sub-components ──────────────────────────────────────────────

function ReceiptBadge({ receipt }: { receipt: VerificationReceipt }) {
  const [open, setOpen] = useState(false);

  const verified = receipt.isVerified;
  const time = new Date(receipt.verifiedAt).toLocaleTimeString();

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition-all ${
          verified
            ? "border-[#1C1941] bg-[#8AF2CF] text-[#1C1941] shadow-[2px_2px_0_#1C1941] hover:shadow-[3px_3px_0_#1C1941] hover:-translate-y-px"
            : "border-[#1C1941]/40 bg-[#FFD166]/20 text-[#1C1941]/70 hover:bg-[#FFD166]/30"
        }`}
      >
        <span className={`h-2 w-2 rounded-full ${verified ? "bg-[#1C1941]" : "bg-[#EF4A6B]"}`} />
        {verified ? "TEE verified response" : "Response received · TEE sig unavailable"}
        <span
          className={`w-5 h-5 rounded-md border-2 border-[#1C1941]/30 flex items-center justify-center text-[10px] font-black transition-transform ${open ? "rotate-45" : ""}`}
          aria-hidden
        >
          +
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border-2 border-[#1C1941]/20 bg-[#FDF8F5] p-4 font-mono text-[11px] space-y-2">
          <div className="flex justify-between">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px]">Chat ID</span>
            <span className="text-[#1C1941]/70 break-all ml-4 text-right">{receipt.chatID}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px]">Provider</span>
            <span className="text-[#1C1941]/70 ml-4">{receipt.providerAddress.slice(0, 10)}…</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px]">Checked at</span>
            <span className="text-[#1C1941]/70">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px]">TEE signature</span>
            <span className={verified ? "text-[#8AF2CF] font-bold" : "text-[#EF4A6B] font-bold"}>
              {verified ? "Valid ✓" : "Not returned by provider"}
            </span>
          </div>
          {!verified && (
            <p className="text-[#1C1941]/40 pt-2 leading-relaxed border-t-2 border-[#1C1941]/10 mt-1 text-[10px]">
              This provider passed automated attestation checks but did not return a
              per-response TEE signature (<code className="bg-[#1C1941]/5 px-1 rounded">ZG-Res-Key</code>) for this request.
              Provider-level verification still applies.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  receipt?: VerificationReceipt | null;
  error?: string | null;
}

// ── main component ───────────────────────────────────────────────

export function ChatInterface({ providerAddress }: { providerAddress: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load chat history from sessionStorage on mount or when provider changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`chat_history_${providerAddress.toLowerCase()}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      } else {
        setMessages([]);
      }
    }
  }, [providerAddress]);

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      sessionStorage.setItem(
        `chat_history_${providerAddress.toLowerCase()}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, providerAddress]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user", content: message } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerAddress, message }),
      });

      const data: InferenceResult = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content || "",
          model: data.model,
          receipt: data.receipt,
          error: data.error,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", error: "Request failed — check your connection" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[2rem] border-4 border-[#1C1941] bg-white shadow-[8px_8px_0_#1C1941] h-[600px]">

      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#1C1941] px-5 py-4 bg-white">
        <div className="min-w-0">
          <p className="font-display font-black text-lg text-[#1C1941]">Verified Inference Chat</p>
          <p className="font-mono text-[11px] text-[#1C1941]/40 truncate max-w-[280px]">
            {providerAddress}
          </p>
        </div>
        <span className="shrink-0 rounded-xl border-2 border-[#1C1941] bg-[#845EEB] px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#1C1941]">
          TeeML
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#FDF8F5]">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#845EEB]/10 border-2 border-[#845EEB]/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#845EEB]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="font-display font-bold text-[#1C1941]/30 text-sm mb-1">
                Send a message
              </p>
              <p className="font-sans text-xs text-[#1C1941]/20 max-w-[280px] leading-relaxed">
                Every response runs through a verified TEE provider and gets a cryptographic receipt.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>

              {/* Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 font-sans text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#845EEB] text-white rounded-br-md border-2 border-[#1C1941] shadow-[3px_3px_0_#1C1941]"
                    : msg.error
                    ? "bg-white text-[#EF4A6B] rounded-bl-md border-2 border-[#EF4A6B] shadow-[3px_3px_0_#EF4A6B]"
                    : "bg-white text-[#1C1941] rounded-bl-md border-2 border-[#1C1941]/20 shadow-[3px_3px_0_#1C1941]/10"
                }`}
              >
                {msg.error ? (
                  <span className="font-mono text-xs font-bold">{msg.error}</span>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>

              {/* Model tag */}
              {msg.role === "assistant" && msg.model && !msg.error && (
                <p className="mt-1.5 font-mono text-[10px] text-[#1C1941]/30 font-bold px-1">{msg.model}</p>
              )}

              {/* Verification receipt */}
              {msg.role === "assistant" && msg.receipt !== undefined && !msg.error && (
                <ReceiptBadge receipt={msg.receipt ?? {
                  chatID: "unavailable",
                  isVerified: false,
                  providerAddress,
                  verifiedAt: Date.now(),
                }} />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border-2 border-[#1C1941]/20 bg-white px-4 py-3 shadow-[3px_3px_0_#1C1941]/10">
              <div className="flex gap-2 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 rounded-full bg-[#845EEB] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
                <span className="font-mono text-[10px] text-[#1C1941]/30 font-bold ml-2">
                  Running verified inference…
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t-4 border-[#1C1941] p-4 flex gap-3 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={loading}
          placeholder="Ask anything — response will be TEE-verified…"
          className="flex-1 rounded-xl border-2 border-[#1C1941]/20 bg-[#FDF8F5] px-4 py-3 font-sans text-sm text-[#1C1941] placeholder:text-[#1C1941]/30 focus:border-[#845EEB] focus:outline-none focus:shadow-[3px_3px_0_#845EEB] focus:-translate-y-px disabled:opacity-50 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="rounded-xl border-2 border-[#1C1941] bg-[#845EEB] px-5 py-3 font-display text-sm font-black text-white shadow-[3px_3px_0_#1C1941] hover:shadow-[4px_4px_0_#1C1941] hover:-translate-y-px active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0_#1C1941] transition-all"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}