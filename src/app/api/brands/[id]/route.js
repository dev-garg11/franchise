import { NextResponse } from "next/server";
import { getBrandById, updateBrand, deleteBrand } from "@/lib/db";
import { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";

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
    const { customMessage, adminEmail, adminName, ...brandFields } = body;

    // 1. Validate Brand Name
    if (brandFields.name !== undefined) {
      const nameVal = validateBrandName(brandFields.name);
      if (!nameVal.isValid) {
        return NextResponse.json({ error: nameVal.reason }, { status: 400 });
      }
    }

    // 2. Validate Area Required
    if (brandFields.areaRequired !== undefined && brandFields.areaRequired !== null) {
      const areaStr = String(brandFields.areaRequired).trim();
      if (areaStr === "" || areaStr.toLowerCase() === "null") {
        brandFields.areaRequired = null;
      } else {
        const areaVal = validateArea(areaStr);
        if (!areaVal.isValid) {
          return NextResponse.json(
            { error: `Invalid Area: ${areaVal.reason}. Must be between 50 and 50,000 sq ft.` },
            { status: 400 }
          );
        }
        brandFields.areaRequired = areaVal.value;
      }
    }

    // 3. Validate Image URL (Reject Base64)
    if (brandFields.image && typeof brandFields.image === "string") {
      const imgVal = validateImageUrl(brandFields.image);
      if (!imgVal.isValid) {
        return NextResponse.json({ error: `Invalid Image: ${imgVal.reason}` }, { status: 400 });
      }
    }

    const updated = await updateBrand(id, brandFields, customMessage || "", { email: adminEmail, name: adminName });
    if (!updated) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, brand: updated });
  } catch (error) {
    console.error("Error in PATCH /api/brands/[id]:", error);
    return NextResponse.json({ error: error.message || "Failed to update brand" }, { status: 500 });
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
