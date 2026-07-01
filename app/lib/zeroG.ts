
// src/app/lib/zeroG.ts
import "server-only";

import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0gfoundation/0g-compute-ts-sdk";
import os from "os";
import path from "path";
import fs from "fs/promises";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ServiceInfo {
  provider: string;
  serviceType: string;
  url: string;
  model: string;
  inputPrice: string;
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

export interface VerificationReceipt {
  chatID: string;
  isVerified: boolean;
  providerAddress: string;
  verifiedAt: number;
  skipReason: "centralized_provider" | "signature_fetch_failed" | null;
  verifiability: "TeeML" | "TeeTLS" | "";
}

export interface InferenceResult {
  content: string;
  model: string;
  providerAddress: string;
  receipt: VerificationReceipt | null;
  error: string | null;
}

// ─────────────────────────────────────────────
// Broker singleton
// ─────────────────────────────────────────────

type Broker = Awaited<ReturnType<typeof createZGComputeNetworkBroker>>;
let brokerPromise: Promise<Broker> | null = null;

function buildBroker(): Promise<Broker> {
  const rpcUrl = process.env.ZERO_G_RPC_URL || "https://evmrpc-testnet.0g.ai";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "PRIVATE_KEY is not set. Generate a throwaway key — e.g. " +
      "`node -e \"console.log(require('ethers').Wallet.createRandom().privateKey)\"` " +
      "— and put it in .env.local."
    );
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  return createZGComputeNetworkBroker(wallet);
}

export async function getZeroGBroker(): Promise<Broker> {
  if (!brokerPromise) {
    brokerPromise = buildBroker().catch((err) => {
      brokerPromise = null;
      throw err;
    });
  }
  return brokerPromise;
}

// ─────────────────────────────────────────────
// Router API — model catalog (authoritative verifiability source)
// ─────────────────────────────────────────────

// The 0G router catalog at https://router-api.0g.ai/v1/models carries
// accurate TeeML / TeeTLS values per model-id and is updated by 0G regularly.
// We use it as the authoritative verifiability source and fall back to the
// on-chain value only when the API is unreachable or the model isn't listed.

const CATALOG_TTL_MS = 5 * 60_000; // 5-minute cache
let catalogCache: {
  data: Map<string, "TeeML" | "TeeTLS" | "">;
  fetchedAt: number;
} | null = null;

async function fetchModelCatalog(): Promise<Map<string, "TeeML" | "TeeTLS" | "">> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.fetchedAt < CATALOG_TTL_MS) {
    return catalogCache.data;
  }

  try {
    const res = await fetch("https://router-api.0g.ai/v1/models", {
      headers: { Accept: "application/json" },
      // 8-second timeout so a slow API never blocks provider listing
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) throw new Error(`Router API returned ${res.status}`);

    const json = await res.json() as { data?: Array<{ id: string; verifiability?: string }> };
    const map = new Map<string, "TeeML" | "TeeTLS" | "">();

    for (const entry of json.data ?? []) {
      if (entry.id && entry.verifiability) {
        const v = entry.verifiability as "TeeML" | "TeeTLS" | "";
        map.set(entry.id.toLowerCase(), v);
      }
    }

    catalogCache = { data: map, fetchedAt: now };
    return map;
  } catch (err) {
    // API unreachable — return the stale cache if we have one, otherwise empty map
    console.warn("[zeroG] Router catalog fetch failed, using stale/empty cache:", err);
    return catalogCache?.data ?? new Map();
  }
}

// ─────────────────────────────────────────────
// Service discovery
// ─────────────────────────────────────────────

interface RawService {
  provider: string;
  serviceType: string;
  url: string;
  model: string;
  inputPrice?: unknown;
  outputPrice?: unknown;
  updatedAt?: unknown;
  verifiability?: string;
}

function normalizeService(
  raw: RawService,
  catalog: Map<string, "TeeML" | "TeeTLS" | "">
): ServiceInfo {
  // Resolve verifiability: catalog (live API) > on-chain field > empty
  const modelKey = raw.model?.toLowerCase() ?? "";
  const catalogVerifiability = catalog.get(modelKey);
  const onChainVerifiability = (raw.verifiability as "TeeML" | "TeeTLS" | "") ?? "";
  const verifiability = catalogVerifiability ?? onChainVerifiability;

  return {
    provider: raw.provider,
    serviceType: raw.serviceType,
    url: raw.url,
    model: raw.model,
    inputPrice: raw.inputPrice !== undefined && raw.inputPrice !== null ? String(raw.inputPrice) : "0",
    outputPrice: raw.outputPrice !== undefined && raw.outputPrice !== null ? String(raw.outputPrice) : "0",
    updatedAt: raw.updatedAt !== undefined && raw.updatedAt !== null ? String(raw.updatedAt) : "0",
    verifiability,
  };
}

const PROVIDERS_CACHE_TTL_MS = 60_000;
let providersCache: { data: ServiceInfo[]; fetchedAt: number } | null = null;

export async function listProviders(): Promise<ServiceInfo[]> {
  const now = Date.now();
  if (providersCache && now - providersCache.fetchedAt < PROVIDERS_CACHE_TTL_MS) {
    return providersCache.data;
  }

  // Fetch catalog and on-chain services in parallel for speed
  const [catalog, services] = await Promise.all([
    fetchModelCatalog(),
    getZeroGBroker().then((broker) => broker.inference.listService()),
  ]);

  const normalized = services.map((raw) =>
    normalizeService(raw as unknown as RawService, catalog)
  );

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

// ─────────────────────────────────────────────
// Provider-level verification
// ─────────────────────────────────────────────

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
// Tier 1 — Verified Inference
// ─────────────────────────────────────────────

// Parse the extended metadata JSON stored on-chain per provider.
// Returns whether the model itself runs in a TEE, or just the broker.
function parseProviderArchitecture(extendedMetaJson: string): {
  isCentralized: boolean;
  providerType: string;
  teeVerifier: string;
} {
  try {
    const meta = JSON.parse(extendedMetaJson);
    return {
      // TargetSeparated: true means broker is in TEE but model runs on centralized infra
      isCentralized:
        meta.ProviderType === "centralized" || meta.TargetSeparated === true,
      providerType: meta.ProviderType ?? "unknown",
      teeVerifier: meta.TEEVerifier ?? "unknown",
    };
  } catch {
    return { isCentralized: false, providerType: "unknown", teeVerifier: "unknown" };
  }
}

// One-time per-provider acknowledgment — safe to call multiple times (idempotent on-chain)
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
    return fail(
      err instanceof Error ? `Network error: ${err.message}` : "Could not reach 0G network"
    );
  }

  try {
    // 1. Confirm this is a real, active chatbot provider
    const service = await getProviderService(providerAddress);
    if (!service) {
      return fail("No active service found for this provider address");
    }
    if (service.serviceType !== "chatbot") {
      return fail(
        `This provider runs '${service.serviceType}', not a chatbot — chat not supported`
      );
    }

    // 2. Parse on-chain metadata to determine if model itself is TEE-enclosed
    // The raw listService result includes an extended metadata JSON as the 9th field.
    // We fetch it directly via getServiceMetadata for the full picture.
    interface ContractService {
      provider: string;
      8?: string;
      additionalInfo?: string;
    }

    const rawServices = await broker.inference.listService();
    const rawService = (rawServices as unknown as ContractService[]).find(
      (s) => s.provider?.toLowerCase() === providerAddress.toLowerCase()
    );

    // The extended metadata is the 9th element of the raw contract Result array
    const extendedMetaJson = rawService?.[8] ?? rawService?.additionalInfo ?? "{}";
    const { isCentralized } = parseProviderArchitecture(extendedMetaJson);

    // 3. One-time provider acknowledgment
    await ensureProviderAcknowledged(broker, providerAddress);

    // 4. Get service endpoint + model name
    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

    // 5. Generate single-use auth headers — must generate fresh for every request
    const headers = await broker.inference.getRequestHeaders(providerAddress);

    // 6. Make the actual inference call to the provider
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
      return fail(
        `Provider returned ${inferenceRes.status}: ${errBody || inferenceRes.statusText}`
      );
    }

    const data = await inferenceRes.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    if (!content) {
      return fail("Provider returned an empty response");
    }

    // 7. Extract chatID — ZG-Res-Key header is authoritative, data.id is fallback
    const chatID: string | null =
      inferenceRes.headers.get("ZG-Res-Key") ||
      inferenceRes.headers.get("zg-res-key") ||
      data.id ||
      null;

    // 8. Attempt response-level TEE verification via processResponse()
    //
    // This is only meaningful when the model itself runs inside a TEE (TeeML, non-centralized).
    // For centralized providers (e.g. Alibaba Cloud / DashScope), the TEE only covers the
    // broker routing layer — no model-level signature is produced, and calling processResponse
    // will throw "getting signature error". We detect and skip this case explicitly
    // rather than letting it throw and appearing as an unexpected failure.
    //
    // processResponse() also handles fee settlement — for centralized providers this
    // still happens implicitly through the broker's billing cycle.

    let receipt: VerificationReceipt | null = null;

    if (!chatID) {
      // Provider returned no chatID at all — receipt unavailable
      receipt = null;
    } else if (isCentralized) {
      // Broker is in TEE but model runs on centralized infra — per-response signing impossible
      receipt = {
        chatID,
        isVerified: false,
        providerAddress,
        verifiedAt: Date.now(),
        skipReason: "centralized_provider",
        verifiability: service.verifiability,
      };
    } else {
      // Model runs directly inside the TEE — attempt full cryptographic response verification
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
          skipReason: null,
          verifiability: service.verifiability,
        };
      } catch {
        // Signature fetch failed despite non-centralized architecture
        // Still return the response — surface the failure honestly
        receipt = {
          chatID,
          isVerified: false,
          providerAddress,
          verifiedAt: Date.now(),
          skipReason: "signature_fetch_failed",
          verifiability: service.verifiability,
        };
      }
    }

    return { content, model, providerAddress, receipt, error: null };

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Inference failed";
    if (msg.toLowerCase().includes("fund") || msg.toLowerCase().includes("balance")) {
      return fail(
        "Insufficient ledger funds. Fund your wallet"
      );
    }
    return fail(msg);
  }
}