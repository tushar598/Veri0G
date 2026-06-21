// src/app/api/providers/route.ts
import { NextResponse } from "next/server";
import { listProviders } from "@/app/lib/zeroG";

export const runtime = "nodejs"; // same reason as verify/route.ts — needs Node, not Edge

export async function GET() {
  try {
    const services = await listProviders();
    return NextResponse.json({ services });
  } catch (err) {
    return NextResponse.json(
      {
        services: [],
        error: err instanceof Error ? err.message : "Failed to load providers",
      },
      { status: 500 }
    );
  }
}