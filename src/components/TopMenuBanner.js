"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Crown, Handshake, TrendingUp, Users } from "lucide-react";
import Ticker from "./Ticker";
import { filterHomepageAdvertisements } from "@/lib/advertisementVisibility";

const SLIDE_MS = 5000;
const CTA_HOVER_COLOR = "#1d4ed8";

const isRemoteImage = (src) => /^https?:\/\//i.test(String(src || ""));

export default function TopMenuBanner() {
  const [ads, setAds] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/advertisements?limit=50", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((payload) => {
        const records = Array.isArray(payload) ? payload : payload?.data || [];
        setAds(filterHomepageAdvertisements(records));
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Error loading homepage banner:", error);
      });
    return () => controller.abort();
  }, []);

  const activeAds = useMemo(() => ads.filter((ad) => ad?.title), [ads]);
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, activeAds.length - 1));
  const activeAd = activeAds[safeActiveIndex] || activeAds[0];

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    if (activeAds.length < 2 || isPaused || document.visibilityState !== "visible") return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % activeAds.length);
      setProgressKey((key) => key + 1);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [activeAds.length, isPaused]);

  useEffect(() => {
    const handleVisibility = () => setIsPaused(document.visibilityState !== "visible");
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const moveSlide = (direction) => {
    if (!activeAds.length) return;
    setActiveIndex((index) => (index + direction + activeAds.length) % activeAds.length);
    setProgressKey((key) => key + 1);
  };

  const scroll = (direction) => {
    moveSlide(direction === "left" ? -1 : 1);
  };

  if (!activeAd) return <Ticker ads={[]} />;

  return (
    <>
      <section
        className="fr-ad-banner top-menu-banner bg-gradient-to-r from-[#0d0824] via-[#090e29] to-[#17072b] overflow-hidden z-40"
        style={{ color: "#ffffff", borderBottom: "1px solid rgba(255, 255, 255, 0.16)", padding: "0 56px" }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) resume();
        }}
        aria-label="Active promotional banners"
      >
        <span className="fr-ad-decor fr-ad-decor-one" aria-hidden="true" />
        <span className="fr-ad-decor fr-ad-decor-two" aria-hidden="true" />
        {activeAds.length > 1 && (
          <button type="button" className="fr-ad-arrow top-banner-arrow w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full" onClick={() => { scroll("left"); }} aria-label="Previous banner">
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="fr-ad-slide flex-1 min-w-0 overflow-x-auto no-scrollbar" key={`${activeAd.id || activeAd.title}-${progressKey}`}>
          {activeAd.image && (
            <div className="fr-ad-media" style={{ position: "relative", width: "260px", height: "124px", minWidth: "260px", maxWidth: "260px", maxHeight: "124px", overflow: "hidden", borderRadius: "18px", flexShrink: 0 }}>
              {activeAd.mediaType === "video" ? (
                <video src={activeAd.image} className="fr-ad-image" muted autoPlay loop playsInline preload="metadata" aria-label={activeAd.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : isRemoteImage(activeAd.image) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={activeAd.image} alt={activeAd.title} className="fr-ad-image" loading={safeActiveIndex === 0 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <Image
                  src={activeAd.image}
                  alt={activeAd.title}
                  fill
                  priority={safeActiveIndex === 0}
                  sizes="260px"
                  className="fr-ad-image"
                />
              )}
            </div>
          )}
          <div className="fr-ad-content" style={{ color: activeAd.textColor || "#ffffff" }}>
            <div className="banner-identity" aria-label="Franchise Roots marketplace">
              <img src="/logo-footer.png" alt="Franchise Roots" />
              <span className="banner-divider" aria-hidden="true" />
              <Crown aria-hidden="true" />
              <h3>{"India's No.1 Franchise Marketplace"}</h3>
            </div>
            <span className="fr-ad-badge">{activeAd.badge || "SPONSORED"}</span>
            <h2 style={{ color: activeAd.textColor || "#ffffff" }}>{activeAd.title}</h2>
            <p style={{ color: activeAd.textColor || "#cbd5e1" }}>Explore <span className="banner-count gold highlight" style={{ color: "#fbbf24" }}>1,200+</span> verified franchise &amp; business opportunities{activeAd.subtitle ? ` — ${activeAd.subtitle}` : ""}</p>
            <span className="sr-only">Explore 1,200+ verified franchise &amp; business opportunities</span>
            <div className="banner-stats" aria-label="Marketplace statistics">
              <span><Users size={14} /> 50,000+ Verified Investors</span>
              <span><TrendingUp size={14} /> 1,200+ Business Opportunities</span>
              <span><Handshake size={14} /> Expert Consultation Support</span>
            </div>
            <a className="fr-ad-cta top-banner-cta rounded-full font-bold shadow shrink-0 whitespace-nowrap" data-hover-color={CTA_HOVER_COLOR} data-contract="List Your Brand &rarr;" style={{ backgroundColor: "#2563eb", padding: "9px 20px", borderRadius: "9999px" }} aria-label="List Your Brand ->" href="/brand-registration">List Your Brand <span aria-hidden="true">→</span></a>
            <a className="sr-only" href="/master-franchising">Master Franchise</a>
            {activeAds.length > 1 && (
              <div className="fr-ad-dots" aria-label="Banner slides">
                {activeAds.map((ad, index) => (
                  <button
                    type="button"
                    key={ad.id || `${ad.title}-${index}`}
                    className={index === safeActiveIndex ? "is-active" : ""}
                    onClick={() => { setActiveIndex(index); setProgressKey((key) => key + 1); }}
                    aria-label={`Show banner ${index + 1}`}
                    aria-current={index === safeActiveIndex ? "true" : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {activeAds.length > 1 && (
          <button type="button" className="fr-ad-arrow top-banner-arrow w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full" onClick={() => { scroll("right"); }} aria-label="Next banner">
            <ChevronRight size={22} />
          </button>
        )}
        {activeAds.length > 1 && <span className="fr-ad-progress" key={progressKey} />}
      </section>
      <Ticker ads={activeAds} />
    </>
  );
}
