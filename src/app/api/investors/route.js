import { NextResponse } from "next/server";
import { getInvestors, saveInvestor } from "@/lib/db";

export async function GET() {
  try {
    const investors = await getInvestors();
    return NextResponse.json(investors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = body.name || body.fullName;
    const email = body.email;
    const phone = body.phone;

    // Validation for required contact fields
    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields (name, email, phone)" }, { status: 400 });
    }

    const saved = await saveInvestor({
      ...body,
      name
    });
    return NextResponse.json({ success: true, investor: saved }, { status: 201 });
  } catch (error) {
    console.error("Error saving investor registration:", error);
    return NextResponse.json({ error: error.message || "Failed to save investor registration" }, { status: 500 });
  }
}
