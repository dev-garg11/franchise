import { NextResponse } from "next/server";
import { getAdvertisements, saveAdvertisement } from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        let ads = await getAdvertisements();

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

        return NextResponse.json(ads);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch advertisements" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !body.image) {
            return NextResponse.json({ error: "Missing required fields (title, image)" }, { status: 400 });
        }

        const saved = await saveAdvertisement(body);
        return NextResponse.json({ success: true, advertisement: saved }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save advertisement" }, { status: 500 });
    }
}
