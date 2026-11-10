import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import ImageRotator, { getImageSources } from "./ImageRotator";

export default function AdCard({ ad, featured = false, large = featured }) {
  if (!ad) return null;
  const badge = String(ad.badge || "SPONSORED").toUpperCase();
  const mediaType = ad.mediaType === "video" ? "video" : "image";
  const textColor = /^#[0-9a-f]{6}$/i.test(String(ad.textColor || "")) ? ad.textColor : "#ffffff";
  return (
    <Link href={ad.link || "/contact"} className={`public-ad-card${featured ? " public-ad-card--featured" : ""}${large ? " public-ad-card--large" : ""}`}>
      {mediaType === "video" ? (
        <video src={ad.image} className="public-ad-image" muted autoPlay loop playsInline preload="metadata" aria-label={ad.title || "Sponsored video advertisement"} />
      ) : (
        <ImageRotator
          sources={getImageSources(ad)}
          alt={ad.title || "Sponsored Franchise Roots placement"}
          className="public-ad-image"
        />
      )}
      <span className="public-ad-overlay" aria-hidden="true" />
      <div className="public-ad-top-bar">
        <span className={`public-ad-badge${featured ? " public-ad-badge--featured" : ""}`}>{badge}</span>
        {mediaType === "video" && (
          <span className="public-ad-video-badge">
            <Play size={10} fill="currentColor" /> VIDEO
          </span>
        )}
      </div>
      <span className="public-ad-content" style={{ color: textColor, "--public-ad-text-color": textColor }}>
        <strong style={{ color: textColor }}>{ad.title}</strong>
        {ad.subtitle && <span style={{ color: textColor }}>{ad.subtitle}</span>}
        <span className="public-ad-link">Learn More <ArrowRight size={15} /></span>
      </span>
    </Link>
  );
}
