import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import ImageRotator, { getImageSources } from "./ImageRotator";

const DISCLOSED = "Not disclosed";

function normalizeCurrency(value) {
  return String(value).replace(/(?:Ã¢â€šÂ¹|â‚¹)/g, "₹");
}

function cleanText(value) {
  return String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function formatInvestmentLegacy(value) {
  return formatInvestmentFixed(value);
  if (value === undefined || value === null || value === "") return DISCLOSED;
  if (typeof value === "string") return normalizeCurrency(value.trim()) || DISCLOSED;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} Lakhs`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function formatInvestment(value) {
  if (value === undefined || value === null || value === "") return DISCLOSED;
  const rupee = "\u20B9";
  if (typeof value === "string") {
    return value.trim().replace(/(?:ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹|Ã¢â€šÂ¹|â‚¹)/g, rupee) || DISCLOSED;
  }
  if (value >= 10000000) return `${rupee}${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `${rupee}${(value / 100000).toFixed(1)} Lakhs`;
  return `${rupee}${Number(value).toLocaleString("en-IN")}`;
}

function formatSpace(value) {
  if (value === undefined || value === null || value === "") return DISCLOSED;
  if (typeof value === "number") return `${value.toLocaleString("en-IN")} sq. ft.`;
  const text = String(value).trim();
  if (!text) return DISCLOSED;
  return /^\d+(?:\.\d+)?$/.test(text) ? `${Number(text).toLocaleString("en-IN")} sq. ft.` : text;
}

function formatRoyalty(value) {
  if (value === undefined || value === null || value === "") return DISCLOSED;
  if (typeof value === "number") return `${value}%`;
  const text = String(value).trim();
  if (!text) return DISCLOSED;
  return /^\d+(?:\.\d+)?$/.test(text) ? `${text}%` : text;
}

function Stat({ label, value, tone }) {
  const isDisclosure = value === DISCLOSED;
  return (
    <div className={`public-brand-stat public-brand-stat--${tone}`}>
      <small>{label}</small>
      <strong className={isDisclosure ? "is-disclosed" : undefined}>{value}</strong>
    </div>
  );
}

export default function BrandCard({ brand, topPick = false, onEnquire, compact = false }) {
  const id = brand.id || brand._id;
  const name = brand.name || brand.brandName || "Franchise opportunity";
  const description = cleanText(brand.description) || "Verified franchise opportunity listed on Franchise Roots.";
  const minInvestment = formatInvestment(brand.investment_range || brand.minInvestment);
  const imageSources = getImageSources(brand);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "FR";
  const isVerified = brand.verified === true || brand.isVerified === true || brand.is_verified === true;

  const handleEnquire = () => {
    if (onEnquire) {
      onEnquire(brand);
      return;
    }
    if (typeof window !== "undefined") {
      const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "919815489999";
      const cleanPhone = adminPhone.replace(/[^0-9]/g, "");
      const message = `Hi Franchise Roots, I want to enquire about ${name} (${brand.category || "Franchise"}). Please share brochure and details.`;
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className={`public-brand-card${compact ? " public-brand-card--compact" : ""}`}>
      <div className="public-brand-media">
        <div className="public-brand-logo-box">
          {imageSources.length > 0 ? (
            <ImageRotator sources={imageSources} alt={`${name} logo`} className="public-brand-logo" />
          ) : (
            <span className="public-brand-initials" aria-label={`${name} initials`}>{initials}</span>
          )}
        </div>
        {brand.category && <span className="public-brand-chip-category" title={brand.category}>{brand.category}</span>}
        {topPick && <span className="public-card-badge">★ TOP PICK</span>}
      </div>

      <div className="public-brand-body">
        <h3 title={name}>{name}</h3>
        <p>{description}</p>

        <div className="public-brand-stats" aria-label={`${name} investment details`}>
          <Stat label="MIN INVESTMENT" value={minInvestment} tone="investment" />
          <Stat label="SPACE NEEDED" value={formatSpace(brand.areaRequired)} tone="space" />
          <Stat label="EST. PAYBACK (ROI)" value={brand.roi || brand.paybackPeriod || DISCLOSED} tone="roi" />
          <Stat label="ROYALTY FEE" value={formatRoyalty(brand.royaltyFee)} tone="royalty" />
        </div>

        <div className="public-brand-meta">
          <span>HQ: {brand.hq || brand.location || DISCLOSED}</span>
          {isVerified && <span><CheckCircle2 size={14} aria-hidden="true" /> Verified</span>}
        </div>

        <div className="public-brand-actions">
          <Link href={id ? `/brands/${id}` : "/brands"}>
            <span>Know More</span><ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button type="button" onClick={handleEnquire}>Enquire</button>
        </div>
      </div>
    </article>
  );
}
