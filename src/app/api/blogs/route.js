import { NextResponse } from "next/server";
import { getBlogs, saveBlog } from "@/lib/db";

export async function GET() {
    try {
        const blogs = await getBlogs();
        return NextResponse.json(blogs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.title || !body.content) {
            return NextResponse.json({ error: "Missing required fields (title, content)" }, { status: 400 });
        }

        const saved = await saveBlog(body);
        return NextResponse.json({ success: true, blog: saved }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 });
    }
}
