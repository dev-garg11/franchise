"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search, MapPin, IndianRupee, RotateCcw, Building, Users, Star,
    CheckCircle, ChevronRight, Mail, Phone, Globe, HelpCircle, Filter, Sparkles
} from "lucide-react";

const CATEGORIES = [
    "Food and Beverage",
    "Retail",
    "Education",
    "Automobiles",
    "Health and Wellness",
    "Business Services"
];

const STATES = [
    "New Delhi", "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Haryana",
    "Punjab", "Rajasthan", "Uttar Pradesh", "Kerala", "West Bengal", "Andhra Pradesh"
];

function BrandsDirectoryPage() {
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedBudget, setSelectedBudget] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(6);

    // Reset pagination when active filters change
    useEffect(() => {
        setVisibleCount(6);
    }, [searchTerm, selectedCategory, selectedBudget, selectedLocation]);

    // Handle scroll pagination
    useEffect(() => {
        const handleScroll = () => {
            if (visibleCount >= filteredBrands.length) return;

            // Check if user scrolled near bottom of page
            const scrolledToBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150;

            if (scrolledToBottom) {
                setVisibleCount(prev => Math.min(prev + 6, filteredBrands.length));
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [visibleCount, filteredBrands]);

    // Modal State
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [isEnquiryOnlyMode, setIsEnquiryOnlyMode] = useState(false);
    const [enquirySubmitted, setEnquirySubmitted] = useState(false);
    const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

    // Read URL search params
    const searchParams = useSearchParams();

    useEffect(() => {
        async function fetchBrands() {
            try {
                setLoading(true);
                const res = await fetch("/api/brands?status=Approved");
                if (res.ok) {
                    const data = await res.json();
                    setBrands(data);
                    setFilteredBrands(data);
                }
            } catch (error) {
                console.error("Error fetching brands:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBrands();
    }, []);

    // Pre-fill enquiry form if investor is logged in
    useEffect(() => {
        if (selectedBrand && typeof window !== "undefined") {
            const isLoggedIn = localStorage.getItem("investorLoggedIn") === "true";
            if (isLoggedIn) {
                setEnquiryForm({
                    name: localStorage.getItem("investorName") || "",
                    email: localStorage.getItem("investorEmail") || "",
                    phone: localStorage.getItem("investorPhone") || "",
                    message: ""
                });
            }
        }
    }, [selectedBrand]);

    // Sync URL search params
    useEffect(() => {
        if (brands.length > 0) {
            const categoryParam = searchParams.get("category");
            const locationParam = searchParams.get("location");
            const searchParam = searchParams.get("search");
            if (categoryParam) setSelectedCategory(categoryParam);
            if (locationParam) setSelectedLocation(locationParam);
            if (searchParam) setSearchTerm(searchParam);
        }
    }, [searchParams, brands]);

    // Handle Filtering
    useEffect(() => {
        let result = [...brands];

        if (searchTerm) {
            const keyword = searchTerm.toLowerCase();
            result = result.filter(
                b => b.name.toLowerCase().includes(keyword) ||
                    b.company.toLowerCase().includes(keyword) ||
                    b.description.toLowerCase().includes(keyword)
            );
        }

        if (selectedCategory) {
            result = result.filter(b => b.category === selectedCategory);
        }

        if (selectedLocation) {
            result = result.filter(b => b.hq === selectedLocation);
        }

        if (selectedBudget) {
            result = result.filter(b => {
                const min = b.minInvestment;
                if (selectedBudget === "under-2l") return min < 200000;
                if (selectedBudget === "2l-5l") return min >= 200000 && min <= 500000;
                if (selectedBudget === "5l-10l") return min >= 500000 && min <= 1000000;
                if (selectedBudget === "10l-15l") return min >= 1000000 && min <= 1500000;
                if (selectedBudget === "15l-20l") return min >= 1500000 && min <= 2000000;
                if (selectedBudget === "20l-30l") return min >= 2000000 && min <= 3000000;
                if (selectedBudget === "above-30l") return min > 3000000;
                return true;
            });
        }

        setFilteredBrands(result);
    }, [searchTerm, selectedCategory, selectedBudget, selectedLocation, brands]);

    const handleReset = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedBudget("");
        setSelectedLocation("");
    };

    const formatLakhs = (val) => {
        if (!val) return "N/A";
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
        return `₹${val.toLocaleString("en-IN")}`;
    };

    const handleEnquirySubmit = async (e) => {
        e.preventDefault();
        if (!enquiryForm.name || !enquiryForm.email || !enquiryForm.phone) return;
        setSubmittingEnquiry(true);
        try {
            const res = await fetch("/api/investors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: enquiryForm.name,
                    email: enquiryForm.email,
                    phone: enquiryForm.phone,
                    budgetMin: selectedBrand.minInvestment,
                    budgetMax: selectedBrand.maxInvestment,
                    industries: [selectedBrand.category],
                    preferredLocation: selectedBrand.hq,
                    brandId: selectedBrand.id || selectedBrand._id,
                    brandName: selectedBrand.name,
                    category: selectedBrand.category,
                    investorId: typeof window !== "undefined" ? localStorage.getItem("investorId") : null,
                    comments: `Enquiry submitted for Brand: ${selectedBrand.name}. Message: ${enquiryForm.message || "None"}`
                })
            });
            if (res.ok) {
                setEnquirySubmitted(true);
                setEnquiryForm({ name: "", email: "", phone: "", message: "" });
            }
        } catch (error) {
            console.error("Enquiry submission failed:", error);
        } finally {
            setSubmittingEnquiry(false);
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container" style={{ maxWidth: "1280px" }}>

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
                            <Sparkles size={13} style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} /> Verified Opportunities
                        </span>
                        <h1 style={{ fontSize: "36px", fontWeight: "800", marginTop: "12px", marginBottom: "8px", color: "white" }}>
                            Explore Franchise Brands
                        </h1>
                        <p style={{ color: "#c7d2fe", fontSize: "15px", maxWidth: "600px", lineHeight: "1.6" }}>
                            Discover premium high-ROI investments, contact brand owners directly, and expand your franchise footprint.
                        </p>
                    </div>
                </div>

                {/* Dynamic Inner Layout (Sidebar + Grid View) */}
                <div className="brands-main-layout" style={{
                    display: "grid",
                    gridTemplateColumns: "300px 1fr",
                    gap: "35px"
                }}>

                    {/* SIDEBAR SEARCH PANEL */}
                    <aside className="brands-sidebar" style={{
                        background: "white",
                        borderRadius: "18px",
                        border: "1px solid var(--border-color)",
                        padding: "24px",
                        height: "fit-content",
                        position: "sticky",
                        top: "100px",
                        boxShadow: "var(--shadow-sm)"
                    }}>
                        <h3 style={{
                            fontSize: "16px",
                            fontWeight: "800",
                            color: "var(--text-dark)",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            borderBottom: "1px solid #f1f5f9",
                            paddingBottom: "12px"
                        }}>
                            <Filter size={16} style={{ color: "var(--primary)" }} /> Filter Brands
                        </h3>

                        {/* Keyword Input */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Keyword Search</label>
                            <div style={{ position: "relative" }}>
                                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input
                                    type="text"
                                    placeholder="e.g. Cafe, Retail, Garage"
                                    className="form-input"
                                    style={{ paddingLeft: "34px", fontSize: "13.5px", height: "40px" }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Category Select */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Business Segment</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Segments</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Headquarters State Select */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>HQ State</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">All Regions</option>
                                {STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Budget Limit Select */}
                        <div className="form-group" style={{ marginBottom: "24px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Investment Range</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={selectedBudget}
                                onChange={(e) => setSelectedBudget(e.target.value)}
                            >
                                <option value="">Any Budget</option>
                                <option value="under-2l">Under ₹2 Lakhs</option>
                                <option value="2l-5l">₹2L - ₹5 Lakhs</option>
                                <option value="5l-10l">₹5L - ₹10 Lakhs</option>
                                <option value="10l-15l">₹10L - ₹15 Lakhs</option>
                                <option value="15l-20l">₹15L - ₹20 Lakhs</option>
                                <option value="20l-30l">₹20L - ₹30 Lakhs</option>
                                <option value="above-30l">Above ₹30 Lakhs</option>
                            </select>
                        </div>

                        {/* Reset Button */}
                        {(searchTerm || selectedCategory || selectedLocation || selectedBudget) && (
                            <button
                                className="btn btn-outline"
                                onClick={handleReset}
                                style={{
                                    width: "100%",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    fontSize: "13px",
                                    fontWeight: "700"
                                }}
                            >
                                <RotateCcw size={14} /> Clear All Filters
                            </button>
                        )}
                    </aside>

                    {/* GRID RESULTS OF OPPORTUNITIES */}
                    <main className="brands-results-pane">
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px"
                        }}>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>
                                Showing <strong>{filteredBrands.length}</strong> matching brand listings
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex-center" style={{ minHeight: "300px", flexDirection: "column", gap: "16px", background: "white", borderRadius: "18px", border: "1px solid var(--border-color)" }}>
                                <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                                <p style={{ color: "var(--text-muted)", fontWeight: "600" }}>Querying catalog listings...</p>
                            </div>
                        ) : filteredBrands.length === 0 ? (
                            <div className="flex-center" style={{ minHeight: "350px", flexDirection: "column", background: "white", borderRadius: "18px", border: "1px dashed var(--border-color)", padding: "40px", textAlign: 'center' }}>
                                <HelpCircle size={48} color="var(--text-muted)" style={{ marginBottom: "16px" }} />
                                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px" }}>No Opportunities Found</h3>
                                <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "420px" }}>We couldn't search any approved business logos matching your filter configuration. Try broadening your criteria.</p>
                                <button className="btn btn-primary" onClick={handleReset}>Show All Brands</button>
                            </div>
                        ) : (
                            <>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                                    gap: "24px"
                                }}>
                                    {filteredBrands.slice(0, visibleCount).map((brand) => (
                                        <div
                                            key={brand.id || brand._id}
                                            className="franchise-card"
                                            style={{
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                                background: "white",
                                                borderRadius: "16px",
                                                border: "1px solid var(--border-color)",
                                                overflow: "hidden",
                                                transition: "transform 0.3s ease, box-shadow 0.3s ease"
                                            }}
                                        >
                                            <div className="franchise-card-image" style={{ height: "180px", overflow: "hidden", position: "relative" }}>
                                                <div className="franchise-badge" style={{
                                                    position: "absolute",
                                                    top: "12px",
                                                    left: "12px",
                                                    background: "rgba(30, 27, 75, 0.85)",
                                                    backdropFilter: "blur(8px)",
                                                    color: "white",
                                                    padding: "4px 10px",
                                                    borderRadius: "50px",
                                                    fontSize: "11px",
                                                    fontWeight: "700",
                                                    zIndex: 2
                                                }}>
                                                    {brand.hq}
                                                </div>
                                                <img
                                                    src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                                                    alt={brand.name}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                                                />
                                            </div>
                                            <div className="franchise-card-content" style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                                <span className="franchise-category" style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                                                    {brand.category}
                                                </span>
                                                <h3 className="franchise-title" style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px", lineHeight: "1.3" }}>
                                                    {brand.name}
                                                </h3>
                                                <p style={{
                                                    fontSize: "13px",
                                                    color: "var(--text-muted)",
                                                    marginBottom: "20px",
                                                    lineHeight: "1.5",
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                    minHeight: "58px"
                                                }}>
                                                    {brand.description ? brand.description.replace(/<[^>]*>/g, "") : ""}
                                                </p>

                                                <div style={{ marginTop: "auto" }}>
                                                    <div className="franchise-meta" style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "1fr 1fr",
                                                        gap: "10px",
                                                        borderTop: "1px solid #f1f5f9",
                                                        paddingTop: "14px",
                                                        marginBottom: "16px"
                                                    }}>
                                                        <div className="meta-item">
                                                            <span className="meta-label" style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", marginBottom: "2px", fontWeight: "600" }}>Capital Required</span>
                                                            <span className="meta-value" style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>
                                                                {formatLakhs(brand.minInvestment)}
                                                            </span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <span className="meta-label" style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", marginBottom: "2px", fontWeight: "600" }}>Space Required</span>
                                                            <span className="meta-value" style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-dark)" }}>
                                                                {brand.areaRequired || "Any Area"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="franchise-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                                        <button
                                                            className="btn btn-outline"
                                                            style={{ padding: "10px 0", fontSize: "12.5px", fontWeight: "700", display: "flex", justifyContent: "center" }}
                                                            onClick={() => { setSelectedBrand(brand); setIsEnquiryOnlyMode(false); setEnquirySubmitted(false); }}
                                                        >
                                                            Details
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: "10px 0", fontSize: "12.5px", fontWeight: "700", display: "flex", justifyContent: "center" }}
                                                            onClick={() => { setSelectedBrand(brand); setIsEnquiryOnlyMode(true); setEnquirySubmitted(false); }}
                                                        >
                                                            Apply Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredBrands.length > visibleCount ? (
                                    <div className="flex-center" style={{ margin: "40px 0 20px 0", flexDirection: "column", gap: "10px", width: "100%" }}>
                                        <div className="spinner" style={{ borderTopColor: "var(--primary)", width: "30px", height: "30px", borderWidth: "3px" }}></div>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Loading more brands...</p>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </main>
                </div>
            </div>

            {/* Enquiry / Details Modal Overlay */}
            {selectedBrand && (
                <div className="modal-overlay" onClick={() => setSelectedBrand(null)}>
                    <div className="modal-content" style={isEnquiryOnlyMode ? { maxWidth: "520px" } : {}} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ fontSize: "22px" }}>
                                {isEnquiryOnlyMode ? `Enquiry: ${selectedBrand.name}` : selectedBrand.name}
                            </h3>
                            <button className="close-btn" onClick={() => setSelectedBrand(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            {isEnquiryOnlyMode ? (
                                /* Enquiry Form Mode */
                                <div>
                                    <div className="modal-profile-header" style={{ marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
                                        <img
                                            src={selectedBrand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                                            alt={selectedBrand.name}
                                            style={{ width: "90px", height: "90px", borderRadius: "12px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <span className="status-badge approved" style={{ marginBottom: "6px" }}>Verified Concept</span>
                                            <h4 style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-dark)", margin: "4px 0" }}>{selectedBrand.company}</h4>
                                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category: <strong>{selectedBrand.category}</strong></p>
                                        </div>
                                    </div>

                                    <div className="form-grid" style={{ marginBottom: "24px", background: "#f8fafc", padding: "14px", borderRadius: "10px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                        <div>
                                            <p style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", marginBottom: "2px" }}>Investment Bracket</p>
                                            <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "14px" }}>{formatLakhs(selectedBrand.minInvestment)} - {formatLakhs(selectedBrand.maxInvestment)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600", marginBottom: "2px" }}>HQ Location</p>
                                            <p style={{ fontWeight: "700", fontSize: "14px" }}>{selectedBrand.hq}</p>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                                        <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px", color: "var(--text-dark)" }}>Send Free Enquiry Now</h4>
                                        {enquirySubmitted ? (
                                            <div className="alert flex-center" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.2)", gap: "8px", padding: "20px" }}>
                                                <CheckCircle size={24} />
                                                <div>
                                                    <h4 style={{ color: "var(--success)" }}>Enquiry Submitted Successfully!</h4>
                                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>The brand representatives will contact you shortly on your provided contact details.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleEnquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                    <div className="form-group">
                                                        <label>Your Name <span>*</span></label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="form-input"
                                                            placeholder="Full Name"
                                                            value={enquiryForm.name}
                                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Contact Number <span>*</span></label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            className="form-input"
                                                            placeholder="10-digit mobile"
                                                            value={enquiryForm.phone}
                                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Email Address <span>*</span></label>
                                                    <input
                                                        type="email"
                                                        required
                                                        className="form-input"
                                                        placeholder="email@example.com"
                                                        value={enquiryForm.email}
                                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Message (Optional)</label>
                                                    <textarea
                                                        className="form-input"
                                                        rows="3"
                                                        placeholder={`I am interested in starting a franchise of ${selectedBrand.name}. Please share detailed specifications and catalogs.`}
                                                        value={enquiryForm.message}
                                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                                                    ></textarea>
                                                </div>
                                                <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }} disabled={submittingEnquiry}>
                                                    {submittingEnquiry ? "Submitting..." : "Send Free Enquiry Now"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Full Detail Layout */
                                <div>
                                    <div className="modal-profile-header" style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
                                        <img
                                            src={selectedBrand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                                            alt={selectedBrand.name}
                                            style={{ width: "120px", height: "120px", borderRadius: "12px", objectFit: "cover" }}
                                        />
                                        <div>
                                            <span className="status-badge approved" style={{ marginBottom: "8px" }}>Verified Concept</span>
                                            <p style={{ fontWeight: "700", fontSize: "16px" }}>{selectedBrand.company}</p>
                                            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Category: <strong>{selectedBrand.category}</strong></p>
                                            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Headquarters: <strong>{selectedBrand.hq}</strong></p>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: "24px" }}>
                                        <h4 style={{ fontSize: "16px", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>Business Overview</h4>
                                        <div
                                            style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}
                                            dangerouslySetInnerHTML={{ __html: selectedBrand.description }}
                                        />
                                    </div>

                                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "30px", background: "#f8fafc", padding: "16px", borderRadius: "12px" }}>
                                        <div>
                                            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Investment Bracket</p>
                                            <p style={{ fontWeight: "700", color: "var(--primary)" }}>{formatLakhs(selectedBrand.minInvestment)} - {formatLakhs(selectedBrand.maxInvestment)}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Franchise Fee</p>
                                            <p style={{ fontWeight: "700" }}>{selectedBrand.franchiseFee ? formatLakhs(selectedBrand.franchiseFee) : "Available on Request"}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Royalty Commission</p>
                                            <p style={{ fontWeight: "700" }}>{selectedBrand.royaltyFee || "No Royalty (0%)"}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Space Requirement</p>
                                            <p style={{ fontWeight: "700" }}>{selectedBrand.areaRequired || "N/A"}</p>
                                        </div>
                                    </div>

                                    {/* Enquiry Form */}
                                    <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "20px" }}>
                                        <h4 style={{ fontSize: "16px", marginBottom: "16px" }}>Send Quick Enquiry</h4>
                                        {enquirySubmitted ? (
                                            <div className="alert flex-center" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.2)", gap: "8px", padding: "20px" }}>
                                                <CheckCircle size={24} />
                                                <div>
                                                    <h4 style={{ color: "var(--success)" }}>Enquiry Submitted Successfully!</h4>
                                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>The brand representatives will contact you shortly on your provided contact details.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleEnquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                    <div className="form-group">
                                                        <label>Your Name <span>*</span></label>
                                                        <input
                                                            type="text"
                                                            required
                                                            className="form-input"
                                                            placeholder="Full Name"
                                                            value={enquiryForm.name}
                                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Contact Number <span>*</span></label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            className="form-input"
                                                            placeholder="10-digit mobile"
                                                            value={enquiryForm.phone}
                                                            onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Email Address <span>*</span></label>
                                                    <input
                                                        type="email"
                                                        required
                                                        className="form-input"
                                                        placeholder="email@example.com"
                                                        value={enquiryForm.email}
                                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Message (Optional)</label>
                                                    <textarea
                                                        className="form-input"
                                                        rows="3"
                                                        placeholder="I'm interested in opening this franchise in my city. Please send franchise agreement drafts."
                                                        value={enquiryForm.message}
                                                        onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                                                    ></textarea>
                                                </div>
                                                <button type="submit" className="btn btn-primary" style={{ marginTop: "8px" }} disabled={submittingEnquiry}>
                                                    {submittingEnquiry ? "Submitting..." : "Send Free Enquiry Now"}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Styling override specifically for responsive layout of brands directory */}
            <style jsx global>{`
        @media (max-width: 991px) {
          .brands-main-layout {
            grid-template-columns: 1fr !important;
          }
          .brands-sidebar {
            position: static !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
        .franchise-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        .franchise-card:hover img {
          transform: scale(1.05);
        }
      `}</style>
        </div>
    );
}

export default function BrandsPage() {
    return (
        <Suspense fallback={
            <div className="flex-center" style={{ minHeight: "100vh", flexDirection: "column", gap: "16px" }}>
                <div className="spinner" style={{ borderTopColor: "var(--primary)" }}></div>
                <p style={{ color: "var(--text-muted)" }}>Loading directory content...</p>
            </div>
        }>
            <BrandsDirectoryPage />
        </Suspense>
    );
}
