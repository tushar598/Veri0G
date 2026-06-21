// src/app/api/verify/route.ts — full replacement
import { NextResponse } from "next/server";
import { verifyProvider } from "@/app/lib/zeroG";

export const runtime = "nodejs"; // fs/os + wallet signing need Node, not Edge — make it explicit

export async function POST(req: Request) {
  let providerAddress: string | undefined;
  try {
    ({ providerAddress } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!providerAddress) {
    return NextResponse.json({ error: "providerAddress is required" }, { status: 400 });
  }

  try {
    const result = await verifyProvider(providerAddress);
    // Always 200 here — frontend reads found/isVerified/error to decide what to render
    return NextResponse.json(result);
  } catch (err) {
    // Safety net only; verifyProvider is now designed to never throw
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}