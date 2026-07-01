"use client";

import { useState, useRef, useEffect } from "react";
import type { InferenceResult, VerificationReceipt } from "@/app/types";

// ── sub-components ──────────────────────────────────────────────

// Maps the on-chain verifiability string to display config
const VERIFIABILITY_CONFIG: Record<
  "TeeML" | "TeeTLS" | "" | (string & {}),
  { label: string; bg: string; text: string; dot: string; title: string }
> = {
  TeeML: {
    label: "TeeML",
    bg: "bg-[#845EEB]/15",
    text: "text-[#845EEB]",
    dot: "bg-[#845EEB]",
    title: "Model runs directly inside a Trusted Execution Environment (TEE). Every response is cryptographically signed.",
  },
  TeeTLS: {
    label: "TeeTLS",
    bg: "bg-[#8AF2CF]/20",
    text: "text-[#1C7A5A]",
    dot: "bg-[#8AF2CF]",
    title: "TLS channel terminates inside a TEE enclave. Transport-layer proof only — no per-response model signature.",
  },
  "": {
    label: "Unknown",
    bg: "bg-[#1C1941]/5",
    text: "text-[#1C1941]/40",
    dot: "bg-[#1C1941]/20",
    title: "Verifiability type not reported by this provider.",
  },
};

function VerifiabilityChip({
  value,
}: {
  value?: "TeeML" | "TeeTLS" | "" | null;
}) {
  const key = value ?? "";
  const cfg = VERIFIABILITY_CONFIG[key] ?? VERIFIABILITY_CONFIG[""];
  return (
    <span
      title={cfg.title}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border border-current/20 ${cfg.bg} ${cfg.text} cursor-help`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function HeaderVerifiabilityBadge({
  verifiability,
}: {
  verifiability?: "TeeML" | "TeeTLS" | "" | null;
}) {
  const key = verifiability ?? "";
  const cfg = VERIFIABILITY_CONFIG[key] ?? VERIFIABILITY_CONFIG[""];

  // Before any response arrives, show a neutral skeleton-style pill
  if (verifiability === undefined) {
    return (
      <span className="shrink-0 rounded-xl border-2 border-[#1C1941]/20 bg-[#1C1941]/5 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-[#1C1941]/30 animate-pulse">
        · · ·
      </span>
    );
  }

  const bgMap: Record<string, string> = {
    TeeML: "bg-[#845EEB]",
    TeeTLS: "bg-[#1C7A5A]",
    "": "bg-[#1C1941]/40",
  };

  return (
    <span
      title={cfg.title}
      className={`shrink-0 rounded-xl border-2 border-[#1C1941] ${bgMap[key] ?? bgMap[""]} px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_#1C1941] cursor-help`}
    >
      {cfg.label}
    </span>
  );
}

function ReceiptBadge({ receipt }: { receipt: VerificationReceipt }) {
  const [open, setOpen] = useState(false);

  const verified = receipt.isVerified;
  const skipReason = receipt.skipReason ?? null;
  const time = new Date(receipt.verifiedAt).toLocaleTimeString();

  // Badge label and color change based on what actually happened
  const badgeConfig = verified
    ? {
        label: "TEE verified response",
        dot: "bg-[#1C1941]",
        wrapper:
          "border-[#1C1941] bg-[#8AF2CF] text-[#1C1941] shadow-[2px_2px_0_#1C1941] hover:shadow-[3px_3px_0_#1C1941] hover:-translate-y-px",
      }
    : skipReason === "centralized_provider"
    ? {
        label: "Broker TEE · Model centralized",
        dot: "bg-[#EF4A6B]",
        wrapper:
          "border-[#1C1941]/30 bg-[#FFD166]/30 text-[#1C1941]/70 hover:bg-[#FFD166]/50",
      }
    : skipReason === "signature_fetch_failed"
    ? {
        label: "Signature fetch failed",
        dot: "bg-[#EF4A6B]",
        wrapper:
          "border-[#EF4A6B]/40 bg-[#EF4A6B]/10 text-[#EF4A6B] hover:bg-[#EF4A6B]/20",
      }
    : {
        label: "TEE sig unavailable",
        dot: "bg-[#EF4A6B]",
        wrapper:
          "border-[#1C1941]/30 bg-[#FFD166]/20 text-[#1C1941]/60 hover:bg-[#FFD166]/30",
      };

  // Expanded explanation text per skip reason
  const explanation =
    skipReason === "centralized_provider" ? (
      <>
        Despite the registry showing{" "}
        <code className="bg-[#845EEB]/10 text-[#845EEB] px-1 rounded font-bold">TeeML</code>,
        this provider routes inference through a centralized backend (
        <span className="font-bold text-[#1C1941]/60">Alibaba Cloud / DashScope</span>
        ). The TEE enclave covers the broker routing layer only — per-response model
        signatures are architecturally unavailable. Provider-level attestation still
        passed.
      </>
    ) : skipReason === "signature_fetch_failed" ? (
      <>
        A chatID was returned but the TEE signature could not be fetched from the
        provider. The provider may be temporarily misconfigured or under load. Try
        again — if it persists, the provider may need re-registration.
      </>
    ) : verified ? null : (
      <>
        This provider passed automated attestation checks but did not return a
        per-response TEE signature (
        <code className="bg-[#1C1941]/5 text-[#845EEB] px-1 rounded font-bold">ZG-Res-Key</code>
        ) for this request. Provider-level verification still applies.
      </>
    );

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide transition-all ${badgeConfig.wrapper}`}
      >
        <span className={`h-2 w-2 rounded-full shrink-0 ${badgeConfig.dot}`} />
        {badgeConfig.label}
        <span
          className={`w-5 h-5 rounded-md border-2 border-[#1C1941]/30 flex items-center justify-center text-[10px] font-black transition-transform shrink-0 ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          +
        </span>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border-2 border-[#1C1941]/20 bg-[#FDF8F5] p-4 font-mono text-[11px] space-y-2 shadow-[2px_2px_0_#1C1941]/10">
          {/* Data rows */}
          <div className="flex justify-between gap-4">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
              Chat ID
            </span>
            <span className="text-[#1C1941]/70 break-all text-right">{receipt.chatID}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
              Provider
            </span>
            <span className="text-[#1C1941]/70">
              {receipt.providerAddress.slice(0, 10)}…
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
              Checked at
            </span>
            <span className="text-[#1C1941]/70">{time}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
              TEE signature
            </span>
            <span
              className={`font-bold ${
                verified
                  ? "text-[#1C1941]"
                  : skipReason === "signature_fetch_failed"
                  ? "text-[#EF4A6B]"
                  : "text-[#EF4A6B]"
              }`}
            >
              {verified
                ? "Valid ✓"
                : skipReason === "centralized_provider"
                ? "N/A — centralized model"
                : skipReason === "signature_fetch_failed"
                ? "Fetch failed ✗"
                : "Not returned ✗"}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
              Skip reason
            </span>
            <span className="text-[#1C1941]/50 font-mono">
              {skipReason ?? "none"}
            </span>
          </div>

          <div className="flex justify-between gap-4 items-center">
            <span className="text-[#1C1941]/40 font-bold uppercase tracking-wider text-[10px] shrink-0">
             VERIFIABILITY
            </span>
            <VerifiabilityChip value={receipt.verifiability} />
          </div>

          {/* Explanation */}
          {explanation && (
            <p className="text-[#1C1941]/40 pt-2 leading-relaxed border-t-2 border-[#1C1941]/10 text-[10px]">
              {explanation}
            </p>
          )}

          {/* Verified — show a positive confirmation instead */}
          {verified && (
            <div className="pt-2 border-t-2 border-[#1C1941]/10 flex items-start gap-2">
              <span className="text-[#8AF2CF] text-base leading-none">✓</span>
              <p className="text-[#1C1941]/50 text-[10px] leading-relaxed">
                Response content matches the cryptographic signature produced inside
                the TEE enclave. This proof is tied to the chatID above and cannot
                be forged.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderInline(text: string, isUser: boolean): React.ReactNode[] {
  if (!text) return [];

  // Match inline code, bold, italic
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className={`px-1.5 py-0.5 rounded font-mono text-xs font-semibold border ${
            isUser
              ? "bg-[#1C1941]/30 text-white border-white/20"
              : "bg-[#1C1941]/5 text-[#845EEB] border-[#1C1941]/10"
          }`}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className={`font-bold ${isUser ? "text-white" : "text-[#1C1941]"}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border-2 border-[#1C1941] bg-[#1C1941] text-white shadow-[3px_3px_0_#1C1941] font-mono text-xs w-full max-w-full">
      <div className="bg-[#1C1941]/90 px-4 py-2 text-[10px] uppercase font-black tracking-wider text-[#8AF2CF] border-b-2 border-[#1C1941] flex justify-between items-center">
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="hover:text-white px-2 py-0.5 rounded border border-[#8AF2CF]/30 bg-[#8AF2CF]/10 transition-all active:scale-95 cursor-pointer font-bold"
        >
          {copied ? "Copied! ✓" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre scrollbar-thin scrollbar-thumb-white/20">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedMessage({ content, isUser }: { content: string; isUser: boolean }) {
  const parts = content.split("```");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      // Inside a code block
      const part = parts[i];
      const firstNewline = part.indexOf("\n");
      let lang = "";
      let code = part;
      if (firstNewline !== -1) {
        lang = part.slice(0, firstNewline).trim();
        code = part.slice(firstNewline + 1);
      }
      if (code.endsWith("\n")) {
        code = code.slice(0, -1);
      }
      elements.push(<CodeBlock key={`code-${i}`} code={code} lang={lang} />);
    } else {
      // Outside code blocks
      const textPart = parts[i];
      if (!textPart) continue;

      const lines = textPart.split("\n");
      let currentParagraph: string[] = [];
      let currentList: string[] = [];

      const flushParagraph = (key: string) => {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={key} className="leading-relaxed whitespace-pre-wrap mb-2 last:mb-0">
              {renderInline(currentParagraph.join("\n"), isUser)}
            </p>
          );
          currentParagraph = [];
        }
      };

      const flushList = (key: string) => {
        if (currentList.length > 0) {
          elements.push(
            <ul key={key} className="list-disc pl-5 mb-2.5 last:mb-0 space-y-1">
              {currentList.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {renderInline(item, isUser)}
                </li>
              ))}
            </ul>
          );
          currentList = [];
        }
      };

      for (let j = 0; j < lines.length; j++) {
        const line = lines[j];
        const trimmed = line.trim();

        if (trimmed.startsWith("#")) {
          flushParagraph(`p-${i}-${j}`);
          flushList(`l-${i}-${j}`);

          const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = headerMatch[2];
            if (level === 1) {
              elements.push(
                <h1 key={`h-${i}-${j}`} className={`text-lg font-black font-display mt-3.5 mb-1.5 first:mt-1 ${isUser ? "text-white" : "text-[#1C1941]"}`}>
                  {renderInline(headerText, isUser)}
                </h1>
              );
            } else if (level === 2) {
              elements.push(
                <h2 key={`h-${i}-${j}`} className={`text-base font-black font-display mt-3 mb-1 first:mt-1 ${isUser ? "text-white" : "text-[#1C1941]"}`}>
                  {renderInline(headerText, isUser)}
                </h2>
              );
            } else {
              elements.push(
                <h3 key={`h-${i}-${j}`} className={`text-sm font-bold font-display mt-2.5 mb-1 first:mt-1 ${isUser ? "text-white" : "text-[#1C1941]"}`}>
                  {renderInline(headerText, isUser)}
                </h3>
              );
            }
          } else {
            currentParagraph.push(line);
          }
        } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || (trimmed.match(/^\d+\.\s/) && !isNaN(parseInt(trimmed)))) {
          flushParagraph(`p-${i}-${j}`);

          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            currentList.push(trimmed.slice(2));
          } else {
            flushList(`l-${i}-${j}`);
            const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (match) {
              elements.push(
                <div key={`ol-${i}-${j}`} className="pl-5 mb-2 last:mb-0 flex gap-2 leading-relaxed">
                  <span className={`font-mono text-xs font-bold min-w-[1rem] ${isUser ? "text-white/85" : "text-[#845EEB]"}`}>{match[1]}.</span>
                  <div className="flex-1">{renderInline(match[2], isUser)}</div>
                </div>
              );
            } else {
              currentParagraph.push(line);
            }
          }
        } else if (trimmed === "") {
          flushParagraph(`p-${i}-${j}`);
          flushList(`l-${i}-${j}`);
        } else {
          flushList(`l-${i}-${j}`);
          currentParagraph.push(line);
        }
      }

      flushParagraph(`p-${i}-end`);
      flushList(`l-${i}-end`);
    }
  }

  return <div className="space-y-1.5 w-full">{elements}</div>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  receipt?: VerificationReceipt | null;
  error?: string | null;
  verifiability?: "TeeML" | "TeeTLS" | "";
}

// ── main component ───────────────────────────────────────────────

export function ChatInterface({ providerAddress }: { providerAddress: string }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(`chat_history_${providerAddress.toLowerCase()}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      }
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
          receipt: data.receipt || {
            chatID: "unavailable",
            isVerified: false,
            providerAddress,
            verifiedAt: Date.now(),
            skipReason: null,
            verifiability: "",
          },
          error: data.error,
          verifiability: data.receipt?.verifiability ?? "",
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
        <HeaderVerifiabilityBadge
          verifiability={messages.find((m) => m.role === "assistant")?.verifiability}
        />
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
                  <FormattedMessage content={msg.content} isUser={msg.role === "user"} />
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
                  verifiedAt: 0,
                  skipReason: null,
                  verifiability: "",
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