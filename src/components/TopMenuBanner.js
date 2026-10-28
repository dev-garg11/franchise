"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronRight, MessageCircle, Phone } from "lucide-react";

export default function TopMenuBanner() {
  return (
    <div className="fa-banner-wrapper">
      <div className="fa-top-promo-bar">
        <div className="fa-container">
          <div className="fa-promo-grid">
            <div className="fa-promo-main-col">
              <div className="fa-banner-marquee-window" aria-label="Franchise Roots promotional banners">
                <div className="fa-banner-marquee-track">
                  <Link href="/brands" className="fa-banner-slide" title="Explore Franchise & Business Expo 2026">
                    <img src="/franchise_expo_banner.jpg" alt="Franchise & Business Expo 2026" className="fa-expo-banner-img" />
                  </Link>
                  <Link href="/blogs" className="fa-banner-slide fa-banner-slide-guide" title="Explore the Annual Investor Guide">
                    <img src="/franchise_mag_cover.jpg" alt="Franchise Roots Annual Investor Guide" className="fa-expo-banner-img" />
                    <span className="fa-banner-slide-copy"><strong>Annual Investor Guide</strong><small>Explore high-growth franchise opportunities</small></span>
                  </Link>
                  <Link href="/brand-registration" className="fa-banner-slide fa-banner-slide-expand" title="Expand your brand with Franchise Roots">
                    <img src="/logo-footer.png" alt="Franchise Roots" className="fa-banner-brand-logo" />
                    <span className="fa-banner-slide-copy"><strong>Expand Your Brand</strong><small>Connect with verified investors across India</small></span>
                  </Link>
                  <Link href="/brands" className="fa-banner-slide" title="Explore Franchise & Business Expo 2026" aria-hidden="true">
                    <img src="/franchise_expo_banner.jpg" alt="" className="fa-expo-banner-img" />
                  </Link>
                  <Link href="/blogs" className="fa-banner-slide fa-banner-slide-guide" title="Explore the Annual Investor Guide" aria-hidden="true">
                    <img src="/franchise_mag_cover.jpg" alt="" className="fa-expo-banner-img" />
                  </Link>
                  <Link href="/brand-registration" className="fa-banner-slide fa-banner-slide-expand" title="Expand your brand with Franchise Roots" aria-hidden="true">
                    <img src="/logo-footer.png" alt="" className="fa-banner-brand-logo" />
                  </Link>
                </div>
              </div>
              <h2 className="fa-promo-headline">
                Explore <span className="fa-highlight-gold">1,200+ Verified Franchise &amp; Business</span> Opportunities
              </h2>
            </div>

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
                  <a href="https://wa.me/919815489999?text=Hello%20Franchise%20Roots%2C%20I%20want%20to%20explore%20franchise%20opportunities" target="_blank" rel="noopener noreferrer" className="fa-whatsapp-btn" title="Chat on WhatsApp">
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

            <div className="fa-promo-mag-col">
              <Link href="/blogs" className="fa-mag-card" title="Read The Franchise Roots Magazine 2026 Annual Edition">
                <div className="fa-mag-img-wrap">
                  <img src="/franchise_mag_cover.jpg" alt="The Franchise Roots Magazine 2026 Annual Edition" className="fa-mag-img" />
                  <div className="fa-mag-overlay-badge"><BookOpen size={11} /> 2026 Edition</div>
                </div>
                <div className="fa-mag-caption">
                  <span className="fa-mag-title">Annual Investor Guide</span>
                  <span className="fa-mag-action">Explore Guide <ChevronRight size={12} /></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
