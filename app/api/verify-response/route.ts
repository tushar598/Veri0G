// src/app/api/verify-response/route.ts
import { NextResponse } from "next/server";
import { verifyInferenceResponse } from "@/app/lib/zeroG";

export const runtime = "nodejs";

// CORS — pc.0g.ai se cross-origin calls aayenge
const ALLOWED_ORIGINS = [
  "https://pc.0g.ai",
  "https://veri0g.vercel.app", // apna domain
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Preflight request — browser OPTIONS call karta hai CORS ke liye
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");

  let body: {
    providerAddress?: string;
    content?: string;
    chatID?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const { providerAddress, content, chatID } = body;

  if (!providerAddress || !content || !chatID) {
    return NextResponse.json(
      { error: "providerAddress, content, and chatID are all required" },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  const result = await verifyInferenceResponse(providerAddress, content, chatID);
  return NextResponse.json(result, { headers: corsHeaders(origin) });
}