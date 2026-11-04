"use client";

import { useState, useEffect, useRef, useCallback, useTransition, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Search, MapPin, IndianRupee, RotateCcw, Building, Users, Star,
    CheckCircle, ChevronRight, Mail, Phone, Globe, HelpCircle, Filter, Sparkles, MessageCircle, X
} from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import { ProductSkeletonGrid } from "@/components/SkeletonLoader";
import { useApprovedBrands } from "@/lib/brandsCache";
import { DISTRICTS_BY_STATE, ALL_DISTRICTS } from "@/lib/districtsData";
import { getFilteredMinBudgets, getFilteredMaxBudgets, parseRupeeValue } from "@/lib/investmentData";
import { decodeHtmlEntities, cleanBrandPlainText } from "@/lib/brandFormatters";
import PageHeader from "@/components/public/PageHeader";
import ImageRotator, { getImageSources } from "@/components/public/ImageRotator";
import { toast } from "@/lib/swal";

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

const getBrandFallbackImage = (brandName = "Franchise") => {
    const initials = String(brandName)
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "FR";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#172554"/><stop offset=".55" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="800" height="420" fill="url(#bg)"/><circle cx="690" cy="80" r="160" fill="#ffffff" opacity=".08"/><circle cx="110" cy="380" r="180" fill="#38bdf8" opacity=".08"/><text x="400" y="215" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="800">${initials}</text><text x="400" y="278" text-anchor="middle" fill="#dbeafe" font-family="Arial, sans-serif" font-size="22" font-weight="700">VERIFIED BRAND</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};



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
    const cleanDesc = cleanBrandPlainText(brand.description, brand);
    const brandText = `${decodeHtmlEntities(brand.name)} ${decodeHtmlEntities(brand.company || "")} ${decodeHtmlEntities(brand.category || "")} ${brandSector} ${cleanDesc} ${brand.hq || ""} ${brand.location || ""} ${brand.areaRequired || ""}`.toLowerCase();

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
    const [, startTransition] = useTransition();
    const loadMoreRef = useRef(null);
    const isLoadingMoreRef = useRef(false);

    // Reset pagination when active filters change
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect -- filter changes reset the visible page. */
        setVisibleCount(6);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [searchTerm, selectedCategory, selectedSector, selectedState, selectedLocation, selectedBudget, minBudget, maxBudget]);

    // Load more brands immediately
    const loadMoreBrands = useCallback(() => {
        if (isLoadingMoreRef.current) return;
        if (visibleCount >= filteredBrands.length) return;

        isLoadingMoreRef.current = true;
        startTransition(() => {
            setVisibleCount(prev => Math.min(prev + 12, filteredBrands.length));
        });

        setTimeout(() => {
            isLoadingMoreRef.current = false;
        }, 200);
    }, [visibleCount, filteredBrands.length]);

    // Trigger immediate loading via IntersectionObserver as soon as the loader element is visible or near viewport
    useEffect(() => {
        const target = loadMoreRef.current;
        if (!target) return;
        if (visibleCount >= filteredBrands.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    loadMoreBrands();
                }
            },
            {
                root: null,
            rootMargin: "700px",
                threshold: 0
            }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [loadMoreBrands, visibleCount, filteredBrands.length]);

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
        /* eslint-disable react-hooks/set-state-in-effect -- hydrate the enquiry form from the browser session. */
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
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [selectedBrand]);

    // Sync URL search params from Homepage or Header Search
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect -- URL filters are external state. */
        if (brands.length > 0) {
            const categoryParam = searchParams.get("category");
            const sectorParam = searchParams.get("sector");
            const stateParam = searchParams.get("state");
            const locationParam = searchParams.get("location");
            const searchParam = searchParams.get("search");
            const typeParam = searchParams.get("type");
            const minBudgetParam = searchParams.get("minBudget");
            const maxBudgetParam = searchParams.get("maxBudget");
            const budgetParam = searchParams.get("budget");

            if (categoryParam) setSelectedCategory(categoryParam);
            if (sectorParam) setSelectedSector(sectorParam);
            if (stateParam) setSelectedState(stateParam);
            if (locationParam) setSelectedLocation(locationParam);
            if (searchParam && typeParam && !searchParam.toLowerCase().includes(typeParam.toLowerCase())) {
                setSearchTerm(`${searchParam} ${typeParam}`);
            } else if (searchParam) {
                setSearchTerm(searchParam);
            } else if (typeParam) {
                setSearchTerm(typeParam);
            }
            if (minBudgetParam) setMinBudget(minBudgetParam);
            if (maxBudgetParam) setMaxBudget(maxBudgetParam);
            if (budgetParam) setSelectedBudget(budgetParam);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [searchParams, brands]);

    // Handle Multi-Criteria Filtering
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect -- derived catalog state is synchronized after filtering. */
        let result = [...brands];

        result = result.filter(b => {
            if (!matchCategory(b.category, selectedCategory)) return false;
            if (!matchLocationAndState(b, selectedState, selectedLocation)) return false;
            if (!matchSectorAndKeyword(b, selectedSector, searchTerm)) return false;
            if (!matchBudgetRange(b, selectedBudget, minBudget, maxBudget)) return false;
            return true;
        });

        setFilteredBrands(result);
        /* eslint-enable react-hooks/set-state-in-effect */
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
                toast.success("Enquiry submitted successfully!");
                setEnquiryForm({ name: "", email: "", phone: "", message: "" });
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to submit enquiry. Please check your details.");
            }
        } catch (error) {
            console.error("Enquiry submission failed:", error);
            toast.error("Network error submitting enquiry. Please check your connection.");
        } finally {
            setSubmittingEnquiry(false);
        }
    };

    return (
        <div style={{ background: "#f8fafc", minHeight: "100vh", padding: "40px 0" }}>
            <div className="container" style={{ maxWidth: "1280px" }}>

                <PageHeader
                    theme="brands"
                    eyebrow={<><Sparkles size={14} /> VERIFIED OPPORTUNITIES</>}
                    titleBefore="Explore "
                    titleAccent="Franchise Brands"
                    subtitle="Discover premium high-ROI investments, contact brand owners directly, and expand your franchise footprint."
                    leftExtra={<span className="page-header-count-chip">{brands.length > 0 ? `${brands.length}+ verified brands` : "Verified brands"}</span>}
                    rightVisual={brands.length > 0 ? (
                        <div className="page-header-tile-stack">
                            {brands.slice(0, 3).map((brand, index) => (
                                <div className="page-header-tile page-header-tile--brand" key={brand.id || brand._id || brand.name} style={{ "--tile-delay": `${index * 120}ms` }}>
                                    <span className="page-header-tile-icon"><Building size={20} /></span>
                                    <span><strong>{decodeHtmlEntities(brand.name)}</strong><small>{decodeHtmlEntities(brand.category || "Franchise opportunity")}</small></span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                />

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
                                <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "420px" }}>We couldn&apos;t search any approved business logos matching your filter configuration. Try broadening your criteria.</p>
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
                                            <div className="franchise-card-image" style={{ height: "180px", overflow: "hidden", position: "relative", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                                                    {decodeHtmlEntities(brand.hq || "India")}
                                                </div>
                                                <ImageRotator
                                                    sources={getImageSources({
                                                        ...brand,
                                                        image: brand.image || getBrandFallbackImage(decodeHtmlEntities(brand.name))
                                                    })}
                                                    alt={decodeHtmlEntities(brand.name)}
                                                    interval={2000}
                                                    className="franchise-card-brand-image"
                                                />
                                            </div>
                                            <div className="franchise-card-content" style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                                                <span className="franchise-category" style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>
                                                    {decodeHtmlEntities(brand.category)}
                                                </span>
                                                <h3 className="franchise-title" style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px", lineHeight: "1.3" }}>
                                                    {decodeHtmlEntities(brand.name)}
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
                                                    {cleanBrandPlainText(brand.description, brand, 180)}
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
                                                        <Link
                                                            href={`/brands/${brand.id || brand._id}`}
                                                            className="btn btn-outline"
                                                            style={{ padding: "10px 0", fontSize: "12.5px", fontWeight: "700", display: "flex", justifyContent: "center", textDecoration: "none" }}
                                                        >
                                                            Details
                                                        </Link>
                                                        <Link
                                                            href={`/brands/${brand.id || brand._id}`}
                                                            className="btn btn-primary"
                                                            style={{ padding: "10px 0", fontSize: "12.5px", fontWeight: "700", display: "flex", justifyContent: "center", textDecoration: "none" }}
                                                        >
                                                            Apply Now
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {filteredBrands.length > visibleCount ? (
                                    <div
                                        ref={loadMoreRef}
                                        onClick={loadMoreBrands}
                                        className="flex-center"
                                        style={{
                                            margin: "40px 0 20px 0",
                                            flexDirection: "column",
                                            gap: "10px",
                                            width: "100%",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div className="spinner" style={{ borderTopColor: "var(--primary)", width: "30px", height: "30px", borderWidth: "3px" }}></div>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>More verified brands loading as you scroll</p>
                                    </div>
                                ) : null}
                            </>
                        )}

                        {/* DYNAMIC SEO + GEO TAGS */}
                        <SEOGeoTags categoryName={selectedCategory !== "All Industries" && selectedCategory !== "" ? selectedCategory : "Business"} basePath="/brands" />
                    </main>
                </div>
            </div>




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
