"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Search, Clock } from "lucide-react";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchBlogs() {
            try {
                const res = await fetch("/api/blogs");
                if (res.ok) {
                    const data = await res.json();
                    setBlogs(data);
                }
            } catch (error) {
                console.error("Failed to load blogs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
    const regularBlogs = filteredBlogs.length > 1 ? filteredBlogs.slice(1) : [];

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 0" }}>
            {/* Blog Hero Header */}
            <section className="container" style={{ marginBottom: "50px", textAlign: "center" }}>
                <div style={{
                    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                    color: "white",
                    borderRadius: "24px",
                    padding: "50px 30px",
                    boxShadow: "var(--shadow-lg)",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "300px",
                        height: "300px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(124, 58, 237, 0.15), transparent 70%)",
                        filter: "blur(60px)",
                        pointerEvents: "none"
                    }}></div>

                    <BookOpen size={40} style={{ color: "var(--primary)", marginBottom: "16px" }} />
                    <h1 style={{ color: "white", fontSize: "36px", fontWeight: "800", marginBottom: "12px" }}>
                        Insights & Industry Updates
                    </h1>
                    <p style={{ color: "#94A3B8", fontSize: "16px", maxWidth: "600px", margin: "0 auto 30px auto" }}>
                        Explore franchise tips, business startup advice, and market expansion strategies curated by our investment experts.
                    </p>

                    {/* Search Box */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        padding: "8px 18px",
                        borderRadius: "50px",
                        maxWidth: "450px",
                        margin: "0 auto",
                        transition: "all 0.3s ease"
                    }}>
                        <Search size={18} style={{ color: "#94A3B8" }} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "white",
                                width: "100%",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Main Blog Content */}
            <section className="container">
                {loading ? (
                    <div className="flex-center" style={{ minHeight: "250px", flexDirection: "column", gap: "16px" }}>
                        <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                        <p style={{ color: "var(--text-muted)" }}>Loading articles directory...</p>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                        <p style={{ fontSize: "16px", color: "var(--text-muted)", fontWeight: "600" }}>No articles found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Blog Post */}
                        {!searchTerm && featuredBlog && (
                            <div style={{
                                background: "white",
                                borderRadius: "20px",
                                overflow: "hidden",
                                border: "1px solid var(--border-color)",
                                boxShadow: "var(--shadow-sm)",
                                display: "grid",
                                gridTemplateColumns: "1.2fr 1fr",
                                marginBottom: "50px",
                                transition: "all 0.3s ease",
                                cursor: "pointer"
                            }}
                                className="featured-blog-card"
                            >
                                <div style={{ overflow: "hidden", position: "relative", minHeight: "320px" }}>
                                    <img
                                        src={featuredBlog.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=800"}
                                        alt={featuredBlog.title}
                                        style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff", transition: "transform 0.4s ease" }}
                                        className="blog-image"
                                    />
                                    <span style={{
                                        position: "absolute",
                                        top: "20px",
                                        left: "20px",
                                        background: "var(--primary)",
                                        color: "white",
                                        fontSize: "12px",
                                        fontWeight: "800",
                                        padding: "6px 14px",
                                        borderRadius: "50px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em"
                                    }}>Featured Article</span>
                                </div>
                                <div style={{ padding: "40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px", marginBottom: "14px", fontWeight: "600" }}>
                                        <Calendar size={13} />
                                        <span>{new Date(featuredBlog.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>

                                    <h2 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "16px", lineHeight: "1.3" }}>
                                        {featuredBlog.title}
                                    </h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: "1.7", marginBottom: "24px" }}>
                                        {featuredBlog.content && featuredBlog.content.length > 220 ? `${featuredBlog.content.substring(0, 220)}...` : featuredBlog.content}
                                    </p>

                                    <Link href={`/blogs/${featuredBlog.id || featuredBlog._id}`} className="btn btn-primary" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px" }}>
                                        Read Full Article <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* List Grids */}
                        <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "24px" }}>
                            {searchTerm ? "Articles Search Results" : "Latest Publications"}
                        </h3>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
                            gap: "30px"
                        }}>
                            {(searchTerm ? filteredBlogs : regularBlogs).map(blog => (
                                <article
                                    key={blog.id || blog._id}
                                    style={{
                                        background: "white",
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        border: "1px solid var(--border-color)",
                                        boxShadow: "var(--shadow-sm)",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: "100%",
                                        transition: "all 0.3s ease"
                                    }}
                                    className="blog-grid-card"
                                >
                                    <div style={{ height: "200px", overflow: "hidden", position: "relative" }}>
                                        <img
                                            src={blog.image || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&q=80&w=400"}
                                            alt={blog.title}
                                            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff", transition: "transform 0.4s ease" }}
                                            className="blog-image"
                                        />
                                    </div>
                                    <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>
                                            <Calendar size={12} />
                                            <span>{new Date(blog.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>

                                        <h4 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", lineHeight: "1.4", flexGrow: 0 }}>
                                            <Link href={`/blogs/${blog.id || blog._id}`} style={{ color: "inherit" }} className="blog-title-link">
                                                {blog.title}
                                            </Link>
                                        </h4>

                                        <p style={{ color: "var(--text-muted)", fontSize: "13.5px", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }}>
                                            {blog.content && blog.content.length > 120 ? `${blog.content.substring(0, 120)}...` : blog.content}
                                        </p>

                                        <Link
                                            href={`/blogs/${blog.id || blog._id}`}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontWeight: "700",
                                                fontSize: "13.5px",
                                                color: "var(--primary)",
                                                marginTop: "auto"
                                            }}
                                            className="read-more-link"
                                        >
                                            Read Article <ArrowRight size={14} className="arrow-icon" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Embedded CSS for premium micro-animations */}
            <style jsx global>{`
        .featured-blog-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
        }
        .featured-blog-card:hover .blog-image, 
        .blog-grid-card:hover .blog-image {
          transform: scale(1.04);
        }
        .blog-grid-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-md);
          border-color: rgba(37, 99, 235, 0.2);
        }
        .blog-title-link {
          transition: color 0.2s ease;
        }
        .blog-title-link:hover {
          color: var(--primary) !important;
        }
        .read-more-link .arrow-icon {
          transition: transform 0.2s ease;
        }
        .read-more-link:hover .arrow-icon {
          transform: translateX(4px);
        }
      `}</style>
        </div>
    );
}
