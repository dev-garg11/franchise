import { NextResponse } from "next/server";
import { getInvestors, saveInvestor } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterBrand = searchParams.get("brand") || "";
    const filterCategory = searchParams.get("category") || "";
    const filterStatus = searchParams.get("status") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    let investors = await getInvestors();

    if (search || filterBrand || filterCategory || filterStatus) {
      investors = investors.filter(i => {
        const searchLower = search.toLowerCase();
        const matchesSearch = !search ? true : (
          (i.name && i.name.toLowerCase().includes(searchLower)) ||
          (i.email && i.email.toLowerCase().includes(searchLower)) ||
          (i.phone && i.phone.includes(search)) ||
          (i.preferredLocation && i.preferredLocation.toLowerCase().includes(searchLower))
        );

        const matchesBrand = !filterBrand ? true : (
          (i.brandId && i.brandId === filterBrand) ||
          (i.brandName && i.brandName.toLowerCase().includes(filterBrand.toLowerCase())) ||
          (i.assignedBrands && i.assignedBrands.includes(filterBrand))
        );

        const matchesCategory = !filterCategory ? true : (
          (i.category && i.category.toLowerCase() === filterCategory.toLowerCase()) ||
          (i.industries && i.industries.some(ind => ind.toLowerCase() === filterCategory.toLowerCase()))
        );

        const displayStatus = i.status || "Pending";
        const matchesStatus = !filterStatus ? true : (
          displayStatus.toLowerCase() === filterStatus.toLowerCase()
        );

        return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
      });
    }

    const total = investors.length;

    if (pageParam !== null || limitParam !== null) {
      const page = Math.max(1, parseInt(pageParam || "1", 10));
      const limit = Math.max(1, parseInt(limitParam || "10", 10));
      const start = (page - 1) * limit;
      const paginatedData = investors.slice(start, start + limit);
      const totalPages = Math.ceil(total / limit) || 1;

      return NextResponse.json({
        data: paginatedData,
        total,
        page,
        limit,
        totalPages
      });
    }

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
