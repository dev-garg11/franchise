import { NextResponse } from "next/server";
import { getInvestors, resetDatabaseConnection, saveInvestor } from "@/lib/db";
import { validateArea } from "@/lib/seo/validate";

let investorsMemoryCache = null;
let investorsCacheTime = 0;
const INVESTORS_CACHE_TTL = 5000;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filterBrand = searchParams.get("brand") || "";
    const filterCategory = searchParams.get("category") || "";
    const filterStatus = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    let investors;
    if (investorsMemoryCache && Date.now() - investorsCacheTime < INVESTORS_CACHE_TTL) {
      investors = investorsMemoryCache;
    } else {
      investors = await getInvestors();
      investorsMemoryCache = investors;
      investorsCacheTime = Date.now();
    }

    const cleanBrand = (filterBrand || "").trim();
    const isBrandAll = !cleanBrand || cleanBrand.toLowerCase() === "all" || cleanBrand.toLowerCase() === "brand: all";
    const isGeneralOnly = cleanBrand.toLowerCase() === "general" || cleanBrand.toLowerCase() === "no-brand";

    const cleanCategory = (filterCategory || "").trim();
    const isCategoryAll = !cleanCategory || cleanCategory.toLowerCase() === "all" || cleanCategory.toLowerCase() === "category: all";

    const cleanStatus = (filterStatus || "").trim();
    const isStatusAll = !cleanStatus || cleanStatus.toLowerCase() === "all";

    if (search || !isBrandAll || !isCategoryAll || !isStatusAll) {
      investors = investors.filter(i => {
        let matchesSearch = true;
        if (search && search.trim()) {
          const searchLower = search.trim().toLowerCase();
          matchesSearch = (
            (i.name && i.name.toLowerCase().includes(searchLower)) ||
            (i.fullName && i.fullName.toLowerCase().includes(searchLower)) ||
            (i.email && i.email.toLowerCase().includes(searchLower)) ||
            (i.phone && i.phone.includes(searchLower)) ||
            (i.preferredLocation && i.preferredLocation.toLowerCase().includes(searchLower)) ||
            (i.city && i.city.toLowerCase().includes(searchLower)) ||
            (i.brandName && i.brandName.toLowerCase().includes(searchLower))
          );
        }

        let matchesBrand = true;
        if (isGeneralOnly) {
          matchesBrand = !i.brandName && !i.brandId && (!i.assignedBrands || i.assignedBrands.length === 0);
        } else if (!isBrandAll) {
          const brandLower = cleanBrand.toLowerCase();
          const iBrandName = (i.brandName || i.targetBrand || "").toLowerCase();
          const iBrandId = String(i.brandId || i.targetBrandId || "").toLowerCase();
          const isAssigned = Array.isArray(i.assignedBrands) && (
            i.assignedBrands.some(ab => String(ab).toLowerCase() === brandLower || String(ab).toLowerCase().includes(brandLower) || brandLower.includes(String(ab).toLowerCase()))
          );
          matchesBrand = (
            isAssigned ||
            (iBrandId && (iBrandId === brandLower || brandLower.includes(iBrandId) || iBrandId.includes(brandLower))) ||
            (iBrandName && (iBrandName.includes(brandLower) || brandLower.includes(iBrandName))) ||
            (i.comments && i.comments.toLowerCase().includes(brandLower))
          );
        }

        let matchesCategory = true;
        if (!isCategoryAll) {
          const catLower = cleanCategory.toLowerCase();
          const iCat = (i.category || "").toLowerCase();
          const iInds = Array.isArray(i.industries) ? i.industries.map(ind => String(ind).toLowerCase()) : [];
          matchesCategory = (iCat && (iCat === catLower || iCat.includes(catLower) || catLower.includes(iCat))) ||
            iInds.some(ind => ind && (ind === catLower || ind.includes(catLower) || catLower.includes(ind)));
        }

        let matchesStatus = true;
        if (!isStatusAll) {
          const statusLower = cleanStatus.toLowerCase();
          const displayStatus = (i.status || "Pending").toLowerCase();
          matchesStatus = displayStatus === statusLower;
        }

        return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
      });
    }

    if (sort === "oldest") {
      investors = [...investors].sort((a, b) => new Date(a.createdAt || a.appliedAt || 0) - new Date(b.createdAt || b.appliedAt || 0));
    } else {
      investors = [...investors].sort((a, b) => new Date(b.createdAt || b.appliedAt || 0) - new Date(a.createdAt || a.appliedAt || 0));
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

    const response = NextResponse.json(investors);
    response.headers.set("Cache-Control", "private, max-age=5, stale-while-revalidate=30");
    return response;
  } catch (error) {
    try {
      await resetDatabaseConnection();
      return NextResponse.json(await getInvestors());
    } catch (retryError) {
      return NextResponse.json({ error: "Failed to fetch investors" }, { status: 503 });
    }
  }
}

export async function POST(request) {
  try {
    const rawBody = await request.json();
    const body = {};
    for (const key in rawBody) {
      body[key] = typeof rawBody[key] === "string" ? rawBody[key].trim() : rawBody[key];
    }

    const name = body.name || body.fullName;
    const email = body.email;
    const phoneStr = body.phone ? String(body.phone).trim() : "";
    const cleanPhone = phoneStr.replace(/\D/g, "");

    // Validation for required contact fields
    if (!name || !email || !phoneStr) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (name.length > 30) {
      return NextResponse.json({ error: "Name cannot exceed 30 characters." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "Phone number must be a valid 10-digit Indian Mobile Number starting with 6, 7, 8, or 9." }, { status: 400 });
    }

    // Password validation only when provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Pincode validation only when provided
    if (body.pincode && (body.pincode.length !== 6 || !/^\d{6}$/.test(body.pincode))) {
      return NextResponse.json({ error: "Pincode must be exactly 6 digits." }, { status: 400 });
    }

    if (body.budgetMin && body.budgetMax && Number(body.budgetMax) < Number(body.budgetMin)) {
      return NextResponse.json({ error: "Maximum investment must be greater than or equal to minimum investment." }, { status: 400 });
    }

    let sanitizedArea = body.propertyArea ? String(body.propertyArea).trim() : "";
    if (body.propertyAvailable === "Yes" && sanitizedArea) {
      const areaVal = validateArea(sanitizedArea);
      if (!areaVal.isValid) {
        return NextResponse.json({ error: `Invalid Area: ${areaVal.reason}. Available area must be between 50 and 5,000 sq ft.` }, { status: 400 });
      }
      sanitizedArea = areaVal.value;
    }

    const saved = await saveInvestor({
      ...body,
      name,
      propertyArea: sanitizedArea,
      phone: cleanPhone,
      pincode: body.pincode || "000000",
      investment_range: body.investment_range || body.investmentCapacity || "Not Specified",
      max_investment_limit: body.max_investment_limit || body.investmentCapacity || "Not Specified"
    });
    investorsMemoryCache = null;
    investorsCacheTime = 0;
    return NextResponse.json({ success: true, investor: saved }, { status: 201 });
  } catch (error) {
    console.error("Error saving investor registration:", error);
    return NextResponse.json({ error: error.message || "Failed to save investor registration" }, { status: 500 });
  }
}
