"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText, ChevronRight, Lock, Mail } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 0" }}>
            <div className="container" style={{ maxWidth: "1000px" }}>

                {/* Navigation Breadcrumb */}
                <div style={{ marginBottom: "24px" }}>
                    <Link href="/" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", padding: "10px 18px" }}>
                        <ArrowLeft size={16} /> Back to Homepage
                    </Link>
                </div>

                {/* Header Hero Section */}
                <div style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                    borderRadius: "24px",
                    padding: "50px 40px",
                    color: "white",
                    marginBottom: "40px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-md)"
                }}>
                    <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.15)", filter: "blur(40px)" }}></div>
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <span className="hero-tag" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#94a3b8", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                            <ShieldCheck size={13} style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle", color: "var(--secondary)" }} /> Privacy Shield Active
                        </span>
                        <h1 style={{ fontSize: "36px", fontWeight: "800", marginTop: "12px", marginBottom: "8px", color: "white" }}>
                            Privacy Policy
                        </h1>
                        <p style={{ color: "#94a3b8", fontSize: "15px", maxWidth: "600px", lineHeight: "1.6" }}>
                            Last Revised: July 29, 2026. This privacy page clarifies how we collect, security-encrypt, and manage your private contact data and lead files.
                        </p>
                    </div>
                </div>

                {/* Content Box */}
                <div className="privacy-card" style={{
                    background: "white",
                    borderRadius: "18px",
                    border: "1px solid var(--border-color)",
                    padding: "40px",
                    boxShadow: "var(--shadow-sm)",
                    lineHeight: "1.75"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(37, 99, 235, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>1</span>
                                Information We Collect
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginBottom: "10px" }}>
                                We collect essential data inputs directly from site interactions to execute matching calculations:
                            </p>
                            <ul style={{ color: "var(--text-muted)", fontSize: "14.5px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <li><strong>Investor Enquiries</strong>: Full Name, Active Phone number, email address, HQ State location, and Available capital.</li>
                                <li><strong>Brand Listings</strong>: Commercial entity name, segment classifications, workspace floor requirements, email coordinates, brand logo images, and financial bounds.</li>
                                <li><strong>Cookies & IP Tracking</strong>: Device browser user-agents and anonymous website analytics page hits to optimize pagination speeds.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(37, 99, 235, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>2</span>
                                How We Use Lead Information
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                All investor enquiry submissions act as direct opt-in requests to match you with your selected franchise brand. By submitting the Apply module form, you explicitly authorize Franchise Roots to forward your profile details to the certified representatives of that specific franchise corporate office.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(37, 99, 235, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>3</span>
                                Third-Party Disclosures & Security
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                We believe in strict consumer privacy rules. We do NOT trade, sell, or commercialize your personal email databases or phone contacts with multi-tier telemarketing firms or irrelevant advertisers. Data is encrypted using HTTPS transmission protocols, and access to database collections is strictly capped behind custom admin security roles.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(37, 99, 235, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>4</span>
                                Your Data Choice Rights
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                Users hold complete authority over their active user details. If you wish to pull down a brand registration listing, wipe your email notifications, or purge matched investor applications from our server nodes, contact us directly at <a style={{ color: "var(--primary)", fontWeight: "600" }} href="mailto:info@franchiseroots.com">info@franchiseroots.com</a>.
                            </p>
                        </section>

                        <div style={{ marginTop: "20px", background: "#f8fafc", padding: "20px 24px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h4 style={{ fontWeight: "700", color: "var(--text-dark)", fontSize: "14.5px" }}>Have personal privacy queries?</h4>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Ask for our compliance lead or verify encryption controls.</p>
                            </div>
                            <a href="mailto:info@franchiseroots.com" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "10px 16px" }}>
                                <Lock size={14} /> Verify Data Security
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
