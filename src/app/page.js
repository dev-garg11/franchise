"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search, MapPin, IndianRupee, Building, Users, Star, ArrowRight,
  GraduationCap, Utensils, Store, Car, HeartPulse, Building2, HelpCircle,
  CheckCircle, ShieldCheck, Award, ThumbsUp, ChevronRight, MessageSquare, Mail,
  Phone, Globe, Eye, ChevronLeft, Send, Sparkles, ShieldAlert, MessageCircle,
  Filter, Layers, Briefcase, Crown, X, TrendingUp, FileText, Headphones, Dumbbell, Coffee, ShoppingBag, Heart, Cpu, Factory, MoreHorizontal, ChevronDown, LayoutGrid
} from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import TopFranchiseOpportunities from "@/components/TopFranchiseOpportunities";
import TopBusinessOpportunities from "@/components/TopBusinessOpportunities";
import { ProductSkeletonSlider, ProductSkeletonGrid } from "@/components/SkeletonLoader";
import BrandCard from "@/components/public/BrandCard";
import { useApprovedBrands } from "@/lib/brandsCache";
import { DISTRICTS_BY_STATE, ALL_DISTRICTS } from "@/lib/districtsData";
import { BUDGET_OPTIONS, getFilteredMinBudgets, getFilteredMaxBudgets, parseRupeeValue } from "@/lib/investmentData";
import { decodeHtmlEntities, cleanBrandPlainText } from "@/lib/brandFormatters";
import AdCard from "@/components/public/AdCard";
import Marquee from "@/components/public/Marquee";
import JoinCard from "@/components/public/JoinCard";
import ImageRotator, { getImageSources } from "@/components/public/ImageRotator";
import { filterHomepageAdvertisements } from "@/lib/advertisementVisibility";
import { DEFAULT_SERVICES } from "@/lib/defaultContent";
import { toast } from "@/lib/swal";


// Mock Categories with Icons
const CATEGORIES = [
  { name: "Food and Beverage", icon: Utensils },
  { name: "Retail", icon: Store },
  { name: "Education", icon: GraduationCap },
  { name: "Automotive", icon: Car },
  { name: "Beauty & Health", icon: HeartPulse },
  { name: "Business Services", icon: Building2 }
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

// Keep the public homepage renderable while advertisements are loading or the
// ads API is temporarily unavailable. Live admin-managed ads are preferred.
const DEFAULT_PARTNER_SPOTLIGHT_ADS = [];
const PUBLIC_ADS_CACHE_KEY = "franchise_roots_public_ads_v1";

const FI_BUSINESS_TYPES = [
  "Master Franchise",
  "Single Unit Franchise",
  "Multi-Unit Franchise",
  "Dealership & Distributorship",
  "Commercial Franchise",
  "Kiosk & Express Setup"
];

const HERO_PILLS = [
  { name: "Food & Beverage", category: "Food and Beverage", icon: Coffee, color: "#e11d48" },
  { name: "Retail", category: "Retail", icon: ShoppingBag, color: "#f59e0b" },
  { name: "Fitness", category: "Sports, Fitness & Entertainment", icon: Dumbbell, color: "#ec4899" },
  { name: "Education", category: "Education", icon: GraduationCap, color: "#2563eb" },
  { name: "Healthcare", category: "Beauty & Health", icon: Heart, color: "#ef4444" },
  { name: "Beauty & Wellness", category: "Beauty & Health", icon: Sparkles, color: "#d946ef" },
  { name: "Technology", category: "Business Services", icon: Cpu, color: "#0284c7" },
  { name: "Manufacturing", category: "Dealers & Distributors", icon: Factory, color: "#6366f1" },
  { name: "More", category: "", icon: MoreHorizontal, color: "#64748b" }
];

const HERO_AVATARS = [
  { src: "https://randomuser.me/api/portraits/men/32.jpg", label: "Entrepreneur 1" },
  { src: "https://randomuser.me/api/portraits/women/44.jpg", label: "Entrepreneur 2" },
  { src: "https://randomuser.me/api/portraits/men/75.jpg", label: "Entrepreneur 3" },
  { src: "https://randomuser.me/api/portraits/women/68.jpg", label: "Entrepreneur 4" },
  { src: "https://randomuser.me/api/portraits/men/52.jpg", label: "Entrepreneur 5" }
];

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
  const pillsRef = useRef(null);
  const sliderRef = useRef(null);
  const leadingCarouselRef = useRef(null);
  const router = useRouter();
  const { brands, loading, totalCount } = useApprovedBrands();
  const realtimeTotal = totalCount || brands.length || 154;
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

  const [fiTypeIndustry, setFiTypeIndustry] = useState("");
  const [fiBusinessType, setFiBusinessType] = useState("");
  const [fiTypeSearch, setFiTypeSearch] = useState("");

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
  const [spotlightStart, setSpotlightStart] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Services State
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loadingServices, setLoadingServices] = useState(true);

  // Advertisements State
  const [ads, setAds] = useState([]);

  useEffect(() => {
    // Paint the last known public ads immediately on repeat visits while the
    // fresh admin-managed list refreshes in the background.
    try {
      const cachedAds = JSON.parse(sessionStorage.getItem(PUBLIC_ADS_CACHE_KEY) || "null");
      if (Array.isArray(cachedAds)) setAds(cachedAds);
    } catch (error) {
      // Ignore unavailable or invalid browser storage.
    }

    fetch("/api/services", { cache: "force-cache" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch((err) => console.error("Error loading services on homepage:", err))
      .finally(() => setLoadingServices(false));

    fetch("/api/advertisements?public=true", { cache: "force-cache" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (Array.isArray(list)) {
          setAds(filterHomepageAdvertisements(list));
          try { sessionStorage.setItem(PUBLIC_ADS_CACHE_KEY, JSON.stringify(filterHomepageAdvertisements(list))); } catch (error) { /* storage is optional */ }
        }
      })
      .catch((err) => console.error("Error loading advertisements on homepage:", err));
  }, []);

  // Pre-fill enquiry form if investor is logged in
  useEffect(() => {
    if (!selectedBrand || typeof window === "undefined") return undefined;
    const timer = window.setTimeout(() => {
      if (localStorage.getItem("investorLoggedIn") !== "true") return;
      setEnquiryForm({
        name: localStorage.getItem("investorName") || "",
        email: localStorage.getItem("investorEmail") || "",
        phone: localStorage.getItem("investorPhone") || "",
        message: ""
      });
    }, 0);
    return () => window.clearTimeout(timer);
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
    } else if (searchTab === "business_type") {
      if (fiTypeIndustry) params.set("category", fiTypeIndustry);
      if (fiBusinessType) params.set("type", fiBusinessType);
      const combinedSearch = [fiBusinessType, fiTypeSearch].filter(Boolean).join(" ");
      if (combinedSearch) params.set("search", combinedSearch);
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

  // Category select handler: click sets or toggles active category
  const selectCategory = (categoryName) => {
    setSelectedCategory((prev) => (prev === categoryName ? "" : categoryName));
  };

  // Brands filtered by the selected business category
  const categoryFilteredBrands = useMemo(() => {
    if (!selectedCategory) return brands.slice(0, 6);
    const target = selectedCategory.trim().toLowerCase();
    return brands.filter((b) => {
      const cat = (b.category || "").trim().toLowerCase();
      if (cat === target) return true;
      if (target === "automotive" && (cat === "automobiles" || cat.includes("auto"))) return true;
      if (target === "beauty & health" && (cat.includes("beauty") || cat.includes("health") || cat.includes("wellness"))) return true;
      if (target === "food and beverage" && (cat.includes("food") || cat.includes("beverage") || cat.includes("f&b") || cat.includes("restaurant") || cat.includes("cafe"))) return true;
      return cat.includes(target) || target.includes(cat);
    });
  }, [brands, selectedCategory]);

  // Quick location select -> Redirection
  const selectLocation = (locationName) => {
    router.push(`/brands?location=${encodeURIComponent(locationName)}`);
  };

  // Format currency
  const formatLakhs = (val) => {
    const rupee = "\u20B9";
    if (!val) return "N/A";
    if (val >= 10000000) return `${rupee}${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `${rupee}${(val / 100000).toFixed(1)} Lakhs`;
    return `${rupee}${val.toLocaleString("en-IN")}`;
  };

  const formatLakhsLegacy = (val) => {
    return formatLakhsFixed(val);
    if (!val) return "N/A";
    if (val >= 10000000) return `â‚¹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `â‚¹${(val / 100000).toFixed(1)} Lakhs`;
    return `â‚¹${val.toLocaleString("en-IN")}`;
  };

  const formatLakhsFixed = (val) => {
    const rupee = "\u20B9";
    if (val >= 10000000) return `${rupee}${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `${rupee}${(val / 100000).toFixed(1)} Lakhs`;
    return `${rupee}${val.toLocaleString("en-IN")}`;
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

  const spotlightAds = useMemo(() => {
    return [...ads].sort((first, second) => {
      const firstFeatured = String(first.badge || "").toLowerCase().includes("featured");
      const secondFeatured = String(second.badge || "").toLowerCase().includes("featured");
      return Number(secondFeatured) - Number(firstFeatured);
    });
  }, [ads]);

  const effectiveSpotlightAds = useMemo(() => {
    if (spotlightAds && spotlightAds.length > 0) {
      if (spotlightAds.length >= 4) return spotlightAds;
      const remaining = DEFAULT_PARTNER_SPOTLIGHT_ADS.filter(
        def => !spotlightAds.some(a => (a.title || "").toLowerCase().trim() === (def.title || "").toLowerCase().trim())
      );
      return [...spotlightAds, ...remaining].slice(0, 3);
    }
    return DEFAULT_PARTNER_SPOTLIGHT_ADS;
  }, [spotlightAds]);

  // Keep the partner area compact: show three placements and rotate the next
  // placement into view so newly-added admin ads are visible without growing
  // the section vertically.
  useEffect(() => {
    setSpotlightStart((current) => {
      if (effectiveSpotlightAds.length <= 3) return 0;
      return current % effectiveSpotlightAds.length;
    });
  }, [effectiveSpotlightAds.length]);

  useEffect(() => {
    if (effectiveSpotlightAds.length <= 3) return undefined;
    const timer = window.setInterval(() => {
      setSpotlightStart((current) => (current + 1) % effectiveSpotlightAds.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [effectiveSpotlightAds.length]);

  const visibleSpotlightAds = useMemo(() => {
    if (effectiveSpotlightAds.length <= 3) return effectiveSpotlightAds;
    return Array.from({ length: 3 }, (_, index) => (
      effectiveSpotlightAds[(spotlightStart + index) % effectiveSpotlightAds.length]
    ));
  }, [effectiveSpotlightAds, spotlightStart]);

  const moveSpotlight = (direction) => {
    if (effectiveSpotlightAds.length <= 3) return;
    setSpotlightStart((current) => (
      (current + direction + effectiveSpotlightAds.length) % effectiveSpotlightAds.length
    ));
  };


  const adminWhatsAppNumber = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999").replace(/[^0-9]/g, "");
  const heroWhatsAppUrl = `https://api.whatsapp.com/send?phone=${adminWhatsAppNumber}&text=${encodeURIComponent("Hi Franchise Roots, I am interested in Franchise Opportunities and would like a free consultation.")}`;

  return (
    <div className="public-home">
      {/* 1. Main Hero Banner & Multi-Criteria Search (Franchise Roots Redesign) */}
      <section className="fr-hero-section">
        {/* Decorative CSS background flourishes */}
        <div className="fr-hero-flourish-tl" />
        <div className="fr-hero-bg-glow" />
        <div className="fr-hero-photo" aria-hidden="true" />

        <div className="container">
          <div className="fr-hero-main-layout">
            {/* Left Column: Badge, Heading, Subtitle, Highlights, Search Card, Pills */}
            <div className="fr-hero-left">
              {/* Top pill badge */}
              <div className="fr-hero-badge-wrap">
                <Link href="/brands" className="fr-hero-badge">
                  <span className="fr-badge-crown-box" aria-hidden="true">
                    <Crown size={13} className="fr-crown-icon" />
                  </span>
                  <span className="fr-badge-text">India&apos;s No.1 Franchise Marketplace</span>
                  <span className="fr-badge-arrow">→</span>
                </Link>
              </div>

              {/* Heading */}
              <h1 className="fr-hero-title">
                Find India&apos;s Best
                <span className="fr-hero-title-row">
                  <span className="fr-title-accent-wrap">
                    Franchise
                    <svg className="fr-title-brush-curve" viewBox="0 0 210 16" fill="none" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M 4 6 C 55 14, 155 14, 206 5 C 160 12, 60 12, 4 6 Z" fill="url(#fr-title-brush-grad)" />
                      <defs>
                        <linearGradient id="fr-title-brush-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ff0055" />
                          <stop offset="60%" stopColor="#e11d48" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>{" "}
                  <span className="fr-title-opp-gradient">Opportunities</span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="fr-hero-subtitle">
                Explore {realtimeTotal ? `${realtimeTotal}+` : "154+"} audited business setups, master dealerships &amp; ROI-proven brands. Start your franchise journey with confidence.
              </p>

              {/* Three feature highlights */}
              <div className="fr-hero-highlights">
                <div className="fr-highlight-item">
                  <div className="fr-highlight-icon fr-hi-pink">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="fr-highlight-meta">
                    <strong>Verified Brands</strong>
                    <span>100% authentic</span>
                  </div>
                </div>

                <div className="fr-highlight-divider" />

                <div className="fr-highlight-item">
                  <div className="fr-highlight-icon fr-hi-blue">
                    <TrendingUp size={20} />
                  </div>
                  <div className="fr-highlight-meta">
                    <strong>High ROI Options</strong>
                    <span>Profitable businesses</span>
                  </div>
                </div>

                <div className="fr-highlight-divider" />

                <div className="fr-highlight-item">
                  <div className="fr-highlight-icon fr-hi-purple">
                    <Headphones size={20} />
                  </div>
                  <div className="fr-highlight-meta">
                    <strong>Expert Support</strong>
                    <span>From search to setup</span>
                  </div>
                </div>
              </div>

              {/* White search card */}
              <div className="fr-search-card">
                {/* 4 Rail Tabs */}
                <div className="fr-tabs-rail" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={searchTab === "categories"}
                    className={`fr-tab-btn ${searchTab === "categories" ? "active" : ""}`}
                    onClick={() => setSearchTab("categories")}
                  >
                    <LayoutGrid size={15} />
                    <span>Categories</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={searchTab === "location"}
                    className={`fr-tab-btn ${searchTab === "location" ? "active" : ""}`}
                    onClick={() => setSearchTab("location")}
                  >
                    <MapPin size={15} />
                    <span>Location</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={searchTab === "investment"}
                    className={`fr-tab-btn ${searchTab === "investment" ? "active" : ""}`}
                    onClick={() => setSearchTab("investment")}
                  >
                    <IndianRupee size={15} />
                    <span>Investment</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={searchTab === "business_type"}
                    className={`fr-tab-btn ${searchTab === "business_type" ? "active" : ""}`}
                    onClick={() => setSearchTab("business_type")}
                  >
                    <Building2 size={15} />
                    <span>Business Type</span>
                  </button>
                </div>

                {/* Form Controls */}
                <form onSubmit={handleFiSearchSubmit} className="fr-search-form">
                  {searchTab === "categories" && (
                    <div className="fr-fields-row">
                      <div className="fr-field-box">
                        <label className="fr-field-label">Select Industry</label>
                        <div className="fr-input-wrap">
                          <Building size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
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
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Select Sector</label>
                        <div className="fr-input-wrap">
                          <Layers size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
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
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Search Concept</label>
                        <div className="fr-input-wrap">
                          <Search size={16} className="fr-input-icon" />
                          <input
                            type="text"
                            className="fr-input-control"
                            placeholder="e.g. Chai, EV, Gym, Education..."
                            value={fiService}
                            onChange={(e) => setFiService(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="fr-btn-wrap">
                        <button type="submit" className="fr-search-submit-btn">
                          <span>Search Franchise</span>
                          <span>Opportunities →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {searchTab === "location" && (
                    <div className="fr-fields-row">
                      <div className="fr-field-box">
                        <label className="fr-field-label">Select Industry</label>
                        <div className="fr-input-wrap">
                          <Building size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiLocIndustry}
                            onChange={(e) => setFiLocIndustry(e.target.value)}
                          >
                            <option value="">All Industries</option>
                            {FI_INDUSTRIES.map((ind, idx) => (
                              <option key={idx} value={ind}>{ind}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Select State</label>
                        <div className="fr-input-wrap">
                          <MapPin size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
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
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Select District</label>
                        <div className="fr-input-wrap">
                          <MapPin size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
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
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-btn-wrap">
                        <button type="submit" className="fr-search-submit-btn">
                          <span>Search Franchise</span>
                          <span>Opportunities →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {searchTab === "investment" && (
                    <div className="fr-fields-row">
                      <div className="fr-field-box">
                        <label className="fr-field-label">Select Industry</label>
                        <div className="fr-input-wrap">
                          <Building size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiInvIndustry}
                            onChange={(e) => setFiInvIndustry(e.target.value)}
                          >
                            <option value="">All Industries</option>
                            {FI_INDUSTRIES.map((ind, idx) => (
                              <option key={idx} value={ind}>{ind}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Min Investment</label>
                        <div className="fr-input-wrap">
                          <IndianRupee size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiMinInv}
                            onChange={(e) => handleMinInvChange(e.target.value)}
                          >
                            <option value="">No Min Limit</option>
                            {availableMinBudgets.map((b, i) => (
                              <option key={i} value={b.label}>{b.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Max Investment</label>
                        <div className="fr-input-wrap">
                          <IndianRupee size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiMaxInv}
                            onChange={(e) => handleMaxInvChange(e.target.value)}
                          >
                            <option value="">No Max Limit</option>
                            {availableMaxBudgets.map((b, i) => (
                              <option key={i} value={b.label}>{b.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-btn-wrap">
                        <button type="submit" className="fr-search-submit-btn">
                          <span>Search Franchise</span>
                          <span>Opportunities →</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {searchTab === "business_type" && (
                    <div className="fr-fields-row">
                      <div className="fr-field-box">
                        <label className="fr-field-label">Select Industry</label>
                        <div className="fr-input-wrap">
                          <Building size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiTypeIndustry}
                            onChange={(e) => setFiTypeIndustry(e.target.value)}
                          >
                            <option value="">All Industries</option>
                            {FI_INDUSTRIES.map((ind, idx) => (
                              <option key={idx} value={ind}>{ind}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Business Type</label>
                        <div className="fr-input-wrap">
                          <Briefcase size={16} className="fr-input-icon" />
                          <select
                            className="fr-select-control"
                            value={fiBusinessType}
                            onChange={(e) => setFiBusinessType(e.target.value)}
                          >
                            <option value="">All Business Types</option>
                            {FI_BUSINESS_TYPES.map((bt, i) => (
                              <option key={i} value={bt}>{bt}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="fr-select-chevron" />
                        </div>
                      </div>

                      <div className="fr-field-box">
                        <label className="fr-field-label">Search Concept</label>
                        <div className="fr-input-wrap">
                          <Search size={16} className="fr-input-icon" />
                          <input
                            type="text"
                            className="fr-input-control"
                            placeholder="e.g. Chai, EV, Gym, Education..."
                            value={fiTypeSearch}
                            onChange={(e) => setFiTypeSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="fr-btn-wrap">
                        <button type="submit" className="fr-search-submit-btn">
                          <span>Search Franchise</span>
                          <span>Opportunities →</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Sub-category pills strip */}
              <div className="fr-pills-strip-wrap">
                <div ref={pillsRef} className="fr-pills-strip" role="navigation" aria-label="Quick Category Filters">
                  {HERO_PILLS.map((pill, idx) => {
                    const PillIcon = pill.icon;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="fr-pill-item"
                        onClick={() => {
                          if (pill.name === "More") {
                            router.push("/brands");
                          } else {
                            router.push(`/brands?category=${encodeURIComponent(pill.category || pill.name)}`);
                          }
                        }}
                      >
                        <span className="fr-pill-icon" style={{ color: pill.color }}>
                          <PillIcon size={14} />
                        </span>
                        <span className="fr-pill-label">{pill.name}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="fr-pills-scroll-hint fr-pills-scroll-prev"
                  aria-label="Show previous categories"
                  onClick={() => pillsRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="fr-pills-scroll-hint fr-pills-scroll-next"
                  aria-label="Show more categories"
                  onClick={() => pillsRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right Column: Three Action Cards */}
            <div className="fr-hero-right">
              <div className="fr-action-cards-stack">
                <Link href="/investor-registration" className="fr-action-card fr-card-investor">
                  <div className="fr-action-icon fr-icon-pink">
                    <TrendingUp size={22} />
                  </div>
                  <div className="fr-action-body">
                    <h3 className="fr-action-title">Start A Business Today</h3>
                    <p className="fr-action-sub">Investor Registration &amp; ROI Profiles</p>
                  </div>
                  <div className="fr-action-arrow fr-arrow-pink">
                    <ArrowRight size={16} />
                  </div>
                </Link>

                <Link href="/brand-registration" className="fr-action-card fr-card-brand">
                  <div className="fr-action-icon fr-icon-purple">
                    <FileText size={22} />
                  </div>
                  <div className="fr-action-body">
                    <h3 className="fr-action-title">Register your Brand</h3>
                    <p className="fr-action-sub">Franchisor &amp; Brand Registration</p>
                  </div>
                  <div className="fr-action-arrow fr-arrow-purple">
                    <ArrowRight size={16} />
                  </div>
                </Link>

                <a
                  href={heroWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fr-action-card fr-card-whatsapp"
                >
                  <div className="fr-action-icon fr-icon-green">
                    <MessageCircle size={22} />
                  </div>
                  <div className="fr-action-body">
                    <h3 className="fr-action-title">Talk to an Expert on WhatsApp</h3>
                    <p className="fr-action-sub">Get Free Consultation</p>
                  </div>
                  <div className="fr-action-arrow fr-arrow-green">
                    <ArrowRight size={16} />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stat Bar over Bottom Wave */}
        <div className="fr-hero-wave-wrap">
          <svg className="fr-wave-svg" viewBox="0 0 1440 54" fill="none" preserveAspectRatio="none">
            <path
              d="M0 24 C 280 4 620 44 960 16 C 1180 -4 1340 32 1440 22 L 1440 54 L 0 54 Z"
              fill="url(#fr-wave-grad)"
            />
            <defs>
              <linearGradient id="fr-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#081846" />
                <stop offset="35%" stopColor="#0e2a78" />
                <stop offset="70%" stopColor="#4f1d96" />
                <stop offset="90%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
            </defs>
          </svg>

          <div className="fr-hero-stat-bar">
            <div className="container">
              <div className="fr-stats-grid">
                {/* Stat 1: Franchise Options */}
                <div className="fr-stat-item fr-stat-trust">
                  <div className="fr-avatar-stack" aria-label="Entrepreneur community avatars">
                    {HERO_AVATARS.map(({ src, label }) => (
                      <span className="fr-avatar" title={label} key={label}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="fr-avatar-image" loading="lazy" />
                      </span>
                    ))}
                  </div>
                  <div className="fr-stat-text">
                    <span className="fr-stat-number">10,000+</span>
                    <span className="fr-stat-label">Franchise Options</span>
                  </div>
                </div>

                <div className="fr-stat-sep" />

                {/* Stat 2: Verified Investors */}
                <div className="fr-stat-item">
                  <div className="fr-stat-icon-frame">
                    <Users size={20} />
                  </div>
                  <div className="fr-stat-text">
                    <span className="fr-stat-number">50,000+</span>
                    <span className="fr-stat-label">Verified Investors</span>
                  </div>
                </div>

                <div className="fr-stat-sep" />

                {/* Stat 3: Approved Concepts */}
                <div className="fr-stat-item">
                  <div className="fr-stat-icon-frame">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="fr-stat-text">
                    <span className="fr-stat-number">100%</span>
                    <span className="fr-stat-label">Approved Concepts</span>
                  </div>
                </div>

                <div className="fr-stat-sep" />

                {/* Stat 4: Industry Experience */}
                <div className="fr-stat-item">
                  <div className="fr-stat-icon-frame fr-star-frame">
                    <Award size={20} className="fr-star-gold" />
                  </div>
                  <div className="fr-stat-text">
                    <span className="fr-stat-number">17+ Years</span>
                    <span className="fr-stat-label">Industry Experience</span>
                  </div>
                </div>
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
                <Award size={24} style={{ color: "#10B981" }} /> Leading Franchises Today
              </h2>
              <p>Top performing franchise setups actively looking for regional & master partners</p>
            </div>

          </div>

          <div className="fi-carousel-shell">
            <button className="fi-carousel-side-btn fi-carousel-side-btn--left" onClick={handlePrevLeading} title="Scroll left" aria-label="Scroll franchises left">
              <ChevronLeft size={20} />
            </button>
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
                description: b.description || "",
                minInvestment: b.minInvestment || 0,
                maxInvestment: b.maxInvestment || 0,
                hq: b.hq || b.location || "India",
                image: b.image || "/logo.png"
              })).map((b) => (
                <div key={b.id} className="fi-brand-card-item">
                  <div className="fi-brand-img-box">
                    <ImageRotator sources={getImageSources(b)} alt={b.name} />
                    <span className="fi-brand-cat-badge">{b.category}</span>
                    {b.roi && <span className="fi-brand-roi-pill">ROI: {b.roi}</span>}
                  </div>

                  <div className="fi-brand-body">
                    <div>
                      <h3 className="fi-brand-name" title={b.name}>{b.name}</h3>
                      <div className="fi-brand-investment">
                        Investment: {formatLakhs(b.minInvestment)} - {formatLakhs(b.maxInvestment)}
                      </div>
                      <p className="fi-brand-desc" title={b.description ? b.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : ""}>
                        {b.description
                          ? b.description.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
                          : "Description not disclosed by the brand."}
                      </p>
                    </div>

                    <div>
                      <div className="fi-brand-meta">
                        <span>HQ: {b.hq}</span>
                        <span style={{ color: "#10B981", fontWeight: "700" }}>{b.status === "Approved" ? "Verified" : "Listed"}</span>
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
            <button className="fi-carousel-side-btn fi-carousel-side-btn--right" onClick={handleNextLeading} title="Scroll right" aria-label="Scroll franchises right">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* 2.5 Partner Spotlight */}
      <section className="public-partner-spotlight">
        <div className="container">
          <div className="public-partner-heading">
            <div>
              <span className="public-eyebrow">Partner Spotlight</span>
              <h2>Opportunities from our partners</h2>
            </div>
            <Link className="public-ghost-button" href="/contact">
              Advertise with us <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="public-ads-carousel" aria-roledescription="carousel" aria-label="Partner advertisements">
            <button
              type="button"
              className="public-ads-carousel-button public-ads-carousel-button--prev"
              onClick={() => moveSpotlight(-1)}
              aria-label="Show previous partner advertisements"
              disabled={effectiveSpotlightAds.length <= 3}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="public-ads-grid public-ads-grid--compact">
            {visibleSpotlightAds.map((ad, index) => {
              const isFeatured = String(ad.badge || "").toLowerCase().includes("featured");
              return (
                <AdCard
                  key={`${ad.id || ad._id || ad.title}-${spotlightStart}-${index}`}
                  ad={ad}
                  featured={isFeatured}
                  large={false}
                />
              );
            })}
            </div>
            <button
              type="button"
              className="public-ads-carousel-button public-ads-carousel-button--next"
              onClick={() => moveSpotlight(1)}
              aria-label="Show next partner advertisements"
              disabled={effectiveSpotlightAds.length <= 3}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {effectiveSpotlightAds.length > 3 && (
            <div className="public-ads-carousel-dots" aria-label="Partner advertisement slides">
              {effectiveSpotlightAds.map((ad, index) => (
                <button
                  type="button"
                  key={ad.id || ad._id || ad.title || index}
                  className={index === spotlightStart ? "is-active" : ""}
                  onClick={() => setSpotlightStart(index)}
                  aria-label={`Show partner advertisement ${index + 1}`}
                  aria-current={index === spotlightStart ? "true" : undefined}
                />
              ))}
            </div>
          )}
          <p className="public-sponsored-note">
            Sponsored placements are clearly labelled. Franchise Roots verifies every listing before it goes live.
          </p>
        </div>
      </section>

      {/* 3. Trust Section (Auto Scrolling verified logos) */}
      <section className="trust-section">
        <div className="container">
          <p className="trust-title">Featured Verification Networks</p>
          <h2 className="public-trust-title">Brands that trust Franchise Roots</h2>
          <Marquee items={brands.map((brand) => ({ name: brand.name, image: brand.image || brand.logo || brand.logoUrl }))} />
        </div>
      </section>

      {/* 4. Promo Cards (Main features styled premium) */}
      <section className="promo-section container public-join-section">
        <div className="promo-grid">
          <JoinCard tone="red" tag="For Franchisors" icon={Building} title="Promote Your Brand" description="Expand your franchise network, acquire verified investor inquiries, and capture active leads instantly." points={["Reach verified investors", "Capture active leads instantly", "Grow your franchise network"]} href="/brand-registration" action="Register Your Brand" />
          <JoinCard tone="blue" tag="For Investors" icon={Users} title="Acquire Franchise Rights" description="Search verified franchise concepts with detailed investment breakdowns and corporate support." points={["Verified concepts", "Detailed investment breakdowns", "Corporate support"]} href="/investor-registration" action="Register as Investor" />
          <JoinCard tone="green" tag="For Consultants" icon={Star} title="Become Channel Partner" description="Network with regional business consultancies, master franchise brokers, and legal registry agents." points={["Regional consultancies", "Master franchise brokers", "Legal registry agents"]} href="/investor-registration" action="Join the Network" />
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

      {/* 5. Popular Categories Grid & Dynamic Category Brands Showcase */}
      <section className="container public-category-section" style={{ margin: "80px auto" }}>
        <div className="section-title-wrapper public-category-heading">
          <div className="section-title">
            <span className="public-category-kicker"><LayoutGrid size={14} /> VERIFIED BUSINESS DIRECTORY</span>
            <h2>Explore Business Segments</h2>
            <p>Select your favorite category to audit verified business proposals.</p>
          </div>
          <Link href="/brands" className="public-category-summary" title="Explore all verified franchise brands">
            <div className="public-category-summary-icon"><CheckCircle size={19} /></div>
            <div>
              <strong>{realtimeTotal} verified options</strong>
              <span>Curated across {CATEGORIES.length} high-demand sectors</span>
            </div>
            <ArrowRight size={18} className="public-category-summary-arrow" />
          </Link>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const count = brands.filter((brand) => brand.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={i}
                className={`category-card ${isSelected ? "active-category" : ""}`}
                onClick={() => selectCategory(cat.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectCategory(cat.name);
                  }
                }}
                style={{ cursor: "pointer" }}
                aria-pressed={isSelected}
              >
                <div className="category-icon flex-center">
                  <Icon size={22} />
                </div>
                <h4>{cat.name}</h4>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {count || "Available"} {brands.length ? "options" : "records"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Category Brands Showcase */}
        <div className="public-category-brands-showcase" style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0f1a3d", margin: 0, letterSpacing: "-0.02em" }}>
                  {selectedCategory ? `${selectedCategory} Franchises` : "Top Verified Business Opportunities"}
                </h3>
                <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 11px", borderRadius: "12px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>
                  {categoryFilteredBrands.length} {categoryFilteredBrands.length === 1 ? "Option" : "Options"} Listed
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>
                {selectedCategory
                  ? `Showing verified business proposals in ${selectedCategory}. Click any category above to switch.`
                  : "Click any business segment above to view verified proposals in that industry."}
              </p>
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "7px 14px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                ✕ Clear Filter (Show All)
              </button>
            )}
          </div>

          {loading ? (
            <ProductSkeletonGrid count={3} minWidth="280px" />
          ) : categoryFilteredBrands.length > 0 ? (
            <>
              <div className="public-business-grid">
                {categoryFilteredBrands.slice(0, 6).map((brand) => (
                  <BrandCard
                    key={brand.id || brand._id || brand.name}
                    brand={brand}
                    compact
                    onEnquire={(b) => {
                      setSelectedBrand(b);
                      setIsEnquiryOnlyMode(true);
                      setEnquirySubmitted(false);
                    }}
                  />
                ))}
              </div>

              {categoryFilteredBrands.length > 6 && (
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                  <Link
                    href={`/brands?category=${encodeURIComponent(selectedCategory)}`}
                    className="btn btn-outline"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 24px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "14px",
                      textDecoration: "none"
                    }}
                  >
                    Explore all {categoryFilteredBrands.length} {selectedCategory} Brands <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "700", color: "#0f1a3d", marginBottom: "8px" }}>
                No active listings found in {selectedCategory}
              </h4>
              <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 16px 0" }}>
                New verified concepts in this sector are currently undergoing audit.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className="btn btn-outline"
                style={{ fontSize: "13px", padding: "8px 16px", cursor: "pointer" }}
              >
                View All Categories
              </button>
            </div>
          )}
        </div>
      </section>


      {/* 6. Premium Brand Slider/Carousel Section */}
      <section className="slider-section">
        <div className="container">
          <div className="section-title-wrapper">
            <div className="section-title">
              <h2>Featured Opportunities</h2>
              <p>Trending franchises gaining high network expansion leads this month.</p>
            </div>
          </div>

          {loading ? (
            <ProductSkeletonSlider count={3} />
          ) : brands.length > 0 && (
            <div className="slider-viewport">
              <button className="slider-nav-btn slider-side-nav slider-side-nav-left" onClick={handlePrevSlide} aria-label="Scroll featured opportunities left">
                <ChevronLeft size={22} />
              </button>
              <div className="slider-container" ref={sliderRef}>
                <div className="slider-track">
                  {brands.slice(0, 9).map((brand) => (
                    <div key={brand.id} className="slider-card">
                    <div className="slider-image-wrapper">
                      <div className="slider-badge">{decodeHtmlEntities(brand.hq || "India")}</div>
                      <div className="slider-overlay-gradient"></div>
                      <ImageRotator
                        sources={getImageSources(brand).length > 0 ? getImageSources(brand) : ["https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400"]}
                        alt={decodeHtmlEntities(brand.name)}
                        className="slider-image"
                      />
                      
                    </div>
                    <div className="slider-card-content">
                      <span className="slider-category">{decodeHtmlEntities(brand.category)}</span>
                      <h3>{decodeHtmlEntities(brand.name)}</h3>
                      <p
                        style={{ fontSize: '13px', color: 'var(--text-muted)', height: '40px', overflow: 'hidden', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5' }}
                      >
                        {cleanBrandPlainText(brand.description, brand, 130)}
                      </p>


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
              <button className="slider-nav-btn slider-side-nav slider-side-nav-right" onClick={handleNextSlide} aria-label="Scroll featured opportunities right">
                <ChevronRight size={22} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* NEW: Ask Our Experts WhatsApp Banner Section */}
      <section className="container">
        <div className="ask-experts-banner">
          <div className="ask-experts-banner__glow ask-experts-banner__glow--one" aria-hidden="true" />
          <div className="ask-experts-banner__glow ask-experts-banner__glow--two" aria-hidden="true" />
          <div className="ask-experts-banner__content">
            <span className="ask-experts-banner__eyebrow">
              <MessageCircle size={16} /> Free Advisory Service
            </span>
            <h2>
              Looking to Buy a Franchise or Expand Your Brand? <br />
              <span>Ask Our Franchise Experts</span>
            </h2>
            <p>
              Get customized advice based on your budget, city location, and expansion goals. Connect directly with our admin team on WhatsApp.
            </p>
            <div className="ask-experts-banner__actions">
              <button
                onClick={() => handleOpenAskExperts("buy")}
                className="ask-experts-banner__button ask-experts-banner__button--primary"
              >
                <Store size={20} /> Buy a Franchise
              </button>

              <button
                onClick={() => handleOpenAskExperts("expand")}
                className="ask-experts-banner__button ask-experts-banner__button--secondary"
              >
                <Building size={20} /> Expand My Brand
              </button>
            </div>
          </div>
          <div className="ask-experts-banner__visual" aria-hidden="true">
            <div className="ask-experts-banner__orbit ask-experts-banner__orbit--one" />
            <div className="ask-experts-banner__orbit ask-experts-banner__orbit--two" />
            <div className="ask-experts-banner__visual-card">
              <span className="ask-experts-banner__visual-icon"><MessageCircle size={24} /></span>
              <strong>Let’s build your next move</strong>
              <small>Personal guidance from verified experts</small>
              <div className="ask-experts-banner__visual-progress"><span /></div>
            </div>
            <div className="ask-experts-banner__mini-card ask-experts-banner__mini-card--top">
              <strong>148+</strong><span>verified brands</span>
            </div>
            <div className="ask-experts-banner__mini-card ask-experts-banner__mini-card--bottom">
              <strong>Free</strong><span>first consultation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Managed Services Section */}
      <section className="container public-services-section">
        <div className="section-title-wrapper public-services-heading">
          <div className="section-title public-services-title">
            <span className="hero-tag">Empowering Growth</span>
            <h2>Our Specialised Services</h2>
            <p>Managed solutions for investors seeking franchise ownership and brands looking to scale nationwide.</p>
          </div>
          <Link href="/services" className="btn btn-outline public-services-view-all">
            View All Services <ArrowRight size={16} />
          </Link>
        </div>

        <div className="public-services-grid">
          {services.slice(0, 4).map((service, index) => (
            <div
              key={service.id || service._id}
              className={`public-service-card public-service-card--${(index % 4) + 1}`}
              style={{ "--service-delay": `${index * 90}ms` }}
            >
              <div className="public-service-image-wrap">
                <span className="public-service-number">0{index + 1}</span>
                <ImageRotator
                  sources={getImageSources(service).length > 0 ? getImageSources(service) : ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"]}
                  alt={service.title}
                  className="public-service-image"
                />
              </div>
              <div className="public-service-body">
                <div>
                  <span className="public-service-kicker">Franchise growth solution</span>
                  <h3>{service.title}</h3>
                  <p>{service.content}</p>
                </div>
                <Link
                  href={`/services/${service.id || service._id}`}
                  className="public-service-link"
                >
                  Explore Details <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 8. Process Section (Timeline) */}

      <section className="timeline-section">
        <div className="container">
          <div className="public-timeline-heading" style={{ textAlign: "center", marginBottom: "60px" }}>
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
      <section className="public-master-section" style={{ padding: "0 0 80px 0" }}>
        <div className="container">
          <div className="public-master-banner" style={{
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
            <div className="public-master-copy" style={{ position: "relative", zIndex: 2 }}>
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

            <div className="public-master-benefits" style={{
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
      <section className="public-metrics-section" style={{ padding: "60px 0", borderBottom: "1px solid var(--border-color)", marginBottom: "80px" }}>
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
      <section className="container public-state-section" style={{ marginBottom: "80px" }}>
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
                &quot;Franchise Roots helped us scale our bathware brand across western and southern states. We received highly pre-qualified enquiries within weeks of listing our franchise requirements.&quot;
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">MG</div>
                <div className="author-info">
                  <h4 style={{ color: "#ffffff" }}>Ms. Meena Goyal</h4>
                  <p>Director, Jaaz Corporation</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                &quot;As an education startup, reaching quality partners was a major bottleneck. The team at Franchise Roots helped us package our STEM modules and introduced us to state franchises.&quot;
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">DA</div>
                <div className="author-info">
                  <h4 style={{ color: "#ffffff" }}>Darshan Amrute</h4>
                  <p>Head of Franchise Development, Brainytoys</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-quote">
                &quot;Excellent portal for brand expansion! The lead filtering capabilities allowed our sales teams to focus on qualified leads and optimize our conversion cycles.&quot;
              </p>
              <div className="testimonial-author">
                <div className="author-avatar flex-center">BP</div>
                <div className="author-info">
                  <h4 style={{ color: "#ffffff" }}>Brijesh Patel</h4>
                  <p>Founder & Director, Doctor Garage</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ Accordion Section */}
      <section className="faq-section container">
        <div className="public-faq-heading" style={{ textAlign: "center", marginBottom: "50px" }}>
          <span className="hero-tag">Support Center</span>
          <h2 style={{ fontSize: '32px' }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Answers to key questions regarding listing approvals, contracts, and matching algorithms.</p>
        </div>

        <div className="public-faq-layout">
          <aside className="public-faq-aside">
            <div className="public-faq-aside-orb" aria-hidden="true" />
            <span className="public-faq-aside-icon"><HelpCircle size={24} /></span>
            <span className="public-faq-aside-kicker">Need a clear answer?</span>
            <h3>Let&apos;s make your next move simple.</h3>
            <p>Our advisory team can guide you through listings, investment, approvals, and franchise setup.</p>
            <Link href="/contact" className="public-faq-contact-link">Talk to an advisor <ArrowRight size={15} /></Link>
            <div className="public-faq-trust-row">
              <span><ShieldCheck size={15} /> Verified guidance</span>
              <span><MessageCircle size={15} /> Quick support</span>
              </div>
          </aside>
          <div className="faq-grid">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${openFaqIndex === i ? "open" : ""}`}
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                <div className="faq-question">
                  <span className="faq-question-number">{String(i + 1).padStart(2, "0")}</span>
                  <span>{faq.question}</span>
                  <span className="faq-question-arrow"><ChevronRight size={18} /></span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Newsletter Section */}
      <section className="container public-seo-section" style={{ marginBottom: '80px' }}>
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
          {/* BRAND ENQUIRY MODAL POPUP */}
      {selectedBrand && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBrand(null);
          }}
        >
          <div
            style={{ position: 'relative', width: '100%', maxWidth: '520px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', overflow: 'hidden' }}
          >
            {/* Header */}
            <div style={{ padding: '24px 28px 18px', background: 'linear-gradient(135deg, #f8faff 0%, #edf2fe 100%)', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSelectedBrand(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '50%', background: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close Enquiry Modal"
              >
                <X size={18} />
              </button>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', background: '#dbeafe', color: '#1d4ed8', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                {selectedBrand.category || "Franchise Opportunity"}
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', lineHeight: '1.2' }}>
                Enquire for {selectedBrand.name}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Investment Range: <strong style={{ color: '#2563eb' }}>{selectedBrand.investment_range || (formatLakhs(selectedBrand.minInvestment) + ' - ' + formatLakhs(selectedBrand.maxInvestment))}</strong>
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
              {enquirySubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={32} />
                  </div>
                  <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                    Enquiry Submitted Successfully!
                  </h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                    Thank you, <strong>{enquiryForm.name || "Investor"}</strong>! Your franchise lead has been recorded. Our corporate advisor or <strong>{selectedBrand.name}</strong> will contact you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand(null);
                      setEnquirySubmitted(false);
                    }}
                    style={{ padding: '12px 28px', background: '#2563eb', color: '#ffffff', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#f8fafc' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Message or City (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Interested in opening a franchise branch in Chandigarh / Mohali..."
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#f8fafc', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="submit"
                      disabled={submittingEnquiry}
                      style={{ width: '100%', padding: '14px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '14px', cursor: submittingEnquiry ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)' }}
                    >
                      {submittingEnquiry ? "Submitting..." : "Submit Direct Enquiry"} <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999";
                        const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
                        const msg = 'Hi Franchise Roots, I want to enquire about ' + selectedBrand.name + ' (' + selectedBrand.category + '). Please share catalog & ROI details.';
                        window.open("https://api.whatsapp.com/send?phone=" + cleanPhone + "&text=" + encodeURIComponent(msg), "_blank");
                      }}
                      style={{ width: '100%', padding: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <MessageCircle size={16} color="#16a34a" /> Instant Enquiry on WhatsApp
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
