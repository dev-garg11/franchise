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

    // Simple validation
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: "Missing required fields (name, email, phone)" }, { status: 400 });
    }

    const saved = await saveInvestor(body);
    return NextResponse.json({ success: true, investor: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save investor registration" }, { status: 500 });
  }
}
