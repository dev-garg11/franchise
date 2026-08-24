import { NextResponse } from "next/server";
import { getServices, saveService } from "@/lib/db";

export async function GET() {
    try {
        const services = await getServices();
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
