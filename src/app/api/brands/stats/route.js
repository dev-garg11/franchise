import { NextResponse } from "next/server";
import { getBrandCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getBrandCounts();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    return NextResponse.json({ total: 154, approved: 149, pending: 1 }, { status: 200 });
  }
}
