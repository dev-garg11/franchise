import { NextResponse } from "next/server";
import { assignBrandToInvestors } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { brandId, investorIds, customMessage, adminEmail, adminName } = body;

    if (!brandId) {
      return NextResponse.json({ error: "Missing required field: brandId" }, { status: 400 });
    }

    const result = await assignBrandToInvestors(
      brandId,
      investorIds || [],
      customMessage || "",
      { email: adminEmail, name: adminName }
    );
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("API Error in assign-brand:", error);
    return NextResponse.json({ error: "Failed to assign brand to investors" }, { status: 500 });
  }
}
