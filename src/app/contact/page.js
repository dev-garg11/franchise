"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle, Info, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { toast } from "@/lib/swal";
import PageHeader from "@/components/public/PageHeader";

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "Franchise Enquiry",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        let finalValue = value;
        if (name === "phone") {
            finalValue = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.message) {
            setError("Please fill out all required fields.");
            toast.warning("Please fill out all required fields.");
            return;
        }

        setError("");
        setLoading(true);

        // Simulate API Submission
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            toast.success("Message sent! Our franchise advisors will contact you shortly.");

            // Store in localStorage for debugging/admin panel tracking
            try {
                const existing = JSON.parse(localStorage.getItem("contact_submissions") || "[]");
                existing.push({
                    ...formData,
                    date: new Date().toISOString(),
                    id: Date.now()
                });
                localStorage.setItem("contact_submissions", JSON.stringify(existing));
            } catch (err) {
                console.error("Local storage error:", err);
            }
        }, 1500);
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "60px 0" }}>
            <div className="container" style={{ maxWidth: "1100px" }}>

                <PageHeader
                    theme="contact"
                    eyebrow={<><Clock size={14} /> SUPPORT DESK ONLINE</>}
                    titleBefore="Contact Our "
                    titleAccent="Advisors"
                    subtitle="Get verified guidance from start to launch. Connect with India's most trusted franchise advisory and investment solutions experts."
                    leftExtra={<Link href="/" className="page-header-back"><ArrowLeft size={14} /> Back to Homepage</Link>}
                    rightVisual={(
                        <div className="page-header-link-stack">
                            <a href="tel:+919815489999" className="page-header-link-card page-header-link-card--blue"><span><Phone size={20} /></span><strong>Call us<small>+91-9815489999</small></strong><ArrowRight size={17} /></a>
                            <a href="https://wa.me/919815489999" className="page-header-link-card page-header-link-card--green"><span><MessageCircle size={20} /></span><strong>WhatsApp Advisory<small>Chat with our advisory team</small></strong><ArrowRight size={17} /></a>
                            <a href="#office-information" className="page-header-link-card page-header-link-card--red"><span><MapPin size={20} /></span><strong>Visit our office<small>Chandigarh HQ</small></strong><ArrowRight size={17} /></a>
                        </div>
                    )}
                />

                {/* Major Columns Card Wrapper */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "40px"
                }}>

                    {/* Left Column: Contact info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* Direct Info Card */}
                        <div id="office-information" style={{
                            background: "white",
                            borderRadius: "18px",
                            border: "1px solid var(--border-color)",
                            padding: "30px",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "20px" }}>
                                Office Information
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div className="flex-center" style={{ background: "var(--primary-glow)", color: "var(--primary)", width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0 }}>
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Call Consulting Desk</h4>
                                        <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-dark)" }}>+91-9815489999</p>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Mon to Sat, 10:00 AM - 7:00 PM</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div className="flex-center" style={{ background: "var(--primary-glow)", color: "var(--primary)", width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0 }}>
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Corporate Email</h4>
                                        <a href="mailto:info@franchiseroots.com" style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)", textDecoration: "underline" }}>
                                            info@franchiseroots.com
                                        </a>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Typically replies within 2 hours</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                    <div className="flex-center" style={{ background: "var(--primary-glow)", color: "var(--primary)", width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0 }}>
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Head Office</h4>
                                        <p style={{ fontSize: "14.5px", fontWeight: "600", color: "var(--text-dark)", lineHeight: "1.5" }}>
                                            SCO 64-65, 4th Floor, Sub. City Center, Sector 34A, Chandigarh, India
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Quick Advisory Board Info */}
                        <div style={{
                            background: "white",
                            borderRadius: "18px",
                            border: "1px solid var(--border-color)",
                            padding: "30px",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <HelpCircle size={18} style={{ color: "var(--secondary)" }} /> Free Brand Consultations
                            </h3>
                            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
                                Looking to expand your brand or purchase a franchise? Fill out the contact desk form, and a dedicated partnership specialist will verify your profile details and help you construct your business roadmap. Let us connect you to target investors or premium brands.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Contact form */}
                    <div style={{
                        background: "white",
                        borderRadius: "18px",
                        border: "1px solid var(--border-color)",
                        padding: "40px 30px",
                        boxShadow: "var(--shadow-sm)"
                    }}>
                        {submitted ? (
                            <div style={{ textAlign: "center", padding: "40px 10px" }}>
                                <div className="flex-center" style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--secondary-glow)", color: "var(--secondary)", margin: "0 auto 24px auto" }}>
                                    <CheckCircle size={36} />
                                </div>
                                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "12px" }}>
                                    Enquiry Submitted!
                                </h2>
                                <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "30px" }}>
                                    Thank you, <strong>{formData.name}</strong>. Your support ticket has been registered. An expert business consulting representative will connect with you via email or mobile lookup shortly.
                                </p>
                                <button
                                    onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "Franchise Enquiry", message: "" }); }}
                                    className="btn btn-outline"
                                    style={{ fontSize: "13.5px", fontWeight: "700", padding: "12px 24px" }}
                                >
                                    Submit Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px" }}>
                                    Leave a Message
                                </h3>

                                {error && (
                                    <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", fontSize: "13.5px", padding: '10px 14px', borderRadius: "8px", textAlign: "center" }}>
                                        {error}
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)" }}>Full Name <span style={{ color: "var(--danger)" }}>*</span></label>
                                    <input
                                        type="text"
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Vishal Bhatt"
                                        style={{
                                            width: "100%",
                                            border: "1.5px solid #D1D5DB",
                                            borderRadius: "8px",
                                            padding: "12px 14px",
                                            fontSize: "14.5px",
                                            color: "var(--text-dark)",
                                            backgroundColor: "#F8FAFC",
                                            outline: "none",
                                            transition: "all 0.2s ease-in-out"
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = "var(--primary)";
                                            e.currentTarget.style.backgroundColor = "#ffffff";
                                            e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow)";
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = "#D1D5DB";
                                            e.currentTarget.style.backgroundColor = "#F8FAFC";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)" }}>Email Coordinates <span style={{ color: "var(--danger)" }}>*</span></label>
                                        <input
                                            type="email"
                                            required
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="e.g. coder@example.com"
                                            style={{
                                                width: "100%",
                                                border: "1.5px solid #D1D5DB",
                                                borderRadius: "8px",
                                                padding: "12px 14px",
                                                fontSize: "14.5px",
                                                color: "var(--text-dark)",
                                                backgroundColor: "#F8FAFC",
                                                outline: "none",
                                                transition: "all 0.2s ease-in-out"
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = "var(--primary)";
                                                e.currentTarget.style.backgroundColor = "#ffffff";
                                                e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow)";
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = "#D1D5DB";
                                                e.currentTarget.style.backgroundColor = "#F8FAFC";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)" }}>Mobile / Phone <span style={{ color: "var(--danger)" }}>*</span></label>
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            pattern="[0-9]{10}"
                                            required
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. +91 9660025250"
                                            style={{
                                                width: "100%",
                                                border: "1.5px solid #D1D5DB",
                                                borderRadius: "8px",
                                                padding: "12px 14px",
                                                fontSize: "14.5px",
                                                color: "var(--text-dark)",
                                                backgroundColor: "#F8FAFC",
                                                outline: "none",
                                                transition: "all 0.2s ease-in-out"
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = "var(--primary)";
                                                e.currentTarget.style.backgroundColor = "#ffffff";
                                                e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow)";
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = "#D1D5DB";
                                                e.currentTarget.style.backgroundColor = "#F8FAFC";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)" }}>Subject Type</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        style={{
                                            width: "100%",
                                            border: "1.5px solid #D1D5DB",
                                            borderRadius: "8px",
                                            padding: "12px 14px",
                                            fontSize: "14.5px",
                                            color: "var(--text-dark)",
                                            backgroundColor: "#F8FAFC",
                                            outline: "none",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease-in-out"
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = "var(--primary)";
                                            e.currentTarget.style.backgroundColor = "#ffffff";
                                            e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow)";
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = "#D1D5DB";
                                            e.currentTarget.style.backgroundColor = "#F8FAFC";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <option value="Franchise Enquiry">Franchise Buying Enquiry</option>
                                        <option value="Brand Partnership">List My Brand Promotion</option>
                                        <option value="Consultancy Desk">General Business Guidance</option>
                                        <option value="Technical Support">Technical Accounts Help</option>
                                    </select>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)" }}>Your Message <span style={{ color: "var(--danger)" }}>*</span></label>
                                    <textarea
                                        required
                                        rows={4}
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Provide details about your query..."
                                        style={{
                                            width: "100%",
                                            border: "1.5px solid #D1D5DB",
                                            borderRadius: "8px",
                                            padding: "12px 14px",
                                            fontSize: "14.5px",
                                            color: "var(--text-dark)",
                                            backgroundColor: "#F8FAFC",
                                            outline: "none",
                                            resize: "vertical",
                                            fontFamily: "inherit",
                                            transition: "all 0.2s ease-in-out"
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = "var(--primary)";
                                            e.currentTarget.style.backgroundColor = "#ffffff";
                                            e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-glow)";
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = "#D1D5DB";
                                            e.currentTarget.style.backgroundColor = "#F8FAFC";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: "100%",
                                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "var(--radius-sm, 8px)",
                                        padding: "14px 24px",
                                        fontSize: "14.5px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease-in-out",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "8px",
                                        boxShadow: "0 4px 18px rgba(37, 99, 235, 0.25)",
                                        marginTop: "10px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, var(--primary-hover) 0%, var(--secondary-hover) 100%)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 99, 235, 0.35)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)";
                                        e.currentTarget.style.boxShadow = "0 4px 18px rgba(37, 99, 235, 0.25)";
                                        e.currentTarget.style.transform = "none";
                                    }}
                                >
                                    {loading ? (
                                        "Sending Message..."
                                    ) : (
                                        <>
                                            <Send size={15} /> Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
