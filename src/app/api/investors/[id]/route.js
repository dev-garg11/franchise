import { NextResponse } from "next/server";
import { updateInvestor, deleteInvestor } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams?.id;
    if (!id || id === "undefined" || id === "null") {
      return NextResponse.json({ error: "Invalid investor lead ID" }, { status: 400 });
    }
    const body = await request.json();
    const { customMessage, adminEmail, adminName, ...investorFields } = body;
    const updated = await updateInvestor(id, investorFields, customMessage || "", { email: adminEmail, name: adminName });
    if (!updated) {
      return NextResponse.json({ error: `Investor lead with ID '${id}' was not found in database` }, { status: 404 });
    }
    return NextResponse.json({ success: true, investor: updated });
  } catch (error) {
    console.error("PATCH /api/investors/[id] failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update investor lead" }, { status: 500 });
  }
}

async function _legacyPatch(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customMessage, adminEmail, adminName, ...investorFields } = body;

    const updated = await updateInvestor(id, investorFields, customMessage || "", { email: adminEmail, name: adminName });
    if (!updated) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, investor: updated });
  } catch (error) {
    console.error("PATCH /api/investors/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update investor lead" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = await deleteInvestor(id);
    if (!success) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete investor lead" }, { status: 500 });
  }
}
