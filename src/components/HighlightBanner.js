"use client";

import Link from "next/link";
import { Headphones, Megaphone, Star, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApprovedBrands } from "@/lib/brandsCache";
import { filterHomepageAdvertisements } from "@/lib/advertisementVisibility";

const ADMIN_WHATSAPP = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999").replace(/[^0-9]/g, "");
const PUBLIC_ADS_CACHE_KEY = "franchise_roots_public_ads_v1";

function HighlightChip({ item }) {
  const content = (
    <>
      {item.image && item.mediaType !== "video" ? (
        <span className="highlight-chip-ad-thumb" aria-hidden="true" style={{ width: "42px", height: "42px", flexShrink: 0, overflow: "hidden", borderRadius: "11px", display: "grid", placeItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </span>
      ) : (
        <span className={`highlight-chip-icon highlight-chip-icon--${item.tone}`} aria-hidden="true">
          <item.icon size={17} />
        </span>
      )}
      <span className="highlight-chip-copy">
        <strong>{item.value}</strong>
        <span>{item.label}</span>
      </span>
    </>
  );

  return item.href ? (
    /^https?:\/\//i.test(item.href) ? (
      <a href={item.href} className="highlight-chip" target="_blank" rel="noopener noreferrer">{content}</a>
    ) : (
      <Link href={item.href} className="highlight-chip">{content}</Link>
    )
  ) : (
    <span className="highlight-chip">{content}</span>
  );
}

export default function HighlightBanner() {
  const { brands } = useApprovedBrands();
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(30);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    try {
      const cachedAds = JSON.parse(sessionStorage.getItem(PUBLIC_ADS_CACHE_KEY) || "null");
      if (Array.isArray(cachedAds)) setAds(cachedAds);
    } catch (error) {
      // Ignore unavailable or invalid browser storage.
    }

    const controller = new AbortController();
    fetch("/api/advertisements?public=true&limit=50", { signal: controller.signal, cache: "force-cache" })
      .then((response) => (response.ok ? response.json() : []))
      .then((payload) => {
        const records = Array.isArray(payload) ? payload : payload?.data || [];
        const nextAds = filterHomepageAdvertisements(records);
        setAds(nextAds);
        try { sessionStorage.setItem(PUBLIC_ADS_CACHE_KEY, JSON.stringify(nextAds)); } catch (error) { /* storage is optional */ }
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Error loading header highlights:", error);
      });
    return () => controller.abort();
  }, []);

  const whatsappHref = ADMIN_WHATSAPP
    ? `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP}&text=${encodeURIComponent("Hi Franchise Roots, I need a free consultation.")}`
    : null;

  const items = useMemo(() => {
    const nextItems = [];
    if (brands.length > 0) {
      nextItems.push({
        id: "opportunities",
        value: `${brands.length}+`,
        label: "verified brands",
        tone: "green",
        icon: TrendingUp,
        href: "/brands"
      });
    }
    if (whatsappHref) {
      nextItems.push({
        id: "support",
        value: "Direct",
        label: "expert support",
        tone: "purple",
        icon: Headphones,
        href: whatsappHref
      });
    }
    ads.slice(0, 6).forEach((ad) => {
      nextItems.push({
        id: `ad-${ad.id || ad.title}`,
        value: "Sponsored",
        label: ad.title,
        tone: "orange",
        icon: Megaphone,
        image: ad.image,
        mediaType: ad.mediaType,
        href: ad.link || "/brands"
      });
    });
    return nextItems;
  }, [ads, brands.length, whatsappHref]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length < 2) return undefined;
    const measure = () => {
      const loopWidth = track.scrollWidth / 2;
      setDuration(Math.max(24, Math.round(loopWidth / 60)));
    };
    measure();
    return undefined;
  }, [items.length]);

  const repeatedItems = items.length >= 2;

  return (
    <section className="highlight-banner" aria-label="Franchise Roots highlights" style={{ position: "relative", zIndex: 10 }}>
      <div className="highlight-banner-brand">
        <span className="highlight-brand-star" aria-hidden="true"><Star size={17} fill="currentColor" /></span>
        <span className="highlight-brand-title">India&apos;s No.1 Franchise Marketplace</span>
      </div>

      <div className={`highlight-marquee${repeatedItems ? " is-animated" : ""}`}>
        <div
          ref={trackRef}
          className="highlight-marquee-track"
          style={{ "--highlight-duration": `${duration}s` }}
        >
          <div className="highlight-marquee-copy">
            {items.map((item) => <HighlightChip key={item.id} item={item} />)}
          </div>
          {repeatedItems && (
            <div className="highlight-marquee-copy" aria-hidden="true">
              {items.map((item) => <HighlightChip key={`copy-${item.id}`} item={item} />)}
            </div>
          )}
        </div>
      </div>

      <Link href="/brand-registration" className="highlight-list-brand">
        List Your Brand <span aria-hidden="true">→</span>
      </Link>
      <span className="highlight-progress" aria-hidden="true" />
    </section>
  );
}
