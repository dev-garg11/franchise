"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search, MapPin, IndianRupee, RotateCcw, Building, Users, Star,
    CheckCircle, ChevronRight, Mail, Phone, Globe, HelpCircle, Filter, Sparkles, MessageCircle, X
} from "lucide-react";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import { useApprovedBrands } from "@/lib/brandsCache";
import { DISTRICTS_BY_STATE, ALL_DISTRICTS } from "@/lib/districtsData";
import { getFilteredMinBudgets, getFilteredMaxBudgets, parseRupeeValue } from "@/lib/investmentData";

const CATEGORIES = [
    "Automotive", "Beauty & Health", "Business Services", "Dealers & Distributors",
    "Education", "Fashion", "Food and Beverage", "Home Based Business",
    "Hotel, Travel & Tourism", "Retail", "Sports, Fitness & Entertainment"
];

const STATES = [
    "Andaman and Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Delhi NCR", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
    "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];



const STATE_ALIAS_MAP = {
    "andaman and nicobar": ["port blair", "andaman"],
    "andhra pradesh": ["ap", "visakhapatnam", "vijayawada", "guntur", "nellore", "kurnool", "tirupati", "andhra pradesh"],
    "arunachal pradesh": ["itanagar", "arunachal"],
    "assam": ["guwahati", "silchar", "dibrugarh", "assam"],
    "bihar": ["patna", "gaya", "bhagalpur", "muzaffarpur", "bihar"],
    "chandigarh": ["chandigarh", "mohali", "panchkula"],
    "chhattisgarh": ["raipur", "bhilai", "bilaspur", "chhattisgarh"],
    "delhi ncr": ["dl", "delhi", "new delhi", "noida", "gurgaon", "gurugram", "ncr", "faridabad", "ghaziabad"],
    "new delhi": ["dl", "delhi", "new delhi", "noida", "gurgaon", "gurugram", "ncr", "faridabad", "ghaziabad"],
    "goa": ["panaji", "margao", "goa"],
    "gujarat": ["gj", "ahmedabad", "surat", "vadodara", "rajkot", "gujarat"],
    "haryana": ["hr", "gurgaon", "gurugram", "faridabad", "panipat", "haryana"],
    "himachal pradesh": ["hp", "shimla", "dharamshala", "himachal pradesh"],
    "jammu and kashmir": ["jk", "srinagar", "jammu", "kashmir"],
    "jharkhand": ["ranchi", "jamshedpur", "dhanbad", "jharkhand"],
    "karnataka": ["ka", "bengaluru", "bangalore", "mysore", "karnataka"],
    "kerala": ["kl", "kochi", "trivandrum", "thiruvananthapuram", "kerala"],
    "madhya pradesh": ["mp", "indore", "bhopal", "jabalpur", "gwalior", "madhya pradesh"],
    "maharashtra": ["mh", "mumbai", "pune", "nagpur", "nashik", "maharashtra"],
    "manipur": ["imphal", "manipur"],
    "meghalaya": ["shillong", "meghalaya"],
    "mizoram": ["aizawl", "mizoram"],
    "nagaland": ["dimapur", "kohima", "nagaland"],
    "odisha": ["bhubaneswar", "cuttack", "rourkela", "odisha", "orissa"],
    "puducherry": ["pondicherry", "puducherry"],
    "punjab": ["pb", "ludhiana", "amritsar", "jalandhar", "chandigarh", "punjab"],
    "rajasthan": ["rj", "jaipur", "jodhpur", "udaipur", "rajasthan"],
    "sikkim": ["gangtok", "sikkim"],
    "tamil nadu": ["tn", "chennai", "coimbatore", "madurai", "tamil nadu"],
    "telangana": ["ts", "hyderabad", "secunderabad", "warangal", "telangana"],
    "tripura": ["agartala", "tripura"],
    "uttar pradesh": ["up", "lucknow", "kanpur", "noida", "ghaziabad", "uttar pradesh"],
    "uttarakhand": ["uk", "dehradun", "haridwar", "rishikesh", "uttarakhand"],
    "west bengal": ["wb", "kolkata", "howrah", "durgapur", "west bengal"]
};

// Parse rupee string to number
const parseRupeeString = (str) => {
    if (!str || typeof str !== "string") return null;
    const cleanStr = str.toLowerCase().replace(/,/g, "").trim();
    if (cleanStr === "" || cleanStr === "no min limit" || cleanStr === "no max limit") return null;

    if (cleanStr.includes("crore") || cleanStr.includes("cr")) {
        const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
        return num * 10000000;
    }
    if (cleanStr.includes("lakh") || cleanStr.includes("l")) {
        const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
        return num * 100000;
    }
    if (cleanStr.includes("thousand") || cleanStr.includes("k")) {
        const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
        return num * 1000;
    }
    const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
    return isNaN(num) || num === 0 ? null : num;
};

// Flexible Category Matcher
const matchCategory = (brandCategory, targetCategory) => {
    if (!targetCategory || targetCategory === "" || targetCategory === "All Industries" || targetCategory === "All Segments") return true;
    if (!brandCategory) return false;

    const bc = brandCategory.toLowerCase().trim();
    const tc = targetCategory.toLowerCase().trim();

    if (bc === tc || bc.includes(tc) || tc.includes(bc)) return true;

    const synonyms = {
        "automotive": ["automobiles", "auto", "ev", "car"],
        "automobiles": ["automotive", "auto", "ev", "car"],
        "beauty & health": ["beauty and wellness", "health and wellness", "wellness", "salon", "spa", "cosmetics"],
        "health and wellness": ["beauty & health", "beauty and wellness", "wellness", "fitness", "gym", "health"],
        "food and beverage": ["food & beverage", "food", "café", "restaurant", "qsr", "dessert", "bakery"],
        "retail": ["retail apparel", "fashion", "gifting", "bathware", "supermarket", "store"],
        "education": ["stem", "preschool", "coaching", "academy", "learning", "school"],
        "business services": ["dealers & distributors", "financial", "logistics", "co-working", "marketing", "services"],
        "dealers & distributors": ["business services", "distribution", "fmcg", "solar", "equipment"],
        "sports, fitness & entertainment": ["health & wellness", "fitness", "gym", "sports"]
    };

    const tcSynonyms = synonyms[tc] || [];
    return tcSynonyms.some(syn => bc.includes(syn));
};

// Flexible Location and State Matcher
const matchLocationAndState = (brand, targetState, targetLocation) => {
    const brandHq = brand.hq || "";
    const brandLoc = brand.location || "";
    const locCombined = `${brandLoc} ${brandHq}`.toLowerCase().trim();

    if (targetState && targetState !== "" && targetState !== "All States" && targetState !== "All Regions") {
        const tsLower = targetState.toLowerCase().trim();
        const aliases = STATE_ALIAS_MAP[tsLower] || [tsLower];
        const matchesState = aliases.some(alias => locCombined.includes(alias)) || locCombined.includes(tsLower);
        if (!matchesState) return false;
    }

    if (targetLocation && targetLocation !== "" && targetLocation !== "All Cities" && targetLocation !== "All Districts" && targetLocation !== "All Regions") {
        const locLower = targetLocation.toLowerCase().trim();
        const aliases = STATE_ALIAS_MAP[locLower] || [locLower];
        const matchesCity = aliases.some(alias => locCombined.includes(alias)) || locCombined.includes(locLower) || locLower.includes(locCombined);
        if (!matchesCity) return false;
    }

    return true;
};

// Sector & Concept Keyword Matcher
const matchSectorAndKeyword = (brand, targetSector, targetSearch) => {
    const brandSector = (brand.sector || "").toLowerCase();
    const brandText = `${brand.name} ${brand.company || ""} ${brand.category || ""} ${brand.sector || ""} ${brand.description || ""} ${brand.hq || ""} ${brand.location || ""} ${brand.areaRequired || ""}`.toLowerCase();

    if (targetSector && targetSector !== "" && targetSector !== "All Sectors") {
        const sectorLower = targetSector.toLowerCase().trim();
        if (brandSector === sectorLower || brandSector.includes(sectorLower) || sectorLower.includes(brandSector)) {
            // direct match
        } else {
            const sectorWords = sectorLower.split(/[\s&,/]+/).filter(w => w.length > 2);
            const matchesSector = sectorWords.some(w => brandText.includes(w)) || brandText.includes(sectorLower);
            if (!matchesSector) return false;
        }
    }

    if (targetSearch && targetSearch !== "" && targetSearch.trim() !== "") {
        const searchLower = targetSearch.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 1);
        const matchesSearch = searchWords.every(w => brandText.includes(w)) || brandText.includes(searchLower);
        if (!matchesSearch) return false;
    }

    return true;
};

// Investment Range Matcher
const matchBudgetRange = (brand, selectedBudget, minBudgetParam, maxBudgetParam) => {
    const minInv = brand.minInvestment || 0;
    const maxInv = brand.maxInvestment || minInv;

    const targetMin = parseRupeeString(minBudgetParam);
    const targetMax = parseRupeeString(maxBudgetParam);

    if (targetMin !== null && maxInv < targetMin && minInv < targetMin) {
        return false;
    }
    if (targetMax !== null && minInv > targetMax) {
        return false;
    }

    if (selectedBudget) {
        if (selectedBudget === "under-2l") return minInv < 200000;
        if (selectedBudget === "2l-5l") return minInv < 500000 && maxInv >= 200000;
        if (selectedBudget === "5l-10l") return minInv < 1000000 && maxInv >= 500000;
        if (selectedBudget === "10l-15l") return minInv < 1500000 && maxInv >= 1000000;
        if (selectedBudget === "15l-20l") return minInv < 2000000 && maxInv >= 1500000;
        if (selectedBudget === "20l-30l") return minInv < 3000000 && maxInv >= 2000000;
        if (selectedBudget === "above-30l") return maxInv >= 3000000 || minInv >= 3000000;
    }

    return true;
};

function BrandsDirectoryPage() {
    const { brands, loading } = useApprovedBrands();
    const [filteredBrands, setFilteredBrands] = useState([]);

    // Search Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedBudget, setSelectedBudget] = useState("");
    const [minBudget, setMinBudget] = useState("");
    const [maxBudget, setMaxBudget] = useState("");

    const handleMinBudgetChange = (val) => {
        setMinBudget(val);
        setSelectedBudget("");
        const minVal = parseRupeeValue(val);
        const maxVal = parseRupeeValue(maxBudget);
        if (minVal !== null && maxVal !== null && maxVal <= minVal) {
            setMaxBudget("");
        }
    };

    const handleMaxBudgetChange = (val) => {
        setMaxBudget(val);
        setSelectedBudget("");
        const maxVal = parseRupeeValue(val);
        const minVal = parseRupeeValue(minBudget);
        if (maxVal !== null && minVal !== null && minVal >= maxVal) {
            setMinBudget("");
        }
    };

    const availableMinBudgets = getFilteredMinBudgets(maxBudget);
    const availableMaxBudgets = getFilteredMaxBudgets(minBudget);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(6);

    // Reset pagination when active filters change
    useEffect(() => {
        setVisibleCount(6);
    }, [searchTerm, selectedCategory, selectedSector, selectedState, selectedLocation, selectedBudget, minBudget, maxBudget]);

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

    // Sync URL search params from Homepage or Header Search
    useEffect(() => {
        if (brands.length > 0) {
            const categoryParam = searchParams.get("category");
            const sectorParam = searchParams.get("sector");
            const stateParam = searchParams.get("state");
            const locationParam = searchParams.get("location");
            const searchParam = searchParams.get("search");
            const minBudgetParam = searchParams.get("minBudget");
            const maxBudgetParam = searchParams.get("maxBudget");
            const budgetParam = searchParams.get("budget");

            if (categoryParam) setSelectedCategory(categoryParam);
            if (sectorParam) setSelectedSector(sectorParam);
            if (stateParam) setSelectedState(stateParam);
            if (locationParam) setSelectedLocation(locationParam);
            if (searchParam) setSearchTerm(searchParam);
            if (minBudgetParam) setMinBudget(minBudgetParam);
            if (maxBudgetParam) setMaxBudget(maxBudgetParam);
            if (budgetParam) setSelectedBudget(budgetParam);
        }
    }, [searchParams, brands]);

    // Handle Multi-Criteria Filtering
    useEffect(() => {
        let result = [...brands];

        result = result.filter(b => {
            if (!matchCategory(b.category, selectedCategory)) return false;
            if (!matchLocationAndState(b, selectedState, selectedLocation)) return false;
            if (!matchSectorAndKeyword(b, selectedSector, searchTerm)) return false;
            if (!matchBudgetRange(b, selectedBudget, minBudget, maxBudget)) return false;
            return true;
        });

        setFilteredBrands(result);
    }, [searchTerm, selectedCategory, selectedSector, selectedState, selectedLocation, selectedBudget, minBudget, maxBudget, brands]);

    const handleReset = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedSector("");
        setSelectedState("");
        setSelectedLocation("");
        setSelectedBudget("");
        setMinBudget("");
        setMaxBudget("");
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
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedLocation("");
                                }}
                            >
                                <option value="">All States</option>
                                {STATES.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* District / Location Select */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Select District</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">All Districts</option>
                                {(selectedState && DISTRICTS_BY_STATE[selectedState]
                                    ? DISTRICTS_BY_STATE[selectedState]
                                    : ALL_DISTRICTS).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                            </select>
                        </div>

                        {/* Min Investment Select */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Min Investment</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={minBudget}
                                onChange={(e) => handleMinBudgetChange(e.target.value)}
                            >
                                <option value="">No Min Limit</option>
                                {availableMinBudgets.map(b => (
                                    <option key={b.label} value={b.label}>{b.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Max Investment Select */}
                        <div className="form-group" style={{ marginBottom: "18px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>
                                Max Investment
                                {minBudget && (
                                    <span style={{ fontSize: "9.5px", color: "#16a34a", fontWeight: "700", marginLeft: "6px" }}>
                                        (&gt; {minBudget})
                                    </span>
                                )}
                            </label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={maxBudget}
                                onChange={(e) => handleMaxBudgetChange(e.target.value)}
                            >
                                <option value="">No Max Limit</option>
                                {availableMaxBudgets.map(b => (
                                    <option key={b.label} value={b.label}>{b.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quick Preset Budget Select */}
                        <div className="form-group" style={{ marginBottom: "24px" }}>
                            <label style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-dark)", marginBottom: "6px", display: "block" }}>Quick Budget Presets</label>
                            <select
                                className="form-input"
                                style={{ fontSize: "13.5px" }}
                                value={selectedBudget}
                                onChange={(e) => {
                                    setSelectedBudget(e.target.value);
                                    if (e.target.value) {
                                        setMinBudget("");
                                        setMaxBudget("");
                                    }
                                }}
                            >
                                <option value="">Any Preset</option>
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
                        {(searchTerm || selectedCategory || selectedState || selectedLocation || selectedBudget || minBudget || maxBudget) && (
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
                            <ProductSkeletonGrid count={6} minWidth="280px" />
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

            {/* Enquiry / Details Modal Overlay (Bigger & Professional Layout) */}
            {selectedBrand && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedBrand(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(15, 23, 42, 0.82)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        padding: "20px",
                        zIndex: 999999,
                        fontFamily: "'Inter', sans-serif"
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "760px",
                            width: "100%",
                            borderRadius: "24px",
                            overflow: "hidden",
                            backgroundColor: "#ffffff",
                            boxShadow: "0 25px 60px -12px rgba(15,23,42,0.45)",
                            maxHeight: "92vh",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            padding: 0
                        }}
                    >
                        {/* Hero Cover Banner */}
                        <div style={{ position: "relative", height: "190px", width: "100%", overflow: "hidden" }}>
                            <img
                                src={selectedBrand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600"}
                                alt={selectedBrand.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)" }}></div>

                            {/* Close X Button */}
                            <button
                                onClick={() => setSelectedBrand(null)}
                                style={{
                                    position: "absolute",
                                    right: "18px",
                                    top: "18px",
                                    background: "rgba(0,0,0,0.5)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "#fff",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 10,
                                    fontSize: "18px"
                                }}
                            >
                                ✕
                            </button>

                            {/* Top Banner Tags & Title */}
                            <div style={{ position: "absolute", bottom: "18px", left: "24px", right: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                <div>
                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                                        <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", background: "#16a34a", color: "#ffffff", padding: "4px 12px", borderRadius: "20px", letterSpacing: "0.5px" }}>
                                            ✓ Verified Concept
                                        </span>
                                        <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(6px)", color: "#ffffff", padding: "4px 12px", borderRadius: "20px" }}>
                                            {selectedBrand.category}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: "26px", fontWeight: "800", color: "#ffffff", margin: 0, textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>
                                        {selectedBrand.name}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body Container */}
                        <div style={{ padding: "28px", overflowY: "auto", flexGrow: 1 }}>
                            {/* Profile Bar */}
                            <div style={{ display: "flex", gap: "18px", alignItems: "center", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                                <img
                                    src={selectedBrand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                                    alt={selectedBrand.name}
                                    style={{ width: "72px", height: "72px", borderRadius: "16px", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "2px solid #f8fafc" }}
                                />
                                <div style={{ flexGrow: 1 }}>
                                    <h4 style={{ fontWeight: "800", fontSize: "17px", color: "#0f172a", margin: 0 }}>{selectedBrand.company}</h4>
                                    <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
                                        HQ: <strong style={{ color: "#0f172a" }}>{selectedBrand.hq || "India"}</strong> • Status: <span style={{ color: "#16a34a", fontWeight: "700" }}>Active Franchising</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        const phone = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919876543210").replace(/[^0-9]/g, "");
                                        const text = encodeURIComponent(`Hello Admin, I want detailed catalog & investment structure for franchise brand: *${selectedBrand.name}*.`);
                                        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, "_blank");
                                    }}
                                    style={{
                                        background: "#25D366",
                                        color: "#ffffff",
                                        border: "none",
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        fontWeight: "700",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        flexShrink: 0
                                    }}
                                >
                                    <MessageCircle size={16} /> WhatsApp Admin
                                </button>
                            </div>

                            {/* Specifications Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", background: "#f8fafc", padding: "18px", borderRadius: "16px", marginBottom: "24px", border: "1px solid #e2e8f0" }}>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block", marginBottom: "3px" }}>MIN INVESTMENT</span>
                                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{formatLakhs(selectedBrand.minInvestment)}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block", marginBottom: "3px" }}>MAX INVESTMENT</span>
                                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb" }}>{formatLakhs(selectedBrand.maxInvestment)}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block", marginBottom: "3px" }}>ROYALTY FEE</span>
                                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>{selectedBrand.royaltyFee || "0% (Zero)"}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block", marginBottom: "3px" }}>SPACE REQUIRED</span>
                                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{selectedBrand.areaRequired || "200-500 Sq.Ft"}</span>
                                </div>
                            </div>

                            {/* Overview */}
                            <div style={{ marginBottom: "24px" }}>
                                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>Business Concept Brief</h4>
                                <div
                                    style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6 }}
                                    dangerouslySetInnerHTML={{ __html: selectedBrand.description || `${selectedBrand.name} offers turnkey business models with complete corporate support and training.` }}
                                />
                            </div>

                            {/* Direct Enquiry Form Integration */}
                            <div style={{ borderTop: "2px solid #f1f5f9", paddingTop: "20px" }}>
                                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", marginBottom: "14px" }}>
                                    Send Free Franchise Enquiry
                                </h4>

                                {enquirySubmitted ? (
                                    <div className="alert flex-center" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--success)", border: "1px solid rgba(16, 185, 129, 0.2)", gap: "10px", padding: "20px", borderRadius: "12px" }}>
                                        <CheckCircle size={24} />
                                        <div>
                                            <h4 style={{ color: "var(--success)", margin: 0, fontWeight: "700" }}>Enquiry Submitted Successfully!</h4>
                                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", margin: 0 }}>Our brand advisors and account managers will reach out to you shortly.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEnquirySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                                            <div className="form-group">
                                                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px", display: "block" }}>Full Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="form-input"
                                                    placeholder="Your Name"
                                                    value={enquiryForm.name}
                                                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                                                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px", display: "block" }}>Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    className="form-input"
                                                    placeholder="10-digit mobile"
                                                    value={enquiryForm.phone}
                                                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                                                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px", display: "block" }}>Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                className="form-input"
                                                placeholder="email@example.com"
                                                value={enquiryForm.email}
                                                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                                                style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "4px", display: "block" }}>Message (Optional)</label>
                                            <textarea
                                                className="form-input"
                                                rows="2"
                                                placeholder={`I am interested in opening a franchise of ${selectedBrand.name}. Please share detailed specifications.`}
                                                value={enquiryForm.message}
                                                onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                                                style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ padding: "12px", borderRadius: "10px", fontWeight: "800", fontSize: "14px" }}
                                            disabled={submittingEnquiry}
                                        >
                                            {submittingEnquiry ? "Submitting Enquiry..." : `Apply For ${selectedBrand.name} Franchise`}
                                        </button>
                                    </form>
                                )}
                            </div>
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
