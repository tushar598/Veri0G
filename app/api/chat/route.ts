import { NextResponse } from "next/server";
import { runVerifiedInference } from "@/app/lib/zeroG";

export const runtime = "nodejs";
export const maxDuration = 60; // inference can take 10-30s on testnet — don't let Vercel cut it off

export async function POST(req: Request) {
  let body: { providerAddress?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { providerAddress, message } = body;

  if (!providerAddress || !message) {
    return NextResponse.json(
      { error: "Both providerAddress and message are required" },
      { status: 400 }
    );
  }

  // No try/catch here — runVerifiedInference is designed to never throw
  const result = await runVerifiedInference(providerAddress, message);

  // Always 200 — error field tells the frontend what went wrong
  return NextResponse.json(result);
}