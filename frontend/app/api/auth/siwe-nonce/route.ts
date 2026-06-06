import { NextResponse } from "next/server";
import { generateNonce } from "siwe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ nonce: generateNonce() });
}
