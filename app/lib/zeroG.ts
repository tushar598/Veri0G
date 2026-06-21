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