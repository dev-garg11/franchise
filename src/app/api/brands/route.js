import { NextResponse } from "next/server";
import { getBrands, resetDatabaseConnection, saveBrand } from "@/lib/db";
import { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";

let approvedBrandsMemoryCache = null;
let approvedBrandsSerializedCache = null;
let approvedBrandsCacheTime = 0;
const APPROVED_BRANDS_CACHE_TTL = 60 * 1000;

let allBrandsMemoryCache = null;
let allBrandsCacheTime = 0;
const ALL_BRANDS_CACHE_TTL = 10 * 1000;

function toPublicBrand(brand) {
  const {
    user,
    password,
    email,
    ...publicBrand
  } = brand;
  return publicBrand;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterStatus = searchParams.get("status"); // Approved, Pending, etc.
    const featured = searchParams.get("featured"); // true/false
    const search = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const isSimpleApprovedRequest = filterStatus === "Approved" && !featured && !search.trim() && pageParam === null && limitParam === null;
    const isSimpleAllBrandsRequest = !filterStatus && !featured && !search.trim() && pageParam === null && limitParam === null;
    let brands;
    if (isSimpleApprovedRequest && approvedBrandsMemoryCache && Date.now() - approvedBrandsCacheTime < APPROVED_BRANDS_CACHE_TTL) {
      brands = approvedBrandsMemoryCache;
    } else if (isSimpleAllBrandsRequest && allBrandsMemoryCache && Date.now() - allBrandsCacheTime < ALL_BRANDS_CACHE_TTL) {
      brands = allBrandsMemoryCache;
    } else {
      brands = await getBrands();
      if (isSimpleApprovedRequest) {
        approvedBrandsMemoryCache = brands.filter((brand) => brand.status === "Approved").map(toPublicBrand);
        approvedBrandsSerializedCache = JSON.stringify(approvedBrandsMemoryCache);
        approvedBrandsCacheTime = Date.now();
        brands = approvedBrandsMemoryCache;
      } else if (isSimpleAllBrandsRequest) {
        allBrandsMemoryCache = brands;
        allBrandsCacheTime = Date.now();
      }
    }

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

    if (isSimpleApprovedRequest && approvedBrandsSerializedCache) {
      return new NextResponse(approvedBrandsSerializedCache, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120"
        }
      });
    }
    const response = NextResponse.json(brands);
    if (isSimpleApprovedRequest) {
      response.headers.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    }
    return response;
  } catch (error) {
    try {
      await resetDatabaseConnection();
      return NextResponse.json(await getBrands());
    } catch (retryError) {
      return NextResponse.json({ error: "Failed to fetch brands" }, { status: 503 });
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

    const name = body.name || body.company || body.companyName;
    const email = body.email;
    const phoneStr = body.phone ? String(body.phone).trim() : "";
    const cleanPhone = phoneStr.replace(/\D/g, "");

    // Validation: name, email, phone are mandatory
    if (!name || !email || !phoneStr) {
      return NextResponse.json({ error: "Missing required fields: Name, email, and phone are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits." }, { status: 400 });
    }

    if (body.password && body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    if (body.pincode && (body.pincode.length !== 6 || !/^\d{6}$/.test(body.pincode))) {
      return NextResponse.json({ error: "Pincode must be exactly 6 digits." }, { status: 400 });
    }

    if (body.minInvestment && body.maxInvestment && Number(body.maxInvestment) < Number(body.minInvestment)) {
      return NextResponse.json({ error: "Maximum investment must be greater than or equal to minimum investment." }, { status: 400 });
    }

    // Phase 1 Strict Validation (Test brands quarantined as needs_fix)
    const nameVal = validateBrandName(name);
    if (!nameVal.isValid && !nameVal.isTest) {
      return NextResponse.json({ error: nameVal.reason }, { status: 400 });
    }

    let sanitizedArea = null;
    if (body.areaRequired && String(body.areaRequired).trim()) {
      const areaVal = validateArea(body.areaRequired);
      if (!areaVal.isValid) {
        return NextResponse.json({ error: `Invalid Area: ${areaVal.reason}. Must be between 50 and 50,000 sq ft.` }, { status: 400 });
      }
      sanitizedArea = areaVal.value;
    }

    if (body.image && typeof body.image === "string") {
      const imgVal = validateImageUrl(body.image);
      if (!imgVal.isValid) {
        return NextResponse.json({ error: `Invalid Image: ${imgVal.reason}` }, { status: 400 });
      }
    }

    const brandPayload = {
      ...body,
      name,
      company: body.company || body.companyName || name,
      phone: cleanPhone,
      password: body.password || "BrandLead123#",
      pincode: body.pincode || "110001",
      investment_range: body.investment_range || "Rs. 5 Lakh - 10 Lakh",
      max_investment_limit: body.max_investment_limit || "Rs. 20 Lakh - 30 Lakh",
      category: body.category || "General",
      areaRequired: sanitizedArea,
      businessModel: body.businessModel || "FOFO",
      currentOutlets: body.currentOutlets || "0 - 5",
      establishedYear: Number(body.establishedYear) || new Date().getFullYear(),
      seoStatus: nameVal.isTest ? "needs_fix" : (body.seoStatus || "Pending Review"),
      status: body.status || "Pending"
    };

    const saved = await saveBrand(brandPayload);
    approvedBrandsMemoryCache = null;
    approvedBrandsSerializedCache = null;
    approvedBrandsCacheTime = 0;
    allBrandsMemoryCache = null;
    allBrandsCacheTime = 0;
    return NextResponse.json({ success: true, brand: saved }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/brands:", error);
    return NextResponse.json({ error: error.message || "Failed to save brand registration" }, { status: 500 });
  }
}
