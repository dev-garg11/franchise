import { NextResponse } from "next/server";
import { getBrandById, updateBrand, deleteBrand } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const brand = await getBrandById(id);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}


export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const updated = await updateBrand(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deleted = await deleteBrand(id);
    if (!deleted) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
