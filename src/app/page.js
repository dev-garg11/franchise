"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, MapPin, IndianRupee, RotateCcw, Building, Users, Star, ArrowRight,
  GraduationCap, Utensils, Store, Car, HeartPulse, Building2, HelpCircle,
  CheckCircle, ShieldCheck, Award, ThumbsUp, ChevronRight, MessageSquare, Mail,
  Phone, Globe, Eye, ChevronLeft, Send, Sparkles, ShieldAlert, MessageCircle
} from "lucide-react";
import TopFranchiseOpportunities from "@/components/TopFranchiseOpportunities";
import TopBusinessOpportunities from "@/components/TopBusinessOpportunities";
import { ProductSkeletonSlider } from "@/components/SkeletonLoader";


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
  }
];

export default function Home() {
  const sliderRef = useRef(null);
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

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

  // Fetch approved brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/brands?status=Approved");
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      {/* 1. Hero Section (Apple + Stripe style left/right layout) */}
      <section className="hero">
        {/* Decorative Blobs */}
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>

        <div className="container hero-container-inner">
          <div className="hero-content">
            <span className="hero-tag">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              India's Premier Franchise Catalog
            </span>
            <h1>
              Build Your Future. <br />
              Start a <span>Luxury Franchise</span>.
            </h1>
            <p>
              Connect with 50,000+ verified corporate investors. Discover high-ROI business concepts, secure master agreements, and launch premium networks inside local state boundaries.
            </p>

            <div className="hero-buttons">
              <Link href="/investor-registration" className="btn btn-primary">
                Start A Business <ArrowRight size={16} />
              </Link>
              <button onClick={handleOpenAskExperts} className="btn" style={{ background: '#25D366', color: '#ffffff', border: 'none', gap: '8px', display: 'inline-flex', alignItems: 'center', fontWeight: '700', padding: '14px 22px', borderRadius: '12px' }}>
                <MessageCircle size={18} /> Ask Experts on WhatsApp
              </button>
              <Link href="/brand-registration" className="btn btn-outline">
                Register Brand <Building size={16} />
              </Link>
            </div>


            <div className="hero-badges-wrapper">
              <p className="hero-badges-title">Trusted By Leading Corporate Networks</p>
              <div className="hero-badges">
                <span className="hero-badge-item">
                  <ShieldCheck size={16} /> 100% Audited Directory
                </span>
                <span className="hero-badge-item">
                  <Star size={16} style={{ color: 'var(--accent)' }} /> 4.9/5 Average ROI Rating
                </span>
              </div>
            </div>
          </div>

          {/* Hero Right side: 3D-styled floating elements */}
          <div className="hero-artwork">
            <div className="artwork-glow"></div>
            <div className="luxury-illustration-container">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800"
                alt="Corporate Meeting"
                className="illustration-bg-image"
              />

              {/* Overlapping Glass Card 1 */}
              <div className="floating-glass-card fg-card-1">
                <span className="fg-label">Active Investors</span>
                <span className="fg-metric">50k+</span>
                <div className="fg-user-group">
                  <div className="fg-avatar flex-center">IN</div>
                  <div className="fg-avatar flex-center" style={{ background: 'var(--secondary)' }}>BR</div>
                  <div className="fg-avatar flex-center" style={{ background: 'var(--accent)' }}>+</div>
                </div>
              </div>

              {/* Overlapping Glass Card 2 */}
              <div className="floating-glass-card fg-card-2">
                <span className="fg-label">Verified Models</span>
                <span className="fg-metric" style={{ color: 'var(--success)' }}>100%</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>Compliance Approved</span>
              </div>

              {/* Overlapping Glass Card 3 */}
              <div className="floating-glass-card fg-card-3">
                <span className="fg-label">Average Investment</span>
                <span className="fg-metric" style={{ fontSize: '18px' }}>₹10L - ₹25L</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Premium Search Section (Floating search box over transition) */}
      <div className="search-section-wrapper">
        <div className="container">
          <div className="search-container">
            <div className="search-field">
              <label>Search Directory</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="e.g. Bombay Kulfi, Education..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Business Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Segments</option>
                <option value="Food and Beverage">Food & Beverage</option>
                <option value="Retail">Retail</option>
                <option value="Education">Education</option>
                <option value="Automobiles">Automobiles</option>
                <option value="Health and Wellness">Health & Wellness</option>
                <option value="Business Services">Business Services</option>
              </select>
            </div>

            <div className="search-field">
              <label>Investment Limit</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
              >
                <option value="">Any Investment</option>
                <option value="under-2l">Under ₹2 Lakhs</option>
                <option value="2l-5l">₹2L - ₹5 Lakhs</option>
                <option value="5l-10l">₹5L - ₹10 Lakhs</option>
                <option value="10l-15l">₹10L - ₹15 Lakhs</option>
                <option value="15l-20l">₹15L - ₹20 Lakhs</option>
                <option value="20l-30l">₹20L - ₹30 Lakhs</option>
                <option value="above-30l">Above ₹30 Lakhs</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSearchSubmit} style={{ padding: "14px 24px", height: '100%', gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={16} />
              Search Now
            </button>
          </div>
        </div>
      </div>

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
                        <button className="btn btn-outline" onClick={() => { setSelectedBrand(brand); setIsEnquiryOnlyMode(false); setEnquirySubmitted(false); }} style={{ padding: '8px 12px', fontSize: '13px' }}>
                          Learn More
                        </button>
                        <button className="btn btn-primary" onClick={() => { setSelectedBrand(brand); setIsEnquiryOnlyMode(true); setEnquirySubmitted(false); }} style={{ padding: '8px 12px', fontSize: '13px' }}>
                          Apply Now
                        </button>
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

      {/* Detail/Enquiry Modal Overlay (Bigger & Professional Layout) */}
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
    </div>
  );
}

