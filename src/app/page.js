"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, MapPin, IndianRupee, RotateCcw, Building, Users, Star, ArrowRight,
  GraduationCap, Utensils, Store, Car, HeartPulse, Building2, HelpCircle,
  CheckCircle, ShieldCheck, Award, ThumbsUp, ChevronRight, MessageSquare, Mail,
  Phone, Globe, Eye, ChevronLeft, Send, Sparkles, ShieldAlert, MessageCircle,
  Filter, Layers, Briefcase, Crown
} from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import TopFranchiseOpportunities from "@/components/TopFranchiseOpportunities";
import TopBusinessOpportunities from "@/components/TopBusinessOpportunities";
import { ProductSkeletonSlider } from "@/components/SkeletonLoader";
import { useApprovedBrands } from "@/lib/brandsCache";
import { DISTRICTS_BY_STATE, ALL_DISTRICTS } from "@/lib/districtsData";
import { BUDGET_OPTIONS, getFilteredMinBudgets, getFilteredMaxBudgets, parseRupeeValue } from "@/lib/investmentData";


// Mock Categories with Icons
const CATEGORIES = [
  { name: "Food and Beverage", icon: Utensils, count: "1,240+ Options" },
  { name: "Retail", icon: Store, count: "980+ Options" },
  { name: "Education", icon: GraduationCap, count: "650+ Options" },
  { name: "Automobiles", icon: Car, count: "420+ Options" },
  { name: "Health and Wellness", icon: HeartPulse, count: "310+ Options" },
  { name: "Business Services", icon: Building2, count: "550+ Options" }
];

const STATES = [
  "New Delhi", "Maharashtra", "Gujarat", "Karnataka", "Tamil Nadu", "Haryana",
  "Punjab", "Rajasthan", "Uttar Pradesh", "Kerala", "West Bengal", "Andhra Pradesh"
];

// Franchise India-Style Banner Constants
const FI_INDUSTRIES = [
  "Automotive", "Beauty & Health", "Business Services", "Dealers & Distributors",
  "Education", "Fashion", "Food and Beverage", "Home Based Business",
  "Hotel, Travel & Tourism", "Retail", "Sports, Fitness & Entertainment"
];

const FI_SECTORS_MAP = {
  "Automotive": ["EV Service Station", "2-Wheeler Workshop", "Car Washing & Detailing", "Spare Parts & Tires", "Auto Dealership"],
  "Beauty & Health": ["Unisex Salon & Spa", "Fitness Gym & Wellness", "Cosmetics & Skincare", "Ayurveda & Pharmacy", "Slimming & Nutrition"],
  "Business Services": ["Financial & Accounting", "Digital Marketing", "Co-Working Space", "Logistics & Courier", "Consulting & IT"],
  "Dealers & Distributors": ["FMCG Distribution", "Solar & Energy Solutions", "Construction Materials", "Industrial Equipment", "Consumer Durables"],
  "Education": ["Preschool & Daycare", "STEM & Robotics Labs", "Coaching Institute", "Skill Training Academy", "Language & Vocational"],
  "Fashion": ["Fashion Apparel", "Footwear & Accessories", "Luxury Goods & Jewellery", "Kids Wear", "Innerwear & Activewear"],
  "Food and Beverage": ["Café & Kulhad Tea", "QSR & Fast Food", "Fine Dining & Restobar", "Ice Cream & Desserts", "Bakery & Confectionery"],
  "Home Based Business": ["Online Consulting", "Handmade & Crafts", "Tutoring & E-Learning", "Digital Reselling"],
  "Hotel, Travel & Tourism": ["Boutique Resort & Hotel", "Travel Agency & Tour Operator", "Homestay & Villa", "Car Rental Services"],
  "Retail": ["Supermarket & Grocery", "Eyewear & Optics", "Bathware & Home Decor", "Electronics & Appliances", "Gifting & Stationery"],
  "Sports, Fitness & Entertainment": ["Fitness Gym & Studio", "Sports Academy", "Indoor Play Zone", "Gaming & AR/VR Arena"]
};

const FI_STATES = [
  "Andaman and Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Delhi NCR", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];



const FI_MIN_BUDGETS = [
  "Rs. 10,000", "Rs. 50,000", "Rs. 2 Lakhs", "Rs. 5 Lakhs", "Rs. 10 Lakhs",
  "Rs. 20 Lakhs", "Rs. 30 Lakhs", "Rs. 50 Lakhs", "Rs. 1 Crore", "Rs. 2 Crores"
];

const FI_MAX_BUDGETS = [
  "Rs. 50,000", "Rs. 2 Lakhs", "Rs. 5 Lakhs", "Rs. 10 Lakhs", "Rs. 20 Lakhs",
  "Rs. 30 Lakhs", "Rs. 50 Lakhs", "Rs. 1 Crore", "Rs. 2 Crores", "Rs. 5 Crores+"
];

const LEADING_FRANCHISES = [];

// FAQS mock data
const FAQS = [
  {
    question: "What is Franchise Roots?",
    answer: "Franchise Roots is India's leading digital matching directory for luxury, premium, and low-investment franchise setups. We help top brands expand their network across local state boundaries and connect them with certified investors."
  },
  {
    question: "How do I list my brand for expansion?",
    answer: "You can click on 'Register Your Brand' at the top, fill in the brand specifications, parent company information, HQ location, and required investment levels. Once submitted, your listing goes into a 'Pending Review' queue for Admin verification before being published."
  },
  {
    question: "Is there a service fee for investors to apply?",
    answer: "No, submitting enquiries or applying for catalog details is 100% free for certified investors. Simply click on 'Apply Now' or 'Know More' on any verified brand card, fill in your details, and a representative will connect with you."
  },
  {
    question: "How long does it take for brand operators to contact me?",
    answer: "Once you submit an enquiry, the lead is directly piped to the Brand Owner's dashboard inbox. Verified partners typically respond and share franchise brochures, royalty agreements, and site-selection reviews within 2 to 3 business days."
  },
  {
    question: "Do you offer Master Franchising opportunities?",
    answer: "Yes, many of our listed corporate brands offer exclusive master franchise rights. You can visit our dedicated 'Master Franchising' section to explore regional, state, and national level area developer opportunities."
  }
];

export default function Home() {
  const sliderRef = useRef(null);
  const leadingCarouselRef = useRef(null);
  const router = useRouter();
  const { brands, loading } = useApprovedBrands();
  const pathname = usePathname();

  // Franchise India Search Form & Multi-Criteria States
  const [searchTab, setSearchTab] = useState("categories"); // "categories" | "location" | "investment"
  const [fiIndustry, setFiIndustry] = useState("");
  const [fiSector, setFiSector] = useState("");
  const [fiService, setFiService] = useState("");

  const [fiLocIndustry, setFiLocIndustry] = useState("");
  const [fiState, setFiState] = useState("");
  const [fiCity, setFiCity] = useState("");

  const [fiInvIndustry, setFiInvIndustry] = useState("");
  const [fiMinInv, setFiMinInv] = useState("");
  const [fiMaxInv, setFiMaxInv] = useState("");

  const handleMinInvChange = (val) => {
    setFiMinInv(val);
    const minVal = parseRupeeValue(val);
    const maxVal = parseRupeeValue(fiMaxInv);
    if (minVal !== null && maxVal !== null && maxVal <= minVal) {
      setFiMaxInv("");
    }
  };

  const handleMaxInvChange = (val) => {
    setFiMaxInv(val);
    const maxVal = parseRupeeValue(val);
    const minVal = parseRupeeValue(fiMinInv);
    if (maxVal !== null && minVal !== null && minVal >= maxVal) {
      setFiMinInv("");
    }
  };

  const availableMinBudgets = getFilteredMinBudgets(fiMaxInv);
  const availableMaxBudgets = getFilteredMaxBudgets(fiMinInv);

  const [expertMode, setExpertMode] = useState("buy"); // "buy" | "expand"

  // Temporary Search Filters Form State (will redirect to /brands page on submit)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Modal State
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isEnquiryOnlyMode, setIsEnquiryOnlyMode] = useState(false);
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // Redesign state additions (Non-intrusive UI-only states)
  const [sliderIndex, setSliderIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Services State
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Advertisements State
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch((err) => console.error("Error loading services on homepage:", err))
      .finally(() => setLoadingServices(false));

    fetch("/api/advertisements")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAds(data.filter(a => a.isActive));
      })
      .catch((err) => console.error("Error loading advertisements on homepage:", err));
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

  // Franchise India Search Submit Handler
  const handleFiSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();

    if (searchTab === "categories") {
      if (fiIndustry) params.set("category", fiIndustry);
      if (fiSector) params.set("sector", fiSector);
      if (fiService) params.set("search", fiService);
    } else if (searchTab === "location") {
      if (fiLocIndustry) params.set("category", fiLocIndustry);
      if (fiState) params.set("state", fiState);
      if (fiCity) params.set("location", fiCity);
    } else if (searchTab === "investment") {
      if (fiInvIndustry) params.set("category", fiInvIndustry);
      if (fiMinInv) params.set("minBudget", fiMinInv);
      if (fiMaxInv) params.set("maxBudget", fiMaxInv);
    }

    router.push(`/brands?${params.toString()}`);
  };

  // Carousel controls for Leading Franchises
  const handlePrevLeading = () => {
    if (leadingCarouselRef.current) {
      leadingCarouselRef.current.scrollBy({ left: -310, behavior: "smooth" });
    }
  };

  const handleNextLeading = () => {
    if (leadingCarouselRef.current) {
      leadingCarouselRef.current.scrollBy({ left: 310, behavior: "smooth" });
    }
  };

  // Handle Search Submission Redirection
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedBudget) params.set("budget", selectedBudget);
    router.push(`/brands?${params.toString()}`);
  };

  // Reset Filters
  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBudget("");
    setSelectedLocation("");
  };

  // Quick category select from cards -> Redirection
  const selectCategory = (categoryName) => {
    router.push(`/brands?category=${encodeURIComponent(categoryName)}`);
  };

  // Quick location select -> Redirection
  const selectLocation = (locationName) => {
    router.push(`/brands?location=${encodeURIComponent(locationName)}`);
  };

  // Format currency
  const formatLakhs = (val) => {
    if (!val) return "N/A";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Submit Enquiry
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

  // Carousel slider Navigation
  const handlePrevSlide = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".slider-card");
      if (card) {
        const scrollAmount = card.offsetWidth + 30; // card width + gap
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleNextSlide = () => {
    if (sliderRef.current) {
      const card = sliderRef.current.querySelector(".slider-card");
      if (card) {
        const scrollAmount = card.offsetWidth + 30; // card width + gap
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  // Newsletter Submit Visual mock
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setTimeout(() => {
        setNewsletterEmail("");
        setNewsletterSuccess(false);
      }, 4000);
    }
  };

  const handleOpenAskExperts = (mode = "buy") => {
    const targetMode = typeof mode === "string" && mode === "expand" ? "expand" : "buy";
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ask-experts", { detail: { mode: targetMode } }));
    }
  };


  return (
    <div>
      {/* 1. Main Hero Banner & Multi-Criteria Search (Franchise India Style) */}
      <section className="fi-hero-section">
        <div className="fi-hero-orb orb-1"></div>
        <div className="fi-hero-orb orb-2"></div>

        <div className="container">
          <div className="fi-hero-grid">
            {/* Left Column: Interactive Multi-Criteria Search Banner */}
            <div className="fi-search-card">
              <div>
                <div className="fi-search-header">
                  <h1 className="fi-search-title">
                    Find India's Top <span>Franchise Opportunities</span>
                  </h1>
                  <p className="fi-search-subtitle">
                    Explore 1,200+ audited business setups, master dealerships & ROI-proven brands
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="fi-search-tabs">
                  <button
                    type="button"
                    className={`fi-tab-btn ${searchTab === "categories" ? "active" : ""}`}
                    onClick={() => setSearchTab("categories")}
                  >
                    <Filter size={15} /> Categories
                  </button>
                  <button
                    type="button"
                    className={`fi-tab-btn ${searchTab === "location" ? "active" : ""}`}
                    onClick={() => setSearchTab("location")}
                  >
                    <MapPin size={15} /> Location
                  </button>
                  <button
                    type="button"
                    className={`fi-tab-btn ${searchTab === "investment" ? "active" : ""}`}
                    onClick={() => setSearchTab("investment")}
                  >
                    <IndianRupee size={15} /> Investment
                  </button>
                </div>

                {/* Form Controls depending on Active Tab */}
                <form onSubmit={handleFiSearchSubmit}>
                  {searchTab === "categories" && (
                    <div className="fi-search-fields-grid">
                      <div className="fi-input-group">
                        <label>Select Industry</label>
                        <select
                          className="fi-select-control"
                          value={fiIndustry}
                          onChange={(e) => {
                            setFiIndustry(e.target.value);
                            setFiSector("");
                          }}
                        >
                          <option value="">All Industries</option>
                          {FI_INDUSTRIES.map((ind, idx) => (
                            <option key={idx} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>Select Sector</label>
                        <select
                          className="fi-select-control"
                          value={fiSector}
                          onChange={(e) => setFiSector(e.target.value)}
                        >
                          <option value="">All Sectors</option>
                          {fiIndustry && FI_SECTORS_MAP[fiIndustry]
                            ? FI_SECTORS_MAP[fiIndustry].map((sec, i) => (
                              <option key={i} value={sec}>{sec}</option>
                            ))
                            : ["QSR", "Preschool", "Salon", "Retail", "Services"].map((sec, i) => (
                              <option key={i} value={sec}>{sec}</option>
                            ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>Search Concept</label>
                        <input
                          type="text"
                          className="fi-select-control"
                          placeholder="e.g. Chai, EV, Gym..."
                          value={fiService}
                          onChange={(e) => setFiService(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {searchTab === "location" && (
                    <div className="fi-search-fields-grid">
                      <div className="fi-input-group">
                        <label>Select Industry</label>
                        <select
                          className="fi-select-control"
                          value={fiLocIndustry}
                          onChange={(e) => setFiLocIndustry(e.target.value)}
                        >
                          <option value="">All Industries</option>
                          {FI_INDUSTRIES.map((ind, idx) => (
                            <option key={idx} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>Select State</label>
                        <select
                          className="fi-select-control"
                          value={fiState}
                          onChange={(e) => {
                            setFiState(e.target.value);
                            setFiCity("");
                          }}
                        >
                          <option value="">All States</option>
                          {FI_STATES.map((st, i) => (
                            <option key={i} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>Select District</label>
                        <select
                          className="fi-select-control"
                          value={fiCity}
                          onChange={(e) => setFiCity(e.target.value)}
                        >
                          <option value="">All Districts</option>
                          {(fiState && DISTRICTS_BY_STATE[fiState]
                            ? DISTRICTS_BY_STATE[fiState]
                            : ALL_DISTRICTS).map((d, i) => (
                              <option key={i} value={d}>{d}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {searchTab === "investment" && (
                    <div className="fi-search-fields-grid">
                      <div className="fi-input-group">
                        <label>Select Industry</label>
                        <select
                          className="fi-select-control"
                          value={fiInvIndustry}
                          onChange={(e) => setFiInvIndustry(e.target.value)}
                        >
                          <option value="">All Industries</option>
                          {FI_INDUSTRIES.map((ind, idx) => (
                            <option key={idx} value={ind}>{ind}</option>
                          ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>Min Investment</label>
                        <select
                          className="fi-select-control"
                          value={fiMinInv}
                          onChange={(e) => handleMinInvChange(e.target.value)}
                        >
                          <option value="">No Min Limit</option>
                          {availableMinBudgets.map((b, i) => (
                            <option key={i} value={b.label}>{b.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="fi-input-group">
                        <label>
                          Max Investment
                          {fiMinInv && (
                            <span style={{ fontSize: "9.5px", color: "#16a34a", fontWeight: "700", marginLeft: "6px" }}>
                              (&gt; {fiMinInv})
                            </span>
                          )}
                        </label>
                        <select
                          className="fi-select-control"
                          value={fiMaxInv}
                          onChange={(e) => handleMaxInvChange(e.target.value)}
                        >
                          <option value="">No Max Limit</option>
                          {availableMaxBudgets.map((b, i) => (
                            <option key={i} value={b.label}>{b.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="fi-search-action-bar">
                    <button type="submit" className="fi-btn-search-main">
                      <Search size={18} /> Search Franchise Opportunities
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Hero Quick Action Banner Cards */}
            <div className="fi-action-cards-grid">
              <Link href="/investor-registration" className="fi-action-card card-green">
                <div className="fi-action-info">
                  <span className="fi-action-tag">Investor Hub</span>
                  <h3 className="fi-action-title">Start A Business Today</h3>
                  <p className="fi-action-sub">Investor Registration & ROI Profiles</p>
                </div>
                <div className="fi-action-arrow">
                  <ArrowRight size={18} />
                </div>
              </Link>

              <Link href="/brand-registration" className="fi-action-card card-blue">
                <div className="fi-action-info">
                  <span className="fi-action-tag">Franchisor Hub</span>
                  <h3 className="fi-action-title">Appoint Channel Partners</h3>
                  <p className="fi-action-sub">Franchisor & Brand Registration</p>
                </div>
                <div className="fi-action-arrow">
                  <ArrowRight size={18} />
                </div>
              </Link>

              {/* Ask Our Experts Interactive Card */}
              <div className="fi-ask-experts-widget">
                <div className="fi-expert-header">
                  <div className="fi-expert-title">
                    <Sparkles size={16} style={{ color: "#7cb02c" }} /> Ask Our Experts
                  </div>
                  <span style={{ fontSize: "11px", color: "#25D366", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="live-dot-pulse"></span> Live Support
                  </span>
                </div>

                <div className="fi-expert-btns" style={{ marginBottom: "12px" }}>
                  <button
                    type="button"
                    className={`fi-expert-toggle-btn ${expertMode === "expand" ? "active" : ""}`}
                    onClick={() => {
                      setExpertMode("expand");
                      handleOpenAskExperts("expand");
                    }}
                  >
                    Expand My Brand
                  </button>
                  <button
                    type="button"
                    className={`fi-expert-toggle-btn ${expertMode === "buy" ? "active" : ""}`}
                    onClick={() => {
                      setExpertMode("buy");
                      handleOpenAskExperts("buy");
                    }}
                  >
                    Buy a Franchise
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAskExperts(expertMode)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#25D366",
                    color: "#ffffff",
                    fontWeight: "800",
                    fontSize: "13px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  <MessageCircle size={16} /> Consult Franchise Expert on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Leading Franchises Today Banner Showcase Carousel */}
      <section className="fi-leading-franchises-section">
        <div className="container">
          <div className="fi-section-header">
            <div className="fi-section-title-wrap">
              <h2>
                <Award size={24} style={{ color: "#7cb02c" }} /> Leading Franchises Today
              </h2>
              <p>Top performing franchise setups actively looking for regional & master partners</p>
            </div>

            <div className="fi-carousel-controls">
              <button className="fi-carousel-btn" onClick={handlePrevLeading} title="Previous">
                <ChevronLeft size={20} />
              </button>
              <button className="fi-carousel-btn" onClick={handleNextLeading} title="Next">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="fi-brand-cards-track" ref={leadingCarouselRef}>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={`skel-leading-${idx}`} className="fi-brand-card-item" style={{ flex: "0 0 290px" }}>
                  <div className="skeleton-box" style={{ height: "170px", width: "100%", borderRadius: "0" }} />
                  <div className="fi-brand-body" style={{ padding: "18px" }}>
                    <div className="skeleton-box" style={{ height: "14px", width: "90px", marginBottom: "10px" }} />
                    <div className="skeleton-box" style={{ height: "20px", width: "75%", marginBottom: "12px" }} />
                    <div className="skeleton-box" style={{ height: "16px", width: "85%", marginBottom: "16px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", marginBottom: "16px" }}>
                      <div className="skeleton-box" style={{ height: "12px", width: "60px" }} />
                      <div className="skeleton-box" style={{ height: "12px", width: "50px" }} />
                    </div>
                    <div className="skeleton-box" style={{ height: "38px", width: "100%", borderRadius: "12px" }} />
                  </div>
                </div>
              ))
            ) : brands.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "50px 20px", background: "#ffffff", borderRadius: "18px", border: "1px dashed var(--border-color)" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "8px" }}>No Featured Brands Currently Listed</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "20px", fontSize: "14px" }}>Be the first to list your franchise opportunity on Franchise Roots.</p>
                <Link href="/brand-registration" className="btn btn-primary">Register Your Brand</Link>
              </div>
            ) : (
              brands.map((b, idx) => ({
                ...b,
                id: b.id || b._id || `db-${idx}`,
                name: b.name || b.brandName || "Franchise Opportunity",
                company: b.company || b.name || "",
                category: b.category || "Franchise Opportunity",
                minInvestment: b.minInvestment || 0,
                maxInvestment: b.maxInvestment || 0,
                hq: b.hq || b.location || "India",
                roi: b.roi || "12-18 Mos",
                image: b.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400",
                badge: b.featured ? "Featured" : "Verified"
              })).map((b) => (
                <div key={b.id} className="fi-brand-card-item">
                  <div className="fi-brand-img-box">
                    <img src={b.image} alt={b.name} />
                    <span className="fi-brand-cat-badge">{b.category}</span>
                    <span className="fi-brand-roi-pill">ROI: {b.roi}</span>
                  </div>

                  <div className="fi-brand-body">
                    <div>
                      <h3 className="fi-brand-name">{b.name}</h3>
                      <div className="fi-brand-investment">
                        Investment: {formatLakhs(b.minInvestment)} - {formatLakhs(b.maxInvestment)}
                      </div>
                    </div>

                    <div>
                      <div className="fi-brand-meta">
                        <span>HQ: {b.hq}</span>
                        <span style={{ color: "#7cb02c", fontWeight: "700" }}>{b.badge}</span>
                      </div>

                      <Link
                        href={`/brands/${b.id || b._id}`}
                        className="fi-btn-know-more"
                        style={{ textDecoration: "none" }}
                      >
                        Know More <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 2.5 Managed Advertising Space Section */}
      {ads.length > 0 && (
        <section className="fi-ad-space-section" style={{ padding: "44px 0", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: ads.length > 1 ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", gap: "24px" }}>
              {ads.map((ad) => (
                <div
                  key={ad.id || ad._id}
                  style={{
                    position: "relative",
                    borderRadius: "20px",
                    overflow: "hidden",
                    minHeight: "220px",
                    display: "flex",
                    alignItems: "flex-end",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "#0f172a"
                  }}
                >
                  <img
                    src={ad.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200"}
                    alt={ad.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)" }} />

                  <div style={{ position: "relative", zIndex: 2, padding: "28px", width: "100%" }}>
                    <span style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#ffffff", fontSize: "11px", fontWeight: "800", letterSpacing: "0.5px", padding: "4px 12px", borderRadius: "20px", textTransform: "uppercase", display: "inline-block", marginBottom: "12px" }}>
                      {ad.badge || "SPONSORED"}
                    </span>
                    <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#ffffff", marginBottom: "8px", lineHeight: "1.3" }}>
                      {ad.title}
                    </h3>
                    {ad.subtitle && (
                      <p style={{ color: "#cbd5e1", fontSize: "14px", marginBottom: "16px", lineHeight: "1.5" }}>
                        {ad.subtitle}
                      </p>
                    )}
                    <Link
                      href={ad.link || "/brand-registration"}
                      className="btn"
                      style={{ background: "#7cb02c", color: "#ffffff", fontWeight: "800", padding: "10px 20px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
                    >
                      Learn More <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Trust Section (Auto Scrolling verified logos) */}
      <section className="trust-section">
        <div className="container">
          <p className="trust-title">Featured Verification Networks</p>
          <div className="logo-slider">
            <div className="logo-track">
              {[
                "JAIPUR CHAI", "DOCTOR GARAGE", "EDUQUANTUM", "JAAZ BATHWARE", "AMUL PARLIAMENT",
                "BOMBAY KULFI", "JAIPUR CHAI", "DOCTOR GARAGE", "EDUQUANTUM", "JAAZ BATHWARE",
                "AMUL PARLIAMENT", "BOMBAY KULFI"
              ].map((logoName, idx) => (
                <div key={idx} className="logo-item">
                  <span className="logo-item-text">{logoName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Promo Cards (Main features styled premium) */}
      <section className="promo-section container">
        <div className="promo-grid">
          <div className="promo-card blue">
            <div className="promo-card-content">
              <h3>Promote Your Brand</h3>
              <p>Expand your franchise network, acquire verified investor inquiries, and capture active leads instantly.</p>
              <Link href="/brand-registration" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                Register Your Brand <ArrowRight size={14} />
              </Link>
            </div>
            <div className="promo-icon-wrapper">
              <Building size={48} />
            </div>
          </div>

          <div className="promo-card orange">
            <div className="promo-card-content">
              <h3>Acquire Franchise Rights</h3>
              <p>Search from 1,000+ verified franchise concepts with detailed investment breakdowns and corporate support.</p>
              <Link href="/investor-registration" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Register as Investor <ArrowRight size={14} />
              </Link>
            </div>
            <div className="promo-icon-wrapper">
              <Users size={48} />
            </div>
          </div>

          <div className="promo-card green">
            <div className="promo-card-content">
              <h3>Become Channel Partner</h3>
              <p>Network with regional business consultancies, master franchise brokers, and legal registry agents.</p>
              <Link href="/investor-registration" className="btn btn-outline" style={{ alignSelf: 'flex-start', background: 'var(--success)', color: 'white', borderColor: 'transparent' }}>
                Join the Network <ArrowRight size={14} />
              </Link>
            </div>
            <div className="promo-icon-wrapper">
              <Star size={48} />
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Top Franchise Opportunities Section (Franchise India Reference) */}
      <TopFranchiseOpportunities
        brands={brands}
        loading={loading}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          setIsEnquiryOnlyMode(true);
          setEnquirySubmitted(false);
        }}
        onAskExperts={handleOpenAskExperts}
      />

      {/* 5. Popular Categories Grid */}
      <section className="container" style={{ margin: "80px auto" }}>
        <div className="section-title-wrapper">
          <div className="section-title">
            <h2>Explore Business Segments</h2>
            <p>Select your favorite category to audit verified business proposals.</p>
          </div>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className={`category-card ${selectedCategory === cat.name ? "active-category" : ""}`}
                onClick={() => selectCategory(cat.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-icon flex-center">
                  <Icon size={22} />
                </div>
                <h4>{cat.name}</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{cat.count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW: Top Business Opportunities Section (Franchise India Reference) */}
      <TopBusinessOpportunities brands={brands} loading={loading} onAskExperts={handleOpenAskExperts} />


      {/* 6. Premium Brand Slider/Carousel Section */}
      <section className="slider-section">
        <div className="container">
          <div className="section-title-wrapper">
            <div className="section-title">
              <h2>Featured Opportunities</h2>
              <p>Trending franchises gaining high network expansion leads this month.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="slider-nav-btn" onClick={handlePrevSlide} aria-label="Previous slide">
                <ChevronLeft size={20} />
              </button>
              <button className="slider-nav-btn" onClick={handleNextSlide} aria-label="Next slide">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {loading ? (
            <ProductSkeletonSlider count={3} />
          ) : brands.length > 0 && (
            <div className="slider-container" ref={sliderRef}>
              <div className="slider-track">
                {brands.slice(0, 9).map((brand) => (
                  <div key={brand.id} className="slider-card">
                    <div className="slider-image-wrapper">
                      <div className="slider-badge">{brand.hq}</div>
                      <div className="slider-overlay-gradient"></div>
                      <img
                        src={brand.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"}
                        alt={brand.name}
                        className="slider-image"
                      />
                      <div className="slider-brand-logo">
                        <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--primary)' }}>{brand.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="slider-card-content">
                      <span className="slider-category">{brand.category}</span>
                      <h3>{brand.name}</h3>
                      <p
                        style={{ fontSize: '13px', color: 'var(--text-muted)', height: '40px', overflow: 'hidden', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                        dangerouslySetInnerHTML={{ __html: brand.description || "" }}
                      />


                      <div className="slider-meta-row">
                        <div className="slider-meta-col">
                          <span className="slider-meta-label">Min Investment</span>
                          <span className="slider-meta-value" style={{ color: 'var(--primary)' }}>{formatLakhs(brand.minInvestment)}</span>
                        </div>
                        <div className="slider-meta-col">
                          <span className="slider-meta-label">Area Required</span>
                          <span className="slider-meta-value">{brand.areaRequired || "N/A"}</span>
                        </div>
                      </div>

                      <div className="slider-actions">
                        <Link href={`/brands/${brand.id || brand._id}`} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '13px', textDecoration: 'none', textAlign: 'center' }}>
                          Learn More
                        </Link>
                        <Link href={`/brands/${brand.id || brand._id}`} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '13px', textDecoration: 'none', textAlign: 'center' }}>
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* NEW: Ask Our Experts WhatsApp Banner Section */}
      <section className="container">
        <div className="ask-experts-banner">
          <div style={{ maxWidth: "680px", position: "relative", zIndex: 2 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(37, 211, 102, 0.2)", color: "#4ade80", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>
              <MessageCircle size={16} /> Free Advisory Service
            </span>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#ffffff", marginBottom: "12px", lineHeight: 1.2 }}>
              Looking to Buy a Franchise or Expand Your Brand? <br />
              <span style={{ color: "#4ade80" }}>Ask Our Franchise Experts</span>
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "16px", marginBottom: "28px", lineHeight: 1.6 }}>
              Get customized advice based on your budget, city location, and expansion goals. Connect directly with our admin team on WhatsApp.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={() => handleOpenAskExperts("buy")}
                className="btn flex-center"
                style={{
                  background: "#25D366",
                  color: "#ffffff",
                  border: "none",
                  padding: "16px 26px",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: "pointer",
                  gap: "10px",
                  boxShadow: "0 10px 25px rgba(37, 211, 102, 0.4)"
                }}
              >
                <Store size={20} /> Buy a Franchise
              </button>

              <button
                onClick={() => handleOpenAskExperts("expand")}
                className="btn flex-center"
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(8px)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  padding: "16px 26px",
                  borderRadius: "14px",
                  fontWeight: "800",
                  fontSize: "15px",
                  cursor: "pointer",
                  gap: "10px"
                }}
              >
                <Building size={20} /> Expand My Brand
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Managed Services Section */}
      <section className="container" style={{ margin: "80px auto" }}>
        <div className="section-title-wrapper" style={{ marginBottom: "40px" }}>
          <div className="section-title">
            <span className="hero-tag" style={{ marginBottom: "8px", display: "inline-block" }}>Empowering Growth</span>
            <h2>Our Specialised Services</h2>
            <p>Managed solutions for investors seeking franchise ownership and brands looking to scale nationwide.</p>
          </div>
          <Link href="/services" className="btn btn-outline" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            View All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px"
        }}>
          {services.slice(0, 4).map((service) => (
            <div
              key={service.id || service._id}
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid var(--border-color)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column"
              }}
              className="card-hover-effect"
            >
              <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                <img
                  src={service.image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"}
                  alt={service.title}
                  style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", backgroundColor: "#ffffff" }}
                />
              </div>
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-dark)", marginBottom: "10px", lineHeight: "1.3" }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: "13.5px",
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    marginBottom: "16px"
                  }}>
                    {service.content}
                  </p>
                </div>
                <Link
                  href={`/services/${service.id || service._id}`}
                  className="btn btn-outline"
                  style={{ width: "100%", padding: "10px", fontSize: "13px", fontWeight: "700", textAlign: "center", textDecoration: "none" }}
                >
                  Explore Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 8. Process Section (Timeline) */}

      <section className="timeline-section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span className="hero-tag">How it works</span>
            <h2 style={{ fontSize: '32px' }}>Your Roadmap to Business Ownership</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>Four simple steps to register, identify, verify, and lock in franchise catalog parameters.</p>
          </div>

          <div className="timeline-grid">
            <div className="timeline-connector"></div>

            <div className="timeline-card">
              <div className="timeline-num flex-center">1</div>
              <h3>Browse & Search</h3>
              <p>Filter options by sector category, headquarters location, or capital limits.</p>
            </div>

            <div className="timeline-card">
              <div className="timeline-num flex-center">2</div>
              <h3>Know Specifications</h3>
              <p>Compare minimum investments, royalty fees, and shop floor space requirements.</p>
            </div>

            <div className="timeline-card">
              <div className="timeline-num flex-center">3</div>
              <h3>Connect Directly</h3>
              <p>Submit free enquiries. Get detailed catalogs and contract briefs directly from owners.</p>
            </div>

            <div className="timeline-card">
              <div className="timeline-num flex-center">4</div>
              <h3>Finalize Launch</h3>
              <p>Receive local lease analysis, site audits, and complete training guides to open.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Master Franchise Spotlight Banner */}
      <section style={{ padding: "0 0 80px 0" }}>
        <div className="container">
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)",
            borderRadius: "24px",
            padding: "48px 40px",
            color: "white",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            position: "relative",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: "40px",
            alignItems: "center"
          }}>
            <div style={{ position: "relative", zIndex: 2 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "50px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#c7d2fe",
                fontSize: "12.5px",
                fontWeight: "700",
                marginBottom: "16px"
              }}>
                <Crown size={14} style={{ color: "#fbbf24" }} /> State & Territory Rights
              </span>
              <h2 style={{ fontSize: "32px", fontWeight: "800", color: "white", marginBottom: "12px", lineHeight: "1.25" }}>
                Exclusive Master Franchise Opportunities
              </h2>
              <p style={{ color: "#c7d2fe", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
                Secure 100% exclusive master rights for your state. Earn sub-franchisee sign-up fees and recurring monthly royalty shares across leading brand networks.
              </p>
              <Link
                href="/master-franchising"
                className="btn btn-primary"
                style={{ padding: "14px 28px", fontSize: "15px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                Explore Master Rights <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              position: "relative",
              zIndex: 2
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <ShieldCheck size={24} style={{ color: "#10b981", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "white", fontSize: "14px", display: "block" }}>Territorial Lockout Guarantee</strong>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>Zero unit competition in your state</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <IndianRupee size={24} style={{ color: "#fbbf24", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "white", fontSize: "14px", display: "block" }}>Up to 50% Sub-Franchise Royalty Share</strong>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>Recurring passive cashflow model</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Award size={24} style={{ color: "#6366f1", flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "white", fontSize: "14px", display: "block" }}>Full SOP & Ops Support</strong>
                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>Complete brand expansion training</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Metrics/Counters Section */}
      <section style={{ padding: "60px 0", borderBottom: "1px solid var(--border-color)", marginBottom: "80px" }}>
        <div className="container metrics-grid">
          <div>
            <Building size={36} style={{ color: "var(--primary)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "40px", fontWeight: "800" }}>10,000+</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: 'uppercase', marginTop: '6px' }}>Franchise Options</p>
          </div>
          <div>
            <Users size={36} style={{ color: "var(--secondary)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "40px", fontWeight: "800" }}>50,000+</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: 'uppercase', marginTop: '6px' }}>Verified Investors</p>
          </div>
          <div>
            <Award size={36} style={{ color: "var(--success)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "40px", fontWeight: "800" }}>100%</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: 'uppercase', marginTop: '6px' }}>Approved Concepts</p>
          </div>
          <div>
            <ThumbsUp size={36} style={{ color: "var(--accent)", marginBottom: "16px" }} />
            <h3 style={{ fontSize: "40px", fontWeight: "800" }}>17+ Years</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600", textTransform: 'uppercase', marginTop: '6px' }}>Industry Experience</p>
          </div>
        </div>
      </section>

      {/* 10. Browse by State Location */}
      <section className="container" style={{ marginBottom: "80px" }}>
        <div className="section-title-wrapper">
          <div className="section-title">
            <h2>Browse by State Location</h2>
            <p>Target networks inside active business states in India.</p>
          </div>
        </div>
        <div className="states-grid">
          {STATES.map((state, i) => (
            <div
              key={i}
              className="state-item"
              onClick={() => selectLocation(state)}
              style={{ cursor: "pointer" }}
            >
              {state}
            </div>
          ))}
        </div>
      </section>

      {/* 11. Testimonials (Luxury dark background theme) */}
      <section className="testimonials-section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="hero-tag" style={{ background: "rgba(255,255,255,0.1)", color: "white" }}>Corporate testimonials</span>
            <h2>Client Success Stories</h2>
            <p style={{ color: "#94a3b8", maxWidth: "600px", margin: "12px auto 0 auto" }}>
              Hear from leading brand directors who successfully grew their commercial footprint with us.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-quote">
                "Franchise Roots helped us scale our bathware brand across western and southern states. We received highly pre-qualified enquiries within weeks of listing our franchise requirements."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">MG</div>
                <div className="author-info">
                  <h4>Ms. Meena Goyal</h4>
                  <p>Director, Jaaz Corporation</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "As an education startup, reaching quality partners was a major bottleneck. The team at Franchise Roots helped us package our STEM modules and introduced us to 20+ state franchises."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">DA</div>
                <div className="author-info">
                  <h4>Darshan Amrute</h4>
                  <p>Head of Franchise Development, Brainytoys</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                "Excellent portal for brand expansion! The lead filtering capabilities on their admin panel allowed our sales teams to focus purely on high-budget leads, optimizing our conversion cycles."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">BP</div>
                <div className="author-info">
                  <h4>Brijesh Patel</h4>
                  <p>Founder & Director, Doctor Garage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ Accordion Section */}
      <section className="faq-section container">
        <div style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="hero-tag">Support Center</span>
          <h2 style={{ fontSize: '32px' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Answers to key questions regarding listing approvals, contracts, and matching algorithms.</p>
        </div>

        <div className="faq-grid">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`faq-item ${openFaqIndex === i ? "open" : ""}`}
              onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
            >
              <div className="faq-question">
                <span>{faq.question}</span>
                <ChevronRight size={18} />
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 13. Newsletter Section */}
      <section className="container" style={{ marginBottom: '80px' }}>
        <div className="newsletter-section">
          <div className="newsletter-content">
            <h2>Join the Inner Circle</h2>
            <p>Receive exclusive alerts on newly verified franchise proposals, ROI analysis briefs, and local market reports weekly.</p>

            {newsletterSuccess ? (
              <div className="alert flex-center" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <CheckCircle size={20} style={{ marginRight: '8px' }} />
                <span>Subscription successful! Please check your mailbox for verification.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  required
                  placeholder="Enter your corporate email address"
                  className="newsletter-input"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" className="newsletter-btn">
                  Subscribe Now
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* DYNAMIC SEO + GEO TAGS */}
      <section className="container" style={{ marginBottom: '80px' }}>
        <SEOGeoTags categoryName={fiIndustry || "Business"} basePath="/brands" />
      </section>

      {/* JSON-LD FOR OVERALL WEBSITE, SEO, AND FAQS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "name": "Franchise Roots",
                "url": "https://www.franchiseroots.com",
                "description": "Premium and luxury business and franchise opportunities in India.",
                "publisher": {
                  "@type": "Organization",
                  "name": "Franchise Roots"
                }
              },
              {
                "@type": "FAQPage",
                "mainEntity": FAQS.map(faq => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              }
            ]
          })
        }}
      />
    </div>
  );
}

