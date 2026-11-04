import { NextResponse } from "next/server";
import { getAdvertisements, getLocalAdvertisements, saveAdvertisement } from "@/lib/db";

let publicAdsMemoryCache = null;
let publicAdsSerializedCache = null;
let publicAdsCacheTime = 0;
const PUBLIC_ADS_CACHE_TTL = 30 * 1000;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        // Homepage/header requests use the admin-synced local cache so a
        // database cold start never delays the first public paint.
        const isPublicRequest = searchParams.get("public") === "true";
        let ads;
        if (isPublicRequest && publicAdsMemoryCache && Date.now() - publicAdsCacheTime < PUBLIC_ADS_CACHE_TTL) {
            ads = publicAdsMemoryCache;
        } else {
            ads = isPublicRequest ? getLocalAdvertisements() : await getAdvertisements();
            if (isPublicRequest) {
                publicAdsMemoryCache = ads;
                publicAdsSerializedCache = JSON.stringify(ads);
                publicAdsCacheTime = Date.now();
            }
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            ads = ads.filter(ad => (ad.title || "").toLowerCase().includes(term));
        }

        const total = ads.length;

        if (pageParam !== null || limitParam !== null) {
            const page = Math.max(1, parseInt(pageParam || "1", 10));
            const limit = Math.max(1, parseInt(limitParam || "10", 10));
            const start = (page - 1) * limit;
            const paginatedData = ads.slice(start, start + limit);
            const totalPages = Math.ceil(total / limit) || 1;

            return NextResponse.json({
                data: paginatedData,
                total,
                page,
                limit,
                totalPages
            });
        }

        const isSimplePublicRequest = isPublicRequest && !search.trim() && pageParam === null && limitParam === null;
        if (isSimplePublicRequest && publicAdsSerializedCache) {
            return new NextResponse(publicAdsSerializedCache, {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=30, stale-while-revalidate=120"
                }
            });
        }
        const response = NextResponse.json(ads);
        if (searchParams.get("public") === "true") {
            response.headers.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
        }
        return response;
    } catch (error) {
        console.error("GET /api/advertisements error:", error);
        return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !body.image) {
            return NextResponse.json({ error: "Missing required fields (title, image)" }, { status: 400 });
        }

        const normalizedBody = {
            ...body,
            mediaType: body.mediaType === "video" ? "video" : "image",
            textColor: /^#[0-9a-f]{6}$/i.test(String(body.textColor || "")) ? body.textColor : "#ffffff",
            position: String(body.position || "homepage_banner").trim().toLowerCase() || "homepage_banner",
            isActive: body.isActive !== false
        };
        const saved = await saveAdvertisement(normalizedBody);
        publicAdsMemoryCache = null;
        publicAdsSerializedCache = null;
        publicAdsCacheTime = 0;
        return NextResponse.json({ success: true, advertisement: saved }, { status: 201 });
    } catch (error) {
        console.error("POST /api/advertisements error:", error);
        return NextResponse.json({ error: error?.message || "Failed to save advertisement" }, { status: 500 });
    }
}
