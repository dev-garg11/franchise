import { NextResponse } from "next/server";
import { getBrands, saveBrand } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status"); // Approved, Pending, etc.
    const featured = searchParams.get("featured"); // true/false
    const search = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    let brands = await getBrands();

    if (filterStatus) {
      brands = brands.filter(b => b.status === filterStatus);
    }
    if (featured === "true") {
      brands = brands.filter(b => b.featured === true);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      brands = brands.filter(b => {
        const nameMatch = (b.name || "").toLowerCase().includes(term);
        const companyMatch = (b.company || "").toLowerCase().includes(term);
        const categoryMatch = (b.category || "").toLowerCase().includes(term);
        const emailMatch = (b.email || (b.user && b.user.email) || "").toLowerCase().includes(term);
        return nameMatch || companyMatch || categoryMatch || emailMatch;
      });
    }

    const total = brands.length;

    if (pageParam !== null || limitParam !== null) {
      const page = Math.max(1, parseInt(pageParam || "1", 10));
      const limit = Math.max(1, parseInt(limitParam || "10", 10));
      const start = (page - 1) * limit;
      const paginatedData = brands.slice(start, start + limit);
      const totalPages = Math.ceil(total / limit) || 1;

      return NextResponse.json({
        data: paginatedData,
        total,
        page,
        limit,
        totalPages
      });
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

    const saved = await saveBrand(body);
    return NextResponse.json({ success: true, brand: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/brands:", error);
    return NextResponse.json({ error: error.message || "Failed to save brand registration" }, { status: 500 });
  }
}
