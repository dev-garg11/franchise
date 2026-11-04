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
        console.error("GET /api/advertisements/[id] error:", error);
        return NextResponse.json({ error: "Failed to fetch advertisement" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();

        const updated = await updateAdvertisement(id, {
            ...body,
            ...(body.mediaType !== undefined ? { mediaType: body.mediaType === "video" ? "video" : "image" } : {}),
            ...(body.textColor !== undefined ? { textColor: /^#[0-9a-f]{6}$/i.test(String(body.textColor || "")) ? body.textColor : "#ffffff" } : {}),
            ...(body.position !== undefined ? { position: String(body.position || "homepage_banner").trim().toLowerCase() || "homepage_banner" } : {})
        });
        if (!updated) {
            return NextResponse.json({ error: "Advertisement not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, advertisement: updated });
    } catch (error) {
        console.error("PATCH /api/advertisements/[id] error:", error);
        return NextResponse.json({ error: error?.message || "Failed to update advertisement" }, { status: 500 });
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
        console.error("DELETE /api/advertisements/[id] error:", error);
        return NextResponse.json({ error: error?.message || "Failed to delete advertisement" }, { status: 500 });
    }
}
