"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, FileText, ChevronRight, Mail } from "lucide-react";

export default function TermsAndConditions() {
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
                    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
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
                        <span className="hero-tag" style={{ background: "rgba(255, 255, 255, 0.1)", color: "#c7d2fe", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
                            <Scale size={13} style={{ display: "inline-block", marginRight: "6px", verticalAlign: "middle" }} /> Legal Agreement
                        </span>
                        <h1 style={{ fontSize: "36px", fontWeight: "800", marginTop: "12px", marginBottom: "8px", color: "white" }}>
                            Terms & Conditions
                        </h1>
                        <p style={{ color: "#c7d2fe", fontSize: "15px", maxWidth: "600px", lineHeight: "1.6" }}>
                            Last Revised: July 29, 2026. Please read this franchise matching agreement document carefully before listing or exploring catalog opportunities.
                        </p>
                    </div>
                </div>

                {/* Content Box */}
                <div className="terms-card" style={{
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
                                <span style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>1</span>
                                Agreement to Terms
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                By accessing, browsing, registering, or otherwise utilizing the Franchise Roots digital platform, you explicitly consent to abide by these Terms and Conditions. These terms govern the directory lists matching brand operators and potential investors. If you disagree on any clauses, cease interaction with platform features immediately.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>2</span>
                                Brand Listing & Submission Guidelines
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginBottom: "10px" }}>
                                Brands registering for network expansion are subject to the following directory rules:
                            </p>
                            <ul style={{ color: "var(--text-muted)", fontSize: "14.5px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <li>Brands must submit valid GST registration credentials, trademark approvals, and parent corporate certificates.</li>
                                <li>Financial specifications including minimum initial investments, franchise signup fees, and royalty rates must be accurately stated without hiding hidden costs.</li>
                                <li>All submissions go to the "Pending Administration Review" verification queue. We reserve the absolute right to reject listing logos that fail background checks.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>3</span>
                                Investor Matches & Lead Information
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                Investor registrations and enquiry submittals on cards pass client-side lead records (names, email addresses, states and capital limits) directly to the matched brand operator's private inbox dashboard. Franchise Roots facilitates this matching network but does not warranty, guarantee, or underwrite the commercial feasibility of any specific transaction or franchise contract.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>4</span>
                                Intellectual Property Rights
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                All directory structures, logos, website layout codes, and blog assets built on Franchise Roots MERN stack remain our exclusive trademark properties. Users are permitted to use this site for finding active commercial businesses but are strictly prohibited from parsing, scraping, or copying database schemas.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ background: "rgba(99, 102, 241, 0.08)", color: "var(--primary)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>5</span>
                                Liability Disclaimer
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                                Franchise Roots does not verify final business compliance, rental leases, or operational ROI. Investors are directed to perform independent audit reviews, review franchise agreements with legal attorneys, and perform field surveys before depositing application fees to any listed brand.
                            </p>
                        </section>

                        <div style={{ marginTop: "20px", background: "#f8fafc", padding: "20px 24px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                            <div>
                                <h4 style={{ fontWeight: "700", color: "var(--text-dark)", fontSize: "14.5px" }}>Have legal questions or concerns?</h4>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Get in touch with our commercial legal advisory desk.</p>
                            </div>
                            <a href="mailto:info@franchiseroots.com" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "10px 16px" }}>
                                <Mail size={14} /> Contact Legal Desk
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
