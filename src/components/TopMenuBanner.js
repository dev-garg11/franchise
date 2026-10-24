"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Phone,
  MessageCircle,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronsRight,
  Sparkles,
  Building,
  TrendingUp,
  Crown,
  BookOpen,
  CheckCircle2,
  Users
} from "lucide-react";

export default function TopMenuBanner() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/brands?search=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/brands");
    }
  };

  return (
    <div className="fa-banner-wrapper">
      {/* ================= 1. PROMO BANNER & HELPLINE STRIP (NO LOGO) ================= */}
      <div className="fa-top-promo-bar">
        <div className="fa-container">
          <div className="fa-promo-grid">
            {/* Center / Left: Big Event & Expo Banner + Headline */}
            <div className="fa-promo-main-col">
              <Link href="/brands" className="fa-expo-banner-link" title="Explore Franchise & Business Expo 2026">
                <img
                  src="/franchise_expo_banner.jpg"
                  alt="Franchise & Business Expo 2026 — Chandigarh • Delhi NCR • Mumbai — Meet 150+ Top Franchise Brands"
                  className="fa-expo-banner-img"
                />
              </Link>
              <h2 className="fa-promo-headline">
                Explore <span className="fa-highlight-red">1,200+ Verified Franchise &amp; Business</span> Opportunities
              </h2>
            </div>

            {/* Middle: Call & Support Helpline Box */}
            <div className="fa-promo-call-col">
              <div className="fa-call-card">
                <div className="fa-call-badge">
                  <Phone size={13} className="fa-call-icon-pulse" />
                  <span>Call To Expand Your Brand Franchise</span>
                </div>

                <div className="fa-call-numbers">
                  <a href="tel:+919815489999" className="fa-phone-btn" title="Call Franchise Roots Corporate Helpline">
                    <Phone size={16} />
                    <span className="fa-phone-num">+91 98154 89999</span>
                  </a>
                  <a
                    href="https://wa.me/919815489999?text=Hello%20Franchise%20Roots%2C%20I%20want%20to%20explore%20franchise%20opportunities"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fa-whatsapp-btn"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Advisory</span>
                  </a>
                </div>

                <div className="fa-call-footer-note">
                  <CheckCircle2 size={12} color="#16a34a" />
                  <span>Free Consultation • Chandigarh HQ</span>
                </div>
              </div>
            </div>

            {/* Right: Magazine / Annual Investor Guide Banner Card */}
            <div className="fa-promo-mag-col">
              <Link href="/blogs" className="fa-mag-card" title="Read The Franchise Roots Magazine 2026 Annual Edition">
                <div className="fa-mag-img-wrap">
                  <img
                    src="/franchise_mag_cover.jpg"
                    alt="The Franchise Roots Magazine 2026 Annual Edition — 150+ High ROI Brands"
                    className="fa-mag-img"
                  />
                  <div className="fa-mag-overlay-badge">
                    <BookOpen size={11} /> 2026 Edition
                  </div>
                </div>
                <div className="fa-mag-caption">
                  <span className="fa-mag-title">Annual Investor Guide</span>
                  <span className="fa-mag-action">
                    Explore Guide <ChevronRight size={12} />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
