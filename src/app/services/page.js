"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Wrench, ArrowRight, MessageCircle, Building2, CheckCircle2, ShieldCheck, Sparkles, Search } from "lucide-react";

export default function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetch("/api/services")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setServices(data);
            })
            .catch((err) => console.error("Failed to fetch services:", err))
            .finally(() => setLoading(false));
    }, []);

    const filteredServices = services.filter((s) =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Hero Header Banner */}
            <section style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
                color: "#ffffff",
                padding: "80px 0 60px 0",
                position: "relative",
                overflow: "hidden"
            }}>
                <div className="container" style={{ textAlign: "center", maxWidth: "800px" }}>
                    <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255,255,255,0.12)",
                        color: "#a7f3d0",
                        padding: "6px 16px",
                        borderRadius: "30px",
                        fontSize: "13px",
                        fontWeight: "700",
                        marginBottom: "20px"
                    }}>
                        <Sparkles size={16} /> Admin-Managed Services & Advisory
                    </span>
                    <h1 style={{ fontSize: "42px", fontWeight: "900", color: "#ffffff", marginBottom: "16px", lineHeight: "1.2" }}>
                        Comprehensive Franchise & Business Services
                    </h1>
                    <p style={{ fontSize: "17px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "32px" }}>
                        From initial brand evaluation and investor matchmaking to legal compliance and national expansion, our expert team manages end-to-end solutions.
                    </p>

                    {/* Search Input */}
                    <div style={{
                        maxWidth: "500px",
                        margin: "0 auto",
                        position: "relative"
                    }}>
                        <Search size={20} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Search services by keyword..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px 14px 48px",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.1)",
                                backdropFilter: "blur(10px)",
                                color: "#ffffff",
                                fontSize: "15px",
                                outline: "none"
                            }}
                        />
                    </div>
                </div>
            </section>

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
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                </div>
            </main>
        </div>
    );
}
