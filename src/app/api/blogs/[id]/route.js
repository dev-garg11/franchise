import { NextResponse } from "next/server";
import { getBlogById, updateBlog, deleteBlog } from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const blog = await getBlogById(id);
        if (!blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();

        const updated = await updateBlog(id, body);
        if (!updated) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, blog: updated });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const deleted = await deleteBlog(id);
        if (!deleted) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
    }
}
