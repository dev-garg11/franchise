import { NextResponse } from "next/server";
import { verifyLoginOtp } from "@/lib/db";

export async function POST(request) {
  try {
    const { identifier, code } = await request.json();
    const result = await verifyLoginOtp(identifier, code);
    return NextResponse.json(result, { status: result.success ? 200 : 401 });
  } catch (error) {
    console.error("Verify OTP API Error:", error);
    return NextResponse.json({
      error: "Unable to verify OTP right now.",
      ...(process.env.NODE_ENV !== "production" ? { details: error?.message || String(error) } : {})
    }, { status: 500 });
  }
}
