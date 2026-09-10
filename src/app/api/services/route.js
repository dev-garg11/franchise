import { NextResponse } from "next/server";
import { getServices, saveService } from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        let services = await getServices();

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            services = services.filter(service => (service.title || "").toLowerCase().includes(term));
        }

        const total = services.length;

        if (pageParam !== null || limitParam !== null) {
            const page = Math.max(1, parseInt(pageParam || "1", 10));
            const limit = Math.max(1, parseInt(limitParam || "10", 10));
            const start = (page - 1) * limit;
            const paginatedData = services.slice(start, start + limit);
            const totalPages = Math.ceil(total / limit) || 1;

            return NextResponse.json({
                data: paginatedData,
                total,
                page,
                limit,
                totalPages
            });
        }

        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !body.content) {
            return NextResponse.json({ error: "Missing required fields (title, content)" }, { status: 400 });
        }

        const saved = await saveService(body);
        return NextResponse.json({ success: true, service: saved }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save service" }, { status: 500 });
    }
}
