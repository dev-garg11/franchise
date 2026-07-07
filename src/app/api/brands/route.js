import { NextResponse } from "next/server";
import { getBrands, saveBrand } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status"); // Approved, Pending, etc.
    const featured = searchParams.get("featured"); // true/false

    let brands = getBrands();

    if (filterStatus) {
      brands = brands.filter(b => b.status === filterStatus);
    }
    if (featured === "true") {
      brands = brands.filter(b => b.featured === true);
    }

    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple validation
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ error: "Missing required fields (name, email, phone)" }, { status: 400 });
    }

    const saved = saveBrand(body);
    return NextResponse.json({ success: true, brand: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save brand registration" }, { status: 500 });
  }
}
