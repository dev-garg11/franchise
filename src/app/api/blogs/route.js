import { NextResponse } from "next/server";
import { getBlogs, saveBlog } from "@/lib/db";

let blogsMemoryCache = null;
let blogsCacheTime = 0;
const BLOGS_CACHE_TTL = 30 * 1000;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const pageParam = searchParams.get("page");
        const limitParam = searchParams.get("limit");

        let blogs;
        if (blogsMemoryCache && Date.now() - blogsCacheTime < BLOGS_CACHE_TTL) {
            blogs = blogsMemoryCache;
        } else {
            blogs = await getBlogs();
            blogsMemoryCache = blogs;
            blogsCacheTime = Date.now();
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            blogs = blogs.filter(blog => (blog.title || "").toLowerCase().includes(term));
        }

        const total = blogs.length;

        if (pageParam !== null || limitParam !== null) {
            const page = Math.max(1, parseInt(pageParam || "1", 10));
            const limit = Math.max(1, parseInt(limitParam || "10", 10));
            const start = (page - 1) * limit;
            const paginatedData = blogs.slice(start, start + limit);
            const totalPages = Math.ceil(total / limit) || 1;

            return NextResponse.json({
                data: paginatedData,
                total,
                page,
                limit,
                totalPages
            });
        }

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
        blogsMemoryCache = null;
        return NextResponse.json({ success: true, blog: saved }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save blog post" }, { status: 500 });
    }
}
