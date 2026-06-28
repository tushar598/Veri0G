// src/types/index.ts
export type { ServiceInfo, VerificationResult } from "@/app/lib/zeroG";

// Client-safe type declarations (duplicated here to avoid importing the server-only zeroG module in client bundles)

export interface VerificationReceipt {
  chatID: string;
  isVerified: boolean;
  providerAddress: string;
  verifiedAt: number; // Unix ms timestamp
  skipReason?: "centralized_provider" | "signature_fetch_failed" | null;
}

export interface InferenceResult {
  content: string;
  model: string;
  providerAddress: string;
  receipt: VerificationReceipt | null;
  error: string | null;
}