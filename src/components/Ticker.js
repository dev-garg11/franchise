"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApprovedBrands } from "@/lib/brandsCache";

const ADMIN_WHATSAPP = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999").replace(/[^0-9]/g, "");

export default function Ticker({ ads = [] }) {
  const { brands } = useApprovedBrands();
  const trackRef = useRef(null);
  const [duration, setDuration] = useState(36);

  const items = useMemo(() => {
    const nextItems = [];
    if (brands.length > 0) {
      nextItems.push({ id: "brands", text: `${brands.length}+ verified brands`, href: "/brands" });
    }
    if (ADMIN_WHATSAPP) {
      nextItems.push({
        id: "consultation",
        text: "Free expert consultation",
        href: `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP}&text=${encodeURIComponent("Hi Franchise Roots, I need a free consultation.")}`
      });
    }
    ads.filter((ad) => ad?.title).forEach((ad) => {
      nextItems.push({ id: `ad-${ad.id || ad.title}`, text: ad.title, href: ad.link || "/brands" });
    });
    return nextItems;
  }, [ads, brands.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length < 2) return undefined;
    const measure = () => {
      const loopWidth = track.scrollWidth / 2;
      setDuration(Math.max(24, Math.round(loopWidth / 60)));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  if (items.length < 2) return null;

  const renderItems = (copy) => (
    <div className="fr-ticker-copy" aria-hidden={copy}>
      {items.map((item, index) => (
        <span className="fr-ticker-item" key={`${copy ? "copy" : "main"}-${item.id}-${index}`}>
          {item.href ? <Link href={item.href}>{item.text}</Link> : item.text}
          <span className="fr-ticker-star" aria-hidden="true">★</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="fr-ticker" aria-label="Latest announcements">
      <div className="fr-ticker-live"><span aria-hidden="true" />LIVE</div>
      <div
        ref={trackRef}
        className="fr-ticker-viewport"
        style={{ "--ticker-duration": `${duration}s` }}
        tabIndex={0}
      >
        <div className="fr-ticker-track">
          {renderItems(false)}
          {renderItems(true)}
        </div>
      </div>
    </section>
  );
}
