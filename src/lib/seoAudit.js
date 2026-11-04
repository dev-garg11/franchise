// One scoring source for the admin list, inspect modal and persisted SEO data.
// This is intentionally deterministic; it never upgrades a score just because data exists.
export function auditSeoData(seo = {}, faqs = []) {
  const title = String(seo.seoTitle || "");
  const description = String(seo.metaDescription || "");
  const keyword = String(seo.focusKeyword || "").trim();
  const kw = keyword.toLowerCase();
  const content = String(seo.pillarContent || "");
  const plain = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(/\s+/) : [];
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mentions = kw ? (plain.match(new RegExp(`\\b${escaped}\\b`, "gi")) || []).length : 0;
  const density = words.length ? Number(((mentions / words.length) * 100).toFixed(2)) : 0;
  const slugKeyword = kw.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const canonical = String(seo.canonicalUrl || "").toLowerCase();
  const headings = content.match(/<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi) || [];
  const images = content.match(/<img\b[^>]*>/gi) || [];

  const checks = {
    focusKeywordInTitle: !!kw && title.toLowerCase().includes(kw),
    focusKeywordInDesc: !!kw && description.toLowerCase().includes(kw),
    focusKeywordInUrl: !!slugKeyword && canonical.includes(slugKeyword),
    focusKeywordAtStartContent: !!kw && plain.slice(0, 180).toLowerCase().includes(kw),
    focusKeywordInContent: mentions > 0,
    contentLengthValid: words.length >= 600,
    focusKeywordInSubheadings: !!kw && headings.some((h) => h.toLowerCase().includes(kw)),
    hasImageAltWithKeyword: images.some((img) => /alt\s*=\s*["'][^"']*["']/i.test(img) && img.toLowerCase().includes(kw)),
    keywordDensityValid: density >= 0.8 && density <= 2.5,
    hasShortUrl: !!canonical && canonical.length < 120,
    hasExternalLinks: /href=["']https?:\/\/(?!www\.franchiseroots\.com)[^"']+["']/i.test(content),
    hasInternalLinks: /href=["'](\/|https?:\/\/www\.franchiseroots\.com)[^"']+["']/i.test(content),
    hasDoFollowLinks: /rel=["'][^"']*dofollow[^"']*["']/i.test(content) || (!/rel=["'][^"']*nofollow[^"']*["']/i.test(content) && /href=["']https?:\/\//i.test(content)),
    hasSetFocusKeyword: kw.length > 2,
    titleKwNearStart: !!kw && title.toLowerCase().indexOf(kw) < 25,
    titleHasSentiment: /(profit|opportunity|growth|best|top|high|success|lucrative|proven)/i.test(title),
    titleHasPowerWord: /(complete|guide|roi|exclusive|cost|details|turnkey|franchise)/i.test(title),
    titleHasNumber: /\d{4}/.test(title),
    hasTableOfContents: (Array.isArray(seo.toc) && seo.toc.length >= 3) || content.includes('id="toc"'),
    hasShortParagraphs: !/<p[^>]*>[^<]{700,}<\/p>/i.test(content),
    hasImagesOrVisuals: images.length > 0 || content.includes("<svg"),
    hasFaqs: Array.isArray(faqs) && faqs.length >= 3
  };
  const passCount = Object.values(checks).filter(Boolean).length;
  return { checks, passCount, totalCount: Object.keys(checks).length, score: Math.round((passCount / Object.keys(checks).length) * 100), wordCount: words.length, kwMentions: mentions, density };
}

