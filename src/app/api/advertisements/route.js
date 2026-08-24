import { NextResponse } from "next/server";
import { getAdvertisements, saveAdvertisement } from "@/lib/db";

export async function GET() {
    try {
        const ads = await getAdvertisements();
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
