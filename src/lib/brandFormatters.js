/**
 * Utilities for cleaning, decoding and formatting Brand content.
 * Resolves FCKeditor entity issues, raw HTML formatting, empty clamped lines, and commercial specifications.
 */

// Comprehensive HTML entity decoder
export function decodeHtmlEntities(str) {
  if (!str) return "";
  return String(str)
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&hellip;/gi, "…")
    .replace(/&bull;/gi, "•")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

/**
 * Strips HTML, handles FCKeditor/WYSIWYG quirks, empty paragraphs, entities,
 * and extracts a clean, readable plain-text snippet for cards and listings.
 */
export function cleanBrandPlainText(html, fallbackBrand = {}, maxLength = null) {
  if (!html || typeof html !== "string") {
    return generateFallbackDescription(fallbackBrand);
  }

  let text = html;

  // 1. If double escaped HTML (e.g. &lt;p&gt; or &lt;div&gt;)
  if (/&lt;[a-z/]/i.test(text)) {
    text = decodeHtmlEntities(text);
  }

  // 2. Strip scripts and styles
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Convert line breaks and paragraph ends to spaces
  text = text.replace(/<\/(p|div|section|h[1-6]|li|tr)>/gi, " ");
  text = text.replace(/<(br|hr)\s*\/?>/gi, " ");

  // 4. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // 5. Decode all HTML entities
  text = decodeHtmlEntities(text);

  // 6. Clean markdown artifacts (e.g. **bold**, ## headers)
  text = text.replace(/[*_#`~]+/g, "");

  // 7. Remove technical AI or FCK prefixes like "Executive Brand Overview:"
  text = text.replace(/^\s*(?:executive\s+brand\s+overview|brand\s+overview|about\s+the\s+brand)\s*:\s*/i, "");

  // 8. Collapse whitespace and trim
  text = text.replace(/\s+/g, " ").trim();

  // 9. If empty or too short after stripping (e.g. only had empty <p>&nbsp;</p>)
  if (!text || text.length < 15) {
    return generateFallbackDescription(fallbackBrand);
  }

  // 10. Optional max length truncation without breaking words
  if (maxLength && text.length > maxLength) {
    const cut = text.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > 50 ? cut.slice(0, lastSpace) : cut) + "...";
  }

  return text;
}

function generateFallbackDescription(brand = {}) {
  const name = decodeHtmlEntities(brand.name) || "This brand";
  const cat = decodeHtmlEntities(brand.category) || "business";
  return `${name} is an established opportunity in the ${cat} sector, offering high returns, comprehensive operational training, and turnkey setup assistance across India.`;
}

/**
 * Format currency in Indian Lakhs / Crores
 */
export function formatLakhs(val) {
  if (!val && val !== 0) return "N/A";
  const rupee = "\u20B9";
  if (typeof val === "string" && /lakh|cr|rs\.?/i.test(val)) {
    return decodeHtmlEntities(val).replace(/(?:ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹|Ã¢â€šÂ¹|â‚¹)/g, rupee);
  }
  const num = Number(val);
  if (isNaN(num)) return decodeHtmlEntities(String(val));
  if (num >= 10000000) return `${rupee} ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${rupee} ${(num / 100000).toFixed(1)} Lakhs`;
  return `${rupee} ${num.toLocaleString("en-IN")}`;
}

/**
 * Sanitizes rich HTML from FCKeditor / DB for safe, beautiful presentation in brand details.
 * Removes double-encoding, harmful scripts, and excessive empty tags while preserving valid formatting.
 */
export function sanitizeBrandHtml(rawHtml, brand = {}) {
  if (!rawHtml || typeof rawHtml !== "string") {
    return `<p>${generateFallbackDescription(brand)}</p>`;
  }

  let html = rawHtml;

  // Decode if double-encoded
  if (/&lt;[a-z/]/i.test(html)) {
    html = decodeHtmlEntities(html);
  }

  // Strip dangerous tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  html = html.replace(/javascript:/gi, "");
  html = html.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Clean empty paragraphs like <p>&nbsp;</p> or <p></p>
  html = html.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, "");

  return html.trim() || `<p>${generateFallbackDescription(brand)}</p>`;
}

/**
 * Extracts and synthesizes comprehensive Commercial Specifications & Investment Breakdown
 * from brand records and embedded descriptions.
 */
export function extractCommercialSpecs(brand = {}) {
  const minInv = brand.minInvestment || 0;
  const maxInv = brand.maxInvestment || minInv || 0;
  const medianInv = (minInv && maxInv) ? Math.round((minInv + maxInv) / 2) : (minInv || maxInv || 1500000);

  // Franchise fee
  let franchiseFee = brand.franchiseFee;
  if (!franchiseFee && minInv) {
    franchiseFee = Math.round(minInv * 0.2); // estimated 20%
  }

  // Royalty fee
  let royalty = brand.royaltyFee || "0% (Zero Royalty)";
  if (royalty === "0" || royalty === "0%") royalty = "0% (Zero Royalty)";

  // Area required
  let area = brand.areaRequired || "200 - 500 Sq. Ft.";

  // Headquarters
  let hq = decodeHtmlEntities(brand.hq || brand.location || "India");

  // Tenure & Payback
  let tenure = brand.tenure || "3 to 5 Years (Renewable)";
  let payback = brand.paybackPeriod || brand.roi || "12 - 18 Months";

  // Master franchise
  let masterAvailable = Boolean(brand.masterFranchiseAvailable);
  let masterRange = brand.masterInvestmentRange || "Rs. 25 Lakhs - 50 Lakhs";
  let territory = brand.territoryOffered || (masterAvailable ? "State Level Exclusivity" : "Single Unit Protected Territory");

  // Determine Capital Tier
  let capitalTier = "Standard Concept";
  if (maxInv >= 10000000) capitalTier = "Enterprise / Premium Tier";
  else if (maxInv >= 3000000) capitalTier = "High-Growth Tier";
  else if (minInv < 500000) capitalTier = "Micro / Low Capital";
  else capitalTier = "Mid-Range Opportunity";

  // Estimated Allocation Breakdown (Visual)
  const breakdown = [
    {
      label: "Interior & Fit-out",
      pct: 40,
      amount: Math.round(medianInv * 0.40),
      desc: "Store construction, branding, fixtures, flooring & aesthetic setup",
      color: "#2563eb",
      bgColor: "#eff6ff"
    },
    {
      label: "Equipment, Tech & POS",
      pct: 25,
      amount: Math.round(medianInv * 0.25),
      desc: "Commercial machinery, POS billing software & hardware modules",
      color: "#7c3aed",
      bgColor: "#f5f3ff"
    },
    {
      label: "Opening Stock & Inventory",
      pct: 15,
      amount: Math.round(medianInv * 0.15),
      desc: "Initial fast-moving stock, raw material supplies & display goods",
      color: "#0891b2",
      bgColor: "#ecfeff"
    },
    {
      label: "Franchise Brand Fee",
      pct: 12,
      amount: Math.round(medianInv * 0.12),
      desc: "Trademark license, corporate onboarding & initial brand rights",
      color: "#16a34a",
      bgColor: "#f0fdf4"
    },
    {
      label: "Working Capital Reserve",
      pct: 8,
      amount: Math.round(medianInv * 0.08),
      desc: "Initial operational cash buffer, utility deposits & launch marketing",
      color: "#f59e0b",
      bgColor: "#fffbeb"
    }
  ];

  return {
    brandName: decodeHtmlEntities(brand.name || "Brand"),
    company: decodeHtmlEntities(brand.company || brand.name || ""),
    category: decodeHtmlEntities(brand.category || "General"),
    minInvestment: minInv,
    maxInvestment: maxInv,
    medianInvestment: medianInv,
    minInvFormatted: formatLakhs(minInv),
    maxInvFormatted: formatLakhs(maxInv),
    invRangeFormatted: minInv ? `${formatLakhs(minInv)} - ${formatLakhs(maxInv)}` : (brand.investment_range || "Contact For Details"),
    franchiseFee: franchiseFee ? formatLakhs(franchiseFee) : "Included in Setup",
    royaltyFee: royalty,
    areaRequired: area,
    hq,
    territory,
    tenure,
    paybackPeriod: payback,
    masterAvailable,
    masterRange,
    capitalTier,
    trainingSupport: brand.trainingSupport === "No" ? "Standard SOPs Provided" : "Comprehensive Corporate Training & Onsite Support",
    breakdown
  };
}
