import { NextResponse } from "next/server";
import { getAdvertisementById, updateAdvertisement, deleteAdvertisement } from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const ad = await getAdvertisementById(id);
        if (!ad) {
            return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
        }

        return NextResponse.json(ad);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch advertisement" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();

        const updated = await updateAdvertisement(id, body);
        if (!updated) {
            return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, advertisement: updated });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update advertisement" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const deleted = await deleteAdvertisement(id);
        if (!deleted) {
            return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Advertisement deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete advertisement" }, { status: 500 });
    }
}
