// src/lib/zeroG.ts
import "server-only"; // npm i server-only — hard-fails the build if this ever gets imported client-side

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import os from "os";
import path from "path";
import fs from "fs/promises";

// ---------- Types ----------

export interface ServiceInfo {
  provider: string;
  serviceType: string;
  url: string;
  model: string;
  inputPrice: string;  // bigint stringified — safe to JSON-serialize
  outputPrice: string;
  updatedAt: string;
  verifiability: "TeeML" | "TeeTLS" | "";
}

export interface VerificationResult {
  providerAddress: string;
  found: boolean;
  service: ServiceInfo | null;
  isVerified: boolean;
  signerMatch: boolean;
  composeHashPassed: boolean;
  dockerImages: string[];
  steps: string[];
  error: string | null;
}

// ---------- Broker singleton (reused across warm invocations) ----------

type Broker = Awaited<ReturnType<typeof createZGComputeNetworkBroker>>;
let brokerPromise: Promise<Broker> | null = null;

function buildBroker(): Promise<Broker> {
  const rpcUrl = process.env.ZERO_G_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "PRIVATE_KEY is not set. Generate a throwaway key — e.g. `node -e \"console.log(require('ethers').Wallet.createRandom().privateKey)\"` " +
      "— and put it in .env.local. No funds are required: listService and verifyService are read-only."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return createZGComputeNetworkBroker(wallet);
}

export async function getZeroGBroker(): Promise<Broker> {
  if (!brokerPromise) {
    brokerPromise = buildBroker().catch((err) => {
      brokerPromise = null; // don't cache a dead promise — let the next request retry
      throw err;
    });
  }
  return brokerPromise;
}

// ---------- Service discovery ----------

function normalizeService(raw: any): ServiceInfo {
  return {
    provider: raw.provider,
    serviceType: raw.serviceType,
    url: raw.url,
    model: raw.model,
    inputPrice: raw.inputPrice?.toString() ?? "0",
    outputPrice: raw.outputPrice?.toString() ?? "0",
    updatedAt: raw.updatedAt?.toString() ?? "0",
    verifiability: raw.verifiability ?? "",
  };
}

const PROVIDERS_CACHE_TTL_MS = 60_000;
let providersCache: { data: ServiceInfo[]; fetchedAt: number } | null = null;

export async function listProviders(): Promise<ServiceInfo[]> {
  const now = Date.now();
  if (providersCache && now - providersCache.fetchedAt < PROVIDERS_CACHE_TTL_MS) {
    return providersCache.data;
  }

  const broker = await getZeroGBroker();
  const services = await broker.inference.listService();
  const normalized = services.map(normalizeService);

  providersCache = { data: normalized, fetchedAt: now };
  return normalized;
}

export async function getProviderService(
  providerAddress: string
): Promise<ServiceInfo | null> {
  if (!ethers.isAddress(providerAddress)) {
    throw new Error("Invalid provider address format");
  }
  const services = await listProviders();
  const target = providerAddress.toLowerCase();
  return services.find((s) => s.provider.toLowerCase() === target) ?? null;
}

// ---------- Verification (the core feature) ----------

export async function verifyProvider(
  providerAddress: string
): Promise<VerificationResult> {
  const steps: string[] = [];
  const fail = (
    error: string,
    found = false,
    service: ServiceInfo | null = null
  ): VerificationResult => ({
    providerAddress, found, service, isVerified: false,
    signerMatch: false, composeHashPassed: false, dockerImages: [], steps, error,
  });

  if (!ethers.isAddress(providerAddress)) {
    return fail("Invalid provider address format");
  }

  let broker: Broker;
  let service: ServiceInfo | null;
  try {
    broker = await getZeroGBroker();
    service = await getProviderService(providerAddress);
  } catch (err) {
    // Broker init / RPC failure — an infra problem, distinct from "verification failed"
    return fail(
      err instanceof Error ? `Network error: ${err.message}` : "Could not reach the 0G network"
    );
  }

  if (!service) {
    return fail("No active service found for this provider address on the 0G Compute Network");
  }

  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "0g-verify-"));
  try {
    const result = await broker.inference.verifyService(
      providerAddress,
      outDir,
      (step: { message: string }) => steps.push(step.message)
    );

    if (!result) {
      return fail("Verification returned no result", true, service);
    }

    const signerMatch = !!result.signerVerification?.allMatch;
    const composeHashPassed = !!result.composeVerification?.passed;

    return {
      providerAddress, found: true, service,
      isVerified: signerMatch && composeHashPassed,
      signerMatch, composeHashPassed,
      dockerImages: result.dockerImages ?? [],
      steps, error: null,
    };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Verification failed", true, service);
  } finally {
    fs.rm(outDir, { recursive: true, force: true }).catch(() => {});
  }
}


// ─────────────────────────────────────────────
// TIER 1 — Verified Inference
// ─────────────────────────────────────────────

export interface VerificationReceipt {
  chatID: string;
  isVerified: boolean;
  providerAddress: string;
  verifiedAt: number;
}

export interface InferenceResult {
  content: string;
  model: string;
  providerAddress: string;
  receipt: VerificationReceipt | null;
  error: string | null;
}

// One-time per-provider setup: acknowledge the provider's TEE signer.
// Safe to call multiple times — idempotent on-chain.
// Must be called before the first inference with a provider.
const acknowledgedProviders = new Set<string>();

async function ensureProviderAcknowledged(
  broker: Broker,
  providerAddress: string
): Promise<void> {
  const key = providerAddress.toLowerCase();
  if (acknowledgedProviders.has(key)) return;
  await broker.inference.acknowledgeProviderSigner(providerAddress);
  acknowledgedProviders.add(key);
}

export async function runVerifiedInference(
  providerAddress: string,
  userMessage: string
): Promise<InferenceResult> {
  const fail = (error: string): InferenceResult => ({
    content: "", model: "", providerAddress, receipt: null, error,
  });

  if (!ethers.isAddress(providerAddress)) {
    return fail("Invalid provider address format");
  }
  if (!userMessage.trim()) {
    return fail("Message cannot be empty");
  }

  let broker: Broker;
  try {
    broker = await getZeroGBroker();
  } catch (err) {
    return fail(err instanceof Error ? `Network error: ${err.message}` : "Could not reach 0G network");
  }

  try {
    // 1. Confirm this is a real, active provider
    const service = await getProviderService(providerAddress);
    if (!service) {
      return fail("No active service found for this provider address");
    }
    if (service.serviceType !== "chatbot") {
      return fail(`This provider runs '${service.serviceType}', not a chatbot — chat not supported`);
    }

    // 2. One-time provider acknowledgment
    await ensureProviderAcknowledged(broker, providerAddress);

    // 3. Get service endpoint + model
    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

    // 4. Generate single-use request headers — NEW headers every request, never reuse
    const headers = await broker.inference.getRequestHeaders(providerAddress);

    // 5. Make the actual inference call
    const inferenceRes = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!inferenceRes.ok) {
      const errBody = await inferenceRes.text().catch(() => "");
      // Common causes: insufficient ledger funds, provider offline
      return fail(`Provider returned ${inferenceRes.status}: ${errBody || inferenceRes.statusText}`);
    }

    const data = await inferenceRes.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return fail("Provider returned an empty response");
    }

    // 6. Extract chatID — header first, body fallback
    const chatID: string | null =
      inferenceRes.headers.get("ZG-Res-Key") ||
      inferenceRes.headers.get("zg-res-key") ||
      data.id ||
      null;

    // 7. Verify the response via TEE signature
    // processResponse(providerAddress, content, chatID)
    // Also handles fee settlement — must be called even on failure
    let receipt: VerificationReceipt | null = null;
    if (chatID) {
      try {
        const isVerified = await broker.inference.processResponse(
          providerAddress,
          content,
          chatID
        );
        receipt = {
          chatID,
          isVerified: !!isVerified,
          providerAddress,
          verifiedAt: Date.now(),
        };
      } catch (verifyErr) {
        // Verification failed but we still have the response — surface both
        console.log("verify err", verifyErr);
        receipt = {
          chatID,
          isVerified: false,
          providerAddress,
          verifiedAt: Date.now(),
        };
      }
    }
    // chatID being null means this provider didn't return one —
    // we still return the content, just without a receipt

    return { content, model, providerAddress, receipt, error: null };

  } catch (err) {
    // Most common real-world cause: "Your account doesn't have enough funds"
    const msg = err instanceof Error ? err.message : "Inference failed";
    if (msg.toLowerCase().includes("fund") || msg.toLowerCase().includes("balance")) {
      return fail(`Insufficient ledger funds. Fund your wallet at faucet.0g.ai and ensure your account has a ledger with ≥3 OG.`);
    }
    return fail(msg);
  }
}