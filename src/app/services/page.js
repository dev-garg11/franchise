"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, ArrowRight, MessageCircle, Building2, CheckCircle2, ShieldCheck, Sparkles, Search } from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import PageHeader from "@/components/public/PageHeader";
import { DEFAULT_SERVICES } from "@/lib/defaultContent";

export default function ServicesPage() {
    const [services, setServices] = useState(DEFAULT_SERVICES);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 8000);
        fetch("/api/services", { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setServices(data);
            })
            .catch((err) => {
                if (err.name !== "AbortError") console.error("Failed to fetch services:", err);
            })
            .finally(() => window.clearTimeout(timeout));
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    const filteredServices = services.filter((s) =>
        (s.title || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (s.content || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );
    const headerServices = services.filter((service) => service?.isActive !== false).slice(0, 4);

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <PageHeader
                theme="services"
                eyebrow={<><Sparkles size={15} /> ADMIN-MANAGED SERVICES &amp; ADVISORY</>}
                titleBefore="Comprehensive Franchise & "
                titleAccent="Business Services"
                subtitle="From initial brand evaluation and investor matchmaking to legal compliance and national expansion, our expert team manages end-to-end solutions."
                leftExtra={(
                    <form className="page-header-search" onSubmit={(event) => event.preventDefault()}>
                        <Search size={19} aria-hidden="true" />
                        <label className="sr-only" htmlFor="services-page-search">Search services</label>
                        <input
                            id="services-page-search"
                            type="text"
                            placeholder="Search services by keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit">Search</button>
                    </form>
                )}
                rightVisual={headerServices.length > 0 ? (
                    <div className="page-header-tile-grid">
                        {headerServices.map((service, index) => (
                            <div className="page-header-tile" key={service.id || service._id || service.title} style={{ "--tile-delay": `${index * 120}ms` }}>
                                <span className="page-header-tile-icon"><Building2 size={21} /></span>
                                <span><strong>{service.title}</strong><small>Business service</small></span>
                            </div>
                        ))}
                    </div>
                ) : null}
            />

            {/* Services Grid Content */}
            <main style={{ flex: 1, padding: "60px 0 100px 0" }}>
                <div className="container">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
                            <div className="spinner" style={{ margin: "0 auto 16px auto" }}></div>
                            <p style={{ fontSize: "16px", fontWeight: "600" }}>Loading available services...</p>
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 0", background: "#ffffff", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                            <Wrench size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
                            <h3 style={{ fontSize: "20px", color: "#1e293b", marginBottom: "8px" }}>No Services Found</h3>
                            <p style={{ color: "#64748b", fontSize: "14px" }}>Try adjusting your search criteria.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                            gap: "30px"
                        }}>
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id || service._id}
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "20px",
                                        overflow: "hidden",
                                        border: "1px solid var(--border-color)",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                                    }}
                                    className="card-hover-effect"
                                >
                                    <div style={{ position: "relative", height: "210px", overflow: "hidden" }}>
                                        <img
                                            src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"}
                                            alt={service.title}
                                            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
                                        />
                                    </div>
                                    <div style={{ padding: "28px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                                        <div>
                                            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "12px", lineHeight: "1.3" }}>
                                                {service.title}
                                            </h3>
                                            <p style={{
                                                fontSize: "14px",
                                                color: "#475569",
                                                lineHeight: "1.7",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 4,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                marginBottom: "24px"
                                            }}>
                                                {service.content}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <Link
                                                href={`/services/${service.id || service._id}`}
                                                className="btn btn-outline"
                                                style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: "700", textAlign: "center", textDecoration: "none" }}
                                            >
                                                Learn More
                                            </Link>
                                            <a
                                                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi, I am interested in your service: ${service.title}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn"
                                                style={{
                                                    background: "#25D366",
                                                    color: "#ffffff",
                                                    padding: "12px 16px",
                                                    borderRadius: "10px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center"
                                                }}
                                                title="Inquire via WhatsApp"
                                            >
                                                <MessageCircle size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* DYNAMIC SEO + GEO TAGS */}
                    <SEOGeoTags categoryName="Advisory Services" basePath="/services" />
                </div>
            </main>
        </div>
    );
}
