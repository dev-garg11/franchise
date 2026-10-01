"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen, Clock } from "lucide-react";

export default function BlogDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [blog, setBlog] = useState(null);
    const [otherBlogs, setOtherBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getBlogData() {
            try {
                const [blogRes, allBlogsRes] = await Promise.all([
                    fetch(`/api/blogs/${id}`),
                    fetch("/api/blogs")
                ]);

                if (blogRes.ok) {
                    const blogData = await blogRes.json();
                    setBlog(blogData);
                } else {
                    setError(true);
                }

                if (allBlogsRes.ok) {
                    const allBlogs = await allBlogsRes.json();
                    // Filter out current blog to show suggestions
                    setOtherBlogs(allBlogs.filter(b => (b.id || b._id) !== id).slice(0, 3));
                }
            } catch (err) {
                console.error("Failed to load blog data:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            getBlogData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "16px" }}>
                <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                <p style={{ color: "var(--text-muted)" }}>Loading article content...</p>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "16px" }}>
                <h2 style={{ fontSize: "28px", color: "var(--text-dark)", fontWeight: "800" }}>404 Article Not Found</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>The blog article you are trying to view does not exist or has been removed.</p>
                <Link href="/blogs" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <ArrowLeft size={16} /> Back to Blogs Directory
                </Link>
            </div>
        );
    }

    // Format content body to render paragraphs with line breaks
    const paragraphs = blog.content.split("\n\n").filter(Boolean);

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 0" }}>
            <div className="container" style={{ maxWidth: "900px" }}>
                {/* Back Link */}
                <Link
                    href="/blogs"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "var(--text-muted)",
                        marginBottom: "30px",
                        transition: "color 0.2s ease"
                    }}
                    className="back-btn"
                >
                    <ArrowLeft size={16} /> Back to blogs directory
                </Link>

                {/* Blog Post Canvas */}
                <article style={{
                    background: "white",
                    borderRadius: "24px",
                    border: "1px solid var(--border-color)",
                    boxShadow: "var(--shadow-sm)",
                    overflow: "hidden"
                }}>
                    {/* Header cover image */}
                    <div style={{ height: "450px", width: "100%", overflow: "hidden", position: "relative" }}>
                        <img
                            src={blog.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=1200"}
                            alt={blog.title}
                            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
                        />
                    </div>

                    <div style={{ padding: "50px" }}>
                        {/* Meta Tags */}
                        <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "24px", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", fontSize: "13px", fontWeight: "700" }}>
                                <Calendar size={14} />
                                <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600" }}>
                                <Clock size={14} />
                                <span>5 mins read</span>
                            </div>
                            <span className="status-badge" style={{ background: "rgba(124, 58, 237, 0.06)", color: "var(--secondary)", fontWeight: "800", padding: "4px 10px", fontSize: "11px", border: "1px solid rgba(124, 58, 237, 0.15)" }}>
                                Franchise Guide
                            </span>
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: "800", color: "var(--text-dark)", lineHeight: "1.25", marginBottom: "30px" }}>
                            {blog.title}
                        </h1>

                        {/* Content Body */}
                        <div style={{ color: "#334155", fontSize: "16px", lineHeight: "1.8", fontWeight: "400" }}>
                            {paragraphs.map((para, index) => {
                                // Split internal content newlines to simple single breaks if any
                                const subLines = para.split("\n");
                                return (
                                    <p key={index} style={{ marginBottom: "24px", color: "#334155" }}>
                                        {subLines.map((line, lIdx) => (
                                            <span key={lIdx}>
                                                {line}
                                                {lIdx < subLines.length - 1 && <br />}
                                            </span>
                                        ))}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </article>

                {/* JSON-LD FOR ARTICLE/BLOG POST */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Article",
                            "headline": blog.title,
                            "image": [
                                blog.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=1200"
                            ],
                            "datePublished": new Date(blog.createdAt).toISOString(),
                            "author": {
                                "@type": "Organization",
                                "name": "Franchise Roots"
                            },
                            "publisher": {
                                "@type": "Organization",
                                "name": "Franchise Roots",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://www.franchiseroots.com/logo-footer.png"
                                }
                            }
                        })
                    }}
                />

                {/* Suggestion list */}
                {
                    otherBlogs.length > 0 && (
                        <div style={{ marginTop: "60px" }}>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <BookOpen size={20} style={{ color: "var(--primary)" }} /> Reads You Might Like
                            </h3>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                                gap: "24px"
                            }}>
                                {otherBlogs.map(item => (
                                    <Link
                                        href={`/blogs/${item.id || item._id}`}
                                        key={item.id || item._id}
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        <div
                                            style={{
                                                background: "white",
                                                borderRadius: "16px",
                                                border: "1px solid var(--border-color)",
                                                overflow: "hidden",
                                                transition: "all 0.3s ease",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                            className="sugg-card"
                                        >
                                            <div style={{ height: "140px", overflow: "hidden" }}>
                                                <img
                                                    src={item.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=300"}
                                                    alt={item.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
                                                />
                                            </div>
                                            <div style={{ padding: "18px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                                <h4 style={{ fontSize: "14.5px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px", lineHeight: "1.4" }} className="sugg-title">
                                                    {item.title}
                                                </h4>
                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "auto" }}>
                                                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >

            <style jsx global>{`
        .back-btn:hover {
          color: var(--primary) !important;
        }
        .sugg-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-sm);
          border-color: rgba(37, 99, 235, 0.15);
        }
        .sugg-card:hover .sugg-title {
          color: var(--primary) !important;
        }
      `}</style>
        </div >
    );
}
