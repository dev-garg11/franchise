import { NextResponse } from "next/server";
import { requestLoginOtp } from "@/lib/db";

export async function POST(request) {
  try {
    const { identifier } = await request.json();
    if (!identifier?.trim()) {
      return NextResponse.json({ error: "Enter your email or mobile number." }, { status: 400 });
    }
    const result = await requestLoginOtp(identifier);
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  } catch (error) {
    console.error("Request OTP API Error:", error);
    return NextResponse.json({
      error: "Unable to send OTP right now. Please try again.",
      ...(process.env.NODE_ENV !== "production" ? { details: error?.message || String(error) } : {})
    }, { status: 500 });
  }
}
