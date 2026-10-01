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
    const rawBody = await request.json();
    const body = {};
    for (const key in rawBody) {
      body[key] = typeof rawBody[key] === "string" ? rawBody[key].trim() : rawBody[key];
    }

    // Validation
    if (!body.name || !body.email || !body.phone || !body.password || !body.pincode || !body.investment_range || !body.max_investment_limit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (body.phone.length !== 10 || !/^\d{10}$/.test(body.phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits." }, { status: 400 });
    }

    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (body.pincode.length !== 6 || !/^\d{6}$/.test(body.pincode)) {
      return NextResponse.json({ error: "Pincode must be exactly 6 digits." }, { status: 400 });
    }

    if (body.maxInvestment < body.minInvestment) {
      return NextResponse.json({ error: "Maximum investment must be greater than or equal to minimum investment." }, { status: 400 });
    }

    const saved = await saveBrand(body);
    return NextResponse.json({ success: true, brand: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/brands:", error);
    return NextResponse.json({ error: error.message || "Failed to save brand registration" }, { status: 500 });
  }
}
