"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  Building2,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  Eye,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Globe,
  FileCheck,
  Layers,
  ArrowUpRight
} from "lucide-react";
import SEOGeoTags from "@/components/SEOGeoTags";
import PageHeader from "@/components/public/PageHeader";

const STATS = [
  { value: "15+", label: "Years of Excellence", desc: "Established in 2009 in Chandigarh" },
  { value: "50,000+", label: "Verified Investors", desc: "Active high-net-worth network" },
  { value: "1,200+", label: "Vetted Brands", desc: "Across 20+ thriving sectors" },
  { value: "₹250+ Cr", label: "Capital Facilitated", desc: "In profitable franchise ventures" },
  { value: "100+", label: "Cities Covered", desc: "Pan-India operational reach" }
];

const VALUES = [
  {
    icon: <ShieldCheck size={28} style={{ color: "#7cb02c" }} />,
    title: "Rigorous Due Diligence",
    desc: "Every listed brand goes through administrative audits, business model checks, and financial sustainability analysis before being showcased."
  },
  {
    icon: <Target size={28} style={{ color: "#0ea5e9" }} />,
    title: "Precision Matching",
    desc: "We analyze capital thresholds, regional market demand, and investor operational preferences to deliver high-probability, sustainable pairings."
  },
  {
    icon: <Award size={28} style={{ color: "#f59e0b" }} />,
    title: "Master Franchising Exclusivity",
    desc: "Specialized advisory for investors seeking multi-unit territorial monopolies, state master rights, and recurring royalty income."
  },
  {
    icon: <Briefcase size={28} style={{ color: "#8b5cf6" }} />,
    title: "End-to-End Handholding",
    desc: "From initial feasibility and franchise agreement review to location vetting and grand opening, our desk guides your entire expansion journey."
  }
];

const TIMELINE = [
  {
    year: "2009",
    title: "Inception in Chandigarh",
    desc: "Founded as a specialized business consultancy dedicated to organizing India's fragmented retail franchise landscape."
  },
  {
    year: "2014",
    title: "Regional Network Scaling",
    desc: "Expanded across North India, Punjab, Haryana, and Delhi NCR, onboarding 200+ established regional retail and food brands."
  },
  {
    year: "2019",
    title: "Digital Platform Launch",
    desc: "Pioneered a transparent online matching portal with verified investor profiling and direct franchisor communication channels."
  },
  {
    year: "2023",
    title: "Master Franchise Wing",
    desc: "Introduced dedicated corporate and state-level master franchise brokerage, helping international and national brands penetrate state boundaries."
  },
  {
    year: "2026",
    title: "National Market Leader",
    desc: "Over 50,000 active investors and 1,200+ brand partners empowered by intelligent matchmaking and comprehensive advisory desks."
  }
];

const FAQS = [
  {
    q: "What is Franchise Roots?",
    a: "Franchise Roots is India's premier franchise consulting and digital matchmaking platform. Founded in 2009, we connect vetted entrepreneurs and corporate investors with profitable, verified franchise opportunities across retail, food & beverage, education, healthcare, and services."
  },
  {
    q: "How does Franchise Roots verify brands?",
    a: "Our administrative desk screens every brand registration for valid business registrations, trademark authenticity, operational track record, unit-level profitability, franchise support structure, and transparent legal agreements before approving their public listing."
  },
  {
    q: "Are investor enquiries and advisory free?",
    a: "Yes! Submitting enquiries, exploring brand catalogs, and receiving preliminary franchise consultations through Franchise Roots is 100% free for certified investors."
  },
  {
    q: "What is Master Franchising and do you support it?",
    a: "Master Franchising grants an investor exclusive rights to develop and sub-franchise an entire territory, state, or region. We specialize in structuring master franchise contracts, determining royalty sharing models, and finding qualified regional partners."
  },
  {
    q: "Where is Franchise Roots located?",
    a: "Our national headquarters is located at SCO 64-65, 4th Floor, Sub. City Center, Sector 34A, Chandigarh, with consulting partners and advisory representatives operating across all major metropolitan regions in India."
  }
];

export default function AboutUsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? -1 : idx);
  };

  const handleOpenAskExperts = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-ask-experts", { detail: { mode: "buy" } }));
    }
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      {/* JSON-LD Schema for Organization & AboutPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Franchise Roots",
            "description": "Learn about Franchise Roots, India's leading franchise consulting and business matchmaking platform established in 2009.",
            "url": "https://www.franchiseroots.com/about-us",
            "mainEntity": {
              "@type": "Organization",
              "name": "Franchise Roots",
              "foundingDate": "2009",
              "telephone": "+91-9815489999",
              "email": "info@franchiseroots.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "SCO 64-65, 4th Floor, Sub. City Center, Sector 34A",
                "addressLocality": "Chandigarh",
                "postalCode": "160022",
                "addressCountry": "IN"
              }
            }
          })
        }}
      />

      {/* 1. Hero Section */}
      <PageHeader
        theme="about"
        breadcrumb={<><Link href="/">Home</Link><span>/</span><span>About Us</span></>}
        eyebrow={<><Sparkles size={15} /> INDIA&apos;S PREMIER BUSINESS &amp; FRANCHISE MATCHMAKING PLATFORM · EST. 2009</>}
        titleBefore="Empowering Entrepreneurs. "
        titleAccent="Scaling Brands Across India."
        subtitle="Franchise Roots bridges the gap between ambitious business investors and industry-leading brands. For over 15 years, we have provided transparent due diligence, strategic advisory, and master franchise expansion across the Indian subcontinent."
        leftExtra={(
          <div className="page-header-actions">
            <Link href="/brands" className="page-header-action page-header-action--primary">Explore Opportunities <ArrowRight size={16} /></Link>
            <button type="button" onClick={handleOpenAskExperts} className="page-header-action page-header-action--secondary">Consult an Advisor</button>
          </div>
        )}
        rightVisual={(
          <div className="about-header-photo-wrap">
            <Image src="/Modern%20Franchise%20Roots%20Office%20at%20Dusk.png" alt="Franchise Roots office" fill priority sizes="(max-width: 999px) 100vw, 42vw" className="about-header-photo" />
            <span className="about-header-badge about-header-badge--top"><strong>Est. 2009</strong><small>Trusted for years</small></span>
            <span className="about-header-badge about-header-badge--bottom"><strong>1,200+</strong><small>Vetted brands</small></span>
          </div>
        )}
      />
      {/* Legacy hero content replaced by the shared animated PageHeader. */}
      {false && <section style={{}}>
        {/* Ambient Gradient Orbs */}
        <div style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 176, 44, 0.25) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />

        <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: "920px" }}>
          {/* Breadcrumb */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8", marginBottom: "20px" }}>
            <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Home</Link>
            <span>/</span>
            <span style={{ color: "#7cb02c", fontWeight: "700" }}>About Us</span>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              backdropFilter: "blur(12px)",
              padding: "8px 20px",
              borderRadius: "9999px",
              fontSize: "13.5px",
              fontWeight: "700",
              color: "#a7f3d0",
              letterSpacing: "0.02em"
            }}>
              <Sparkles size={16} style={{ color: "#7cb02c" }} />
              India&apos;s Premier Business & Franchise Matchmaking Platform • Est. 2009
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: "900",
            lineHeight: "1.18",
            letterSpacing: "-0.03em",
            marginBottom: "20px",
            color: "#ffffff"
          }}>
            Empowering Entrepreneurs. <br />
            <span style={{
              background: "linear-gradient(135deg, #7cb02c 0%, #a3e635 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Scaling Brands Across India.
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            lineHeight: "1.65",
            color: "#cbd5e1",
            maxWidth: "760px",
            margin: "0 auto 36px auto"
          }}>
            Franchise Roots bridges the gap between ambitious business investors and industry-leading brands. For over 15 years, we have provided transparent due diligence, strategic advisory, and master franchise expansion across the Indian subcontinent.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link
              href="/brands"
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: "800",
                borderRadius: "14px",
                boxShadow: "0 10px 25px -5px rgba(124, 176, 44, 0.4)"
              }}
            >
              Explore Opportunities <ArrowRight size={18} />
            </Link>

            <button
              onClick={handleOpenAskExperts}
              className="btn btn-outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                fontSize: "15px",
                fontWeight: "700",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(10px)",
                cursor: "pointer"
              }}
            >
              Consult an Advisor
            </button>
          </div>
        </div>
      </section>}

      {/* 2. Key Stats Floating Card */}
      <section className="about-stats-section">
        <div className="container about-stats-card">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "24px",
            textAlign: "center"
          }}>
            {STATS.map((item, idx) => (
              <div key={idx} className="about-stat-item">
                <div style={{
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  fontWeight: "900",
                  color: "#15803d",
                  letterSpacing: "-0.03em",
                  marginBottom: "4px"
                }}>
                  {item.value}
                </div>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#4a5878", marginBottom: "4px", textTransform: "uppercase" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Our Story Section */}
      <section style={{ padding: "90px 0 70px 0" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center"
          }}>
            <div>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(124, 176, 44, 0.12)",
                color: "#4d7c0f",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "800",
                marginBottom: "16px"
              }}>
                <Clock size={14} /> Our Journey Since 2009
              </span>
              <h2 style={{
                fontSize: "clamp(26px, 3vw, 38px)",
                fontWeight: "900",
                color: "#0d173c",
                lineHeight: "1.25",
                marginBottom: "20px"
              }}>
                Built on Trust. Refined by 15+ Years of Industry Leadership.
              </h2>
              <p style={{ fontSize: "15.5px", lineHeight: "1.75", color: "#475569", marginBottom: "16px" }}>
                Founded in 2009 in Chandigarh, <strong>Franchise Roots</strong> began with a clear purpose: eliminating the confusion and high risks associated with buying and expanding businesses in India.
              </p>
              <p style={{ fontSize: "15.5px", lineHeight: "1.75", color: "#475569", marginBottom: "24px" }}>
                Over the last decade and a half, we have evolved from a regional advisory powerhouse into India&apos;s premier digital franchise marketplace. Today, we facilitate thousands of investor inquiries, manage corporate brand expansion portfolios, and broker state-exclusive master franchising agreements across 28 states and Union Territories.
              </p>

              <div style={{
                background: "#f1f5f9",
                borderRadius: "16px",
                padding: "20px 24px",
                borderLeft: "4px solid #7cb02c",
                marginBottom: "28px"
              }}>
                <p style={{ fontStyle: "italic", color: "#1e293b", fontSize: "14.5px", lineHeight: "1.6", margin: 0 }}>
                  “Our philosophy is simple: we succeed only when both the investor and the franchisor thrive together. Every brand we list is vetted for operational durability, realistic ROI, and dedicated franchisor backing.”
                </p>
                <div style={{ marginTop: "10px", fontSize: "13px", fontWeight: "700", color: "#0d173c" }}>
                  — Franchise Roots Leadership Team
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link
                  href="/brand-registration"
                  className="btn btn-primary"
                  style={{ padding: "12px 24px", fontSize: "14px", fontWeight: "700" }}
                >
                  List Your Brand For Expansion
                </Link>
                <Link
                  href="/contact"
                  className="btn btn-outline"
                  style={{ padding: "12px 24px", fontSize: "14px", fontWeight: "700" }}
                >
                  Contact Our Advisory Desk
                </Link>
              </div>
            </div>

            {/* Visual Feature Card Stack */}
            <div style={{
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "24px",
              padding: "36px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              position: "relative"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "28px" }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0d173c, #1e293b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}>
                  <Building2 size={26} />
                </div>
                <div>
                  <h3 style={{ fontSize: "19px", fontWeight: "800", color: "#0d173c", margin: 0 }}>
                    Franchise Roots Ecosystem
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
                    Verified Matchmaking & Scalable Infrastructure
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {[
                  {
                    title: "100% Admin-Verified Listings",
                    desc: "Zero speculative concepts. All opportunities must meet documented financial criteria."
                  },
                  {
                    title: "Direct Connect with Brand Owners",
                    desc: "Cut out unverified middlemen. Enquiries route directly to decision-makers."
                  },
                  {
                    title: "Master Franchising Exclusivity",
                    desc: "State-wide developmental rights, royalty sharing models, and unit sub-franchising."
                  },
                  {
                    title: "Turnkey Investor Guidance",
                    desc: "From initial budget assessment to site selection, lease negotiation, and legal onboarding."
                  }
                ].map((feat, i) => (
                  <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(124, 176, 44, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7cb02c",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14.5px", fontWeight: "700", color: "#0f172a", margin: "0 0 2px 0" }}>
                        {feat.title}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Mission & Vision Cards */}
      <section style={{
        padding: "80px 0",
        background: "linear-gradient(180deg, #f1f5f9 0%, #ffffff 100%)",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 50px auto" }}>
            <span style={{
              background: "rgba(14, 165, 233, 0.1)",
              color: "#0284c7",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "800",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px"
            }}>
              <Target size={14} /> Purpose & Future
            </span>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0d173c", marginBottom: "12px" }}>
              Our Mission & Long-Term Vision
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>
              Guiding India&apos;s entrepreneurship journey with ethical foundations and strategic precision.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px"
          }}>
            {/* Mission Card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "40px 36px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "5px",
                background: "linear-gradient(90deg, #7cb02c, #a3e635)"
              }} />
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(124, 176, 44, 0.12)",
                color: "#7cb02c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px"
              }}>
                <Target size={28} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0d173c", marginBottom: "14px" }}>
                Our Mission
              </h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#475569" }}>
                To democratize business ownership across India by delivering transparent, data-backed, and vetted franchise investments. We exist to empower aspiring entrepreneurs to achieve financial independence while assisting world-class brands in scaling across local and state boundaries with reliable partners.
              </p>
            </div>

            {/* Vision Card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "40px 36px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "5px",
                background: "linear-gradient(90deg, #0ea5e9, #38bdf8)"
              }} />
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "rgba(14, 165, 233, 0.12)",
                color: "#0ea5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px"
              }}>
                <Eye size={28} />
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0d173c", marginBottom: "14px" }}>
                Our Vision
              </h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#475569" }}>
                To be India&apos;s undisputed benchmark and premier ecosystem for commercial business matching, master franchise development, and retail expansion. We envision a thriving economy where every deserving entrepreneur has direct access to verified commercial opportunities that create lasting generational wealth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Values / The Franchise Roots Advantage */}
      <section style={{ padding: "90px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 55px auto" }}>
            <span style={{
              background: "rgba(124, 176, 44, 0.12)",
              color: "#4d7c0f",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "800",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px"
            }}>
              <Award size={14} /> The Franchise Roots Advantage
            </span>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#0d173c", marginBottom: "14px" }}>
              Why Investors & Brands Choose Us
            </h2>
            <p style={{ fontSize: "16px", color: "#64748b" }}>
              Our 4-pillar methodology ensures security, operational viability, and sustained mutual growth.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px"
          }}>
            {VALUES.map((val, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  borderRadius: "18px",
                  padding: "32px 26px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px"
                }}>
                  {val.icon}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d173c", marginBottom: "10px" }}>
                  {val.title}
                </h3>
                <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#64748b", margin: 0 }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Evolution Timeline (2009 - 2026) */}
      <section style={{
        padding: "85px 0",
        background: "linear-gradient(135deg, #0d173c 0%, #1e293b 100%)",
        color: "#ffffff"
      }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 55px auto" }}>
            <span style={{
              background: "rgba(255, 255, 255, 0.1)",
              color: "#a7f3d0",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "700",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px"
            }}>
              <TrendingUp size={14} style={{ color: "#7cb02c" }} /> Milestone Progression
            </span>
            <h2 style={{ fontSize: "34px", fontWeight: "900", color: "#ffffff", marginBottom: "12px" }}>
              Our 15-Year Growth Story
            </h2>
            <p style={{ fontSize: "16px", color: "#94a3b8" }}>
              From a dedicated regional advisory team in Chandigarh to India&apos;s most comprehensive digital marketplace.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "20px"
          }}>
            {TIMELINE.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "18px",
                  padding: "26px 20px",
                  backdropFilter: "blur(10px)"
                }}
              >
                <div style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  background: "#7cb02c",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "800",
                  marginBottom: "14px"
                }}>
                  {item.year}
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#cbd5e1", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Corporate Headquarters & Reach */}
      <section style={{ padding: "85px 0", background: "#f8fafc" }}>
        <div className="container">
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1px solid #e2e8f0",
            padding: "48px 40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "40px",
              alignItems: "center"
            }}>
              <div>
                <span style={{
                  background: "rgba(124, 176, 44, 0.12)",
                  color: "#4d7c0f",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "800",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "14px"
                }}>
                  <MapPin size={14} /> National Headquarters
                </span>
                <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#0d173c", marginBottom: "16px" }}>
                  Visit Our Corporate Office
                </h2>
                <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#64748b", marginBottom: "24px" }}>
                  Headquartered in the commercial heart of Chandigarh, our strategic consulting facility hosts in-person franchisor audits, master franchise signing summits, and investor roundtables.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(13, 23, 60, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0d173c",
                      flexShrink: 0
                    }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Corporate Address</div>
                      <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#0f172a" }}>
                        SCO 64-65, 4th Floor, Sub. City Center, Sector 34A, Chandigarh, India
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(124, 176, 44, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7cb02c",
                      flexShrink: 0
                    }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Direct Hotline</div>
                      <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#0f172a" }}>
                        +91-9815489999
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(14, 165, 233, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0284c7",
                      flexShrink: 0
                    }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Official Email</div>
                      <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#0f172a" }}>
                        info@franchiseroots.com
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours & Consultation Desk */}
              <div style={{
                background: "linear-gradient(135deg, #0d173c 0%, #1e293b 100%)",
                borderRadius: "20px",
                padding: "36px",
                color: "#ffffff"
              }}>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
                  Advisory Desk Timings
                </h3>
                <p style={{ fontSize: "13.5px", color: "#94a3b8", marginBottom: "22px" }}>
                  Schedule a one-on-one session with our senior franchise development officers.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
                    <span style={{ color: "#cbd5e1" }}>Monday – Friday:</span>
                    <span style={{ fontWeight: "700", color: "#7cb02c" }}>10:00 AM – 7:00 PM IST</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
                    <span style={{ color: "#cbd5e1" }}>Saturday:</span>
                    <span style={{ fontWeight: "700", color: "#7cb02c" }}>10:00 AM – 5:00 PM IST</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
                    <span style={{ color: "#cbd5e1" }}>Sunday:</span>
                    <span style={{ color: "#94a3b8" }}>Closed (Emergency Desk Online)</span>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="btn btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "13px",
                    fontSize: "14px",
                    fontWeight: "800"
                  }}
                >
                  Book In-Person Appointment <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQs Section */}
      <section style={{ padding: "80px 0 90px 0", background: "#ffffff" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ textAlign: "center", marginBottom: "45px" }}>
            <span style={{
              background: "rgba(14, 165, 233, 0.1)",
              color: "#0284c7",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "800",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px"
            }}>
              Frequently Asked Questions
            </span>
            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0d173c", marginBottom: "10px" }}>
              Everything You Need to Know About Franchise Roots
            </h2>
            <p style={{ fontSize: "15px", color: "#64748b" }}>
              Quick answers to the most common queries from prospective investors and brand directors.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: openFaq === idx ? "1px solid #7cb02c" : "1px solid #e2e8f0",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "all 0.25s ease"
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "800",
                    color: openFaq === idx ? "#0d173c" : "#1e293b"
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: openFaq === idx ? "rgba(124, 176, 44, 0.15)" : "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: openFaq === idx ? "#7cb02c" : "#64748b",
                    flexShrink: 0
                  }}>
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {openFaq === idx && (
                  <div style={{
                    padding: "0 24px 20px 24px",
                    fontSize: "14.5px",
                    lineHeight: "1.7",
                    color: "#475569",
                    borderTop: "1px dashed #e2e8f0",
                    paddingTop: "16px"
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. High-Conversion Final CTA Banner */}
      <section style={{ padding: "0 20px 80px 20px" }}>
        <div className="container" style={{
          background: "linear-gradient(135deg, #0d173c 0%, #1e1b4b 60%, #0f172a 100%)",
          borderRadius: "28px",
          padding: "60px 40px",
          textAlign: "center",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 40px -10px rgba(13, 23, 60, 0.3)"
        }}>
          <div style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124, 176, 44, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 2, maxWidth: "680px", margin: "0 auto" }}>
            <span style={{
              display: "inline-block",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#a7f3d0",
              padding: "6px 16px",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: "700",
              marginBottom: "18px"
            }}>
              Ready to take the next step?
            </span>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: "900",
              color: "#ffffff",
              marginBottom: "16px",
              lineHeight: "1.2"
            }}>
              Start Your Business Expansion Journey Today
            </h2>
            <p style={{
              fontSize: "16px",
              lineHeight: "1.65",
              color: "#cbd5e1",
              marginBottom: "32px"
            }}>
              Whether you are an ambitious entrepreneur looking for a proven franchise model or an established brand owner looking for national scale, Franchise Roots has the network to make it happen.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
              <Link
                href="/brand-registration"
                className="btn btn-primary"
                style={{
                  padding: "14px 28px",
                  fontSize: "15px",
                  fontWeight: "800",
                  borderRadius: "12px"
                }}
              >
                Register Your Brand <ArrowRight size={16} style={{ display: "inline-block", marginLeft: "6px" }} />
              </Link>
              <Link
                href="/investor-registration"
                className="btn btn-outline"
                style={{
                  padding: "14px 28px",
                  fontSize: "15px",
                  fontWeight: "700",
                  borderRadius: "12px",
                  color: "#ffffff",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                Register as an Investor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Local SEO Geo Tags for Directory Synergy */}
      <div className="container" style={{ paddingBottom: "70px" }}>
        <SEOGeoTags categoryName="Franchise Consulting" basePath="/brands" />
      </div>
    </div>
  );
}
