"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    MessageCircle,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Wrench,
    Building2,
    PhoneCall,
    ArrowRight,
    Clock,
    Award
} from "lucide-react";

export default function ServiceDetailPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [service, setService] = useState(null);
    const [otherServices, setOtherServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getServiceData() {
            try {
                const [serviceRes, allServicesRes] = await Promise.all([
                    fetch(`/api/services/${id}`),
                    fetch("/api/services")
                ]);

                if (serviceRes.ok) {
                    const serviceData = await serviceRes.json();
                    setService(serviceData);
                } else {
                    setError(true);
                }

                if (allServicesRes.ok) {
                    const allServices = await allServicesRes.json();
                    if (Array.isArray(allServices)) {
                        setOtherServices(
                            allServices
                                .filter((s) => (s.id || s._id) !== id)
                                .slice(0, 3)
                        );
                    }
                }
            } catch (err) {
                console.error("Failed to load service data:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            getServiceData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "16px" }}>
                <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                <p style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "600" }}>Loading service details...</p>
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="flex-center" style={{ minHeight: "80vh", flexDirection: "column", gap: "20px", textAlign: "center", padding: "40px 20px" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#fef2f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ef4444"
                }}>
                    <Wrench size={40} />
                </div>
                <h2 style={{ fontSize: "28px", color: "var(--text-dark)", fontWeight: "800" }}>Service Not Found</h2>
                <p style={{ color: "var(--text-muted)", maxWidth: "500px", lineHeight: "1.6" }}>
                    The service you are looking for does not exist or may have been updated. Explore our full catalog of advisory services below.
                </p>
                <Link href="/services" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}>
                    <ArrowLeft size={18} /> Back to Services Directory
                </Link>
            </div>
        );
    }

    const paragraphs = service.content ? service.content.split("\n\n").filter(Boolean) : [];

    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
        `Hi Franchise Roots team, I am interested in your service: ${service.title}`
    )}`;

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Hero Banner */}
            <section style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
                color: "#ffffff",
                padding: "60px 0 50px 0",
                position: "relative",
                overflow: "hidden"
            }}>
                <div className="container" style={{ maxWidth: "1100px" }}>
                    {/* Back Link */}
                    <Link
                        href="/services"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#cbd5e1",
                            marginBottom: "24px",
                            textDecoration: "none",
                            transition: "color 0.2s ease"
                        }}
                        className="service-back-btn"
                    >
                        <ArrowLeft size={16} /> Back to All Services
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            background: "rgba(255,255,255,0.12)",
                            color: "#a7f3d0",
                            padding: "6px 16px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: "700"
                        }}>
                            <Sparkles size={15} /> Admin-Managed Service
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(26px, 4vw, 42px)",
                        fontWeight: "900",
                        color: "#ffffff",
                        marginBottom: "16px",
                        lineHeight: "1.25",
                        maxWidth: "850px"
                    }}>
                        {service.title}
                    </h1>

                    <p style={{
                        fontSize: "16px",
                        color: "#cbd5e1",
                        lineHeight: "1.6",
                        maxWidth: "750px"
                    }}>
                        Tailored business advisory and franchise solutions designed by industry experts to help you scale seamlessly.
                    </p>
                </div>
            </section>

            {/* Main Service Content */}
            <main style={{ flex: 1, padding: "50px 0 90px 0" }}>
                <div className="container" style={{ maxWidth: "1100px" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 340px",
                        gap: "40px",
                        alignItems: "start"
                    }} className="service-content-grid">

                        {/* Left Column: Service Details */}
                        <div>
                            {/* Service Image Banner */}
                            <div style={{
                                width: "100%",
                                height: "380px",
                                borderRadius: "24px",
                                overflow: "hidden",
                                border: "1px solid var(--border-color)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                                marginBottom: "36px"
                            }}>
                                <img
                                    src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200"}
                                    alt={service.title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>

                            {/* Detailed Description */}
                            <div style={{
                                background: "#ffffff",
                                borderRadius: "24px",
                                border: "1px solid var(--border-color)",
                                padding: "40px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                                marginBottom: "36px"
                            }}>
                                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "20px" }}>
                                    Service Overview
                                </h2>

                                <div style={{ color: "#334155", fontSize: "16px", lineHeight: "1.8", fontWeight: "400" }}>
                                    {paragraphs.length > 0 ? (
                                        paragraphs.map((para, idx) => {
                                            const lines = para.split("\n");
                                            return (
                                                <p key={idx} style={{ marginBottom: "20px", color: "#334155" }}>
                                                    {lines.map((line, lIdx) => (
                                                        <span key={lIdx}>
                                                            {line}
                                                            {lIdx < lines.length - 1 && <br />}
                                                        </span>
                                                    ))}
                                                </p>
                                            );
                                        })
                                    ) : (
                                        <p style={{ color: "#334155" }}>{service.content}</p>
                                    )}
                                </div>
                            </div>

                            {/* Service Key Highlights */}
                            <div style={{
                                background: "#ffffff",
                                borderRadius: "24px",
                                border: "1px solid var(--border-color)",
                                padding: "36px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                                marginBottom: "36px"
                            }}>
                                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Award size={22} style={{ color: "var(--primary)" }} /> Why Choose Our {service.title}?
                                </h3>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <CheckCircle2 size={20} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                                        <div>
                                            <strong style={{ display: "block", color: "#0f172a", fontSize: "14.5px", fontWeight: "700" }}>End-to-End Advisory</strong>
                                            <span style={{ color: "#64748b", fontSize: "13px" }}>Comprehensive assistance from strategy to execution.</span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <ShieldCheck size={20} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                                        <div>
                                            <strong style={{ display: "block", color: "#0f172a", fontSize: "14.5px", fontWeight: "700" }}>Verified Industry Expertise</strong>
                                            <span style={{ color: "#64748b", fontSize: "13px" }}>17+ years of experience across 1,000+ brand rollouts.</span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <Clock size={20} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                                        <div>
                                            <strong style={{ display: "block", color: "#0f172a", fontSize: "14.5px", fontWeight: "700" }}>Rapid Turnaround</strong>
                                            <span style={{ color: "#64748b", fontSize: "13px" }}>Dedicated account manager assigned within 24 hours.</span>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                        <Building2 size={20} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                                        <div>
                                            <strong style={{ display: "block", color: "#0f172a", fontSize: "14.5px", fontWeight: "700" }}>100% Confidentiality</strong>
                                            <span style={{ color: "#64748b", fontSize: "13px" }}>Strict NDA and privacy protocols for brand operations.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar: Action Widget */}
                        <div style={{ position: "sticky", top: "100px" }}>
                            {/* Consultation CTA Card */}
                            <div style={{
                                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                                borderRadius: "24px",
                                padding: "32px",
                                color: "#ffffff",
                                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
                                marginBottom: "28px"
                            }}>
                                <span style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "rgba(37, 211, 102, 0.2)",
                                    color: "#4ade80",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    marginBottom: "16px"
                                }}>
                                    <PhoneCall size={14} /> Instant Inquiry
                                </span>
                                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginBottom: "10px", lineHeight: "1.3" }}>
                                    Interested in this Service?
                                </h3>
                                <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "24px" }}>
                                    Connect directly with our franchise consultants for customized guidance and pricing details.
                                </p>

                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn"
                                    style={{
                                        width: "100%",
                                        background: "#25D366",
                                        color: "#ffffff",
                                        fontWeight: "800",
                                        padding: "14px",
                                        borderRadius: "14px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        fontSize: "15px",
                                        boxShadow: "0 8px 20px rgba(37, 211, 102, 0.3)",
                                        textDecoration: "none"
                                    }}
                                >
                                    <MessageCircle size={20} /> Inquire via WhatsApp
                                </a>

                                <Link
                                    href="/contact"
                                    className="btn btn-outline"
                                    style={{
                                        width: "100%",
                                        marginTop: "12px",
                                        padding: "12px",
                                        borderRadius: "14px",
                                        fontSize: "14px",
                                        fontWeight: "700",
                                        color: "#ffffff",
                                        borderColor: "rgba(255,255,255,0.2)",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        display: "block"
                                    }}
                                >
                                    Contact Support Form
                                </Link>
                            </div>

                            {/* Quick Info Box */}
                            <div style={{
                                background: "#ffffff",
                                borderRadius: "20px",
                                border: "1px solid var(--border-color)",
                                padding: "24px"
                            }}>
                                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                                    Need Custom Solutions?
                                </h4>
                                <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6" }}>
                                    We offer custom packages tailored for single-unit investors, multi-unit regional franchisees, and corporate brand owners.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Other Services Section */}
                    {otherServices.length > 0 && (
                        <div style={{ marginTop: "70px", paddingTop: "50px", borderTop: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                <div>
                                    <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>
                                        Explore Other Services
                                    </h3>
                                    <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                                        Discover more ways we can help grow your business.
                                    </p>
                                </div>
                                <Link href="/services" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px" }}>
                                    View All <ArrowRight size={15} />
                                </Link>
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: "24px"
                            }}>
                                {otherServices.map((item) => (
                                    <Link
                                        key={item.id || item._id}
                                        href={`/services/${item.id || item._id}`}
                                        style={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        <div style={{
                                            background: "#ffffff",
                                            borderRadius: "18px",
                                            border: "1px solid var(--border-color)",
                                            overflow: "hidden",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                                            transition: "all 0.3s ease",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column"
                                        }} className="card-hover-effect">
                                            <div style={{ height: "160px", overflow: "hidden" }}>
                                                <img
                                                    src={item.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"}
                                                    alt={item.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            </div>
                                            <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                                                <div>
                                                    <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", lineHeight: "1.3" }}>
                                                        {item.title}
                                                    </h4>
                                                    <p style={{
                                                        fontSize: "13px",
                                                        color: "#64748b",
                                                        lineHeight: "1.6",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden"
                                                    }}>
                                                        {item.content}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    fontSize: "13px",
                                                    fontWeight: "700",
                                                    color: "var(--primary)",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    marginTop: "16px"
                                                }}>
                                                    View Details <ArrowRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                .service-back-btn:hover {
                    color: #ffffff !important;
                }
                @media (max-width: 900px) {
                    .service-content-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
