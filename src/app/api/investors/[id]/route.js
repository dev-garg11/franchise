import { NextResponse } from "next/server";
import { updateInvestor, deleteInvestor } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateInvestor(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, investor: updated });
  } catch (error) {
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
