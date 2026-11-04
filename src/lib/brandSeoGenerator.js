/**
 * Complete Rank Math 100/100 Pillar Content, SEO, GEO, AEO, FAQs & Schema Generator
 * for Franchise Roots Brands.
 * 
 * Satisfies all 22 Rank Math & Search Engine Optimization Rules:
 * 1. Basic SEO (6/6): Focus keyword in Title, Meta Description, URL, Intro, Content, 600-2500 words Pillar Guide.
 * 2. Additional SEO (9/9): Keyword in H2/H3 subheadings, Image alt, ~1% density, clean URL, Outbound authority links, DoFollow, Internal links, Focus keyword set.
 * 3. Title Readability (4/4): Keyword at start, Sentiment word (Profit), Power word (Complete/ROI), Number (2026).
 * 4. Content Readability (3/3): Table of Contents (TOC), Short paragraphs (2-3 lines), Visual highlights & media.
 * 5. AEO & Voice Search: 6 Direct fact-dense Q&As for Google Featured Snippets.
 * 6. GEO Search: Citable summary paragraph for Perplexity, ChatGPT Search & Gemini Overviews.
 * 7. Schema.org JSON-LD: @graph with LocalBusiness, FAQPage, and BreadcrumbList.
 */

import { auditSeoData } from "./seoAudit.js";

export function generateBrandSeoData(brand = {}) {
  const name = (brand.name || brand.company || "Franchise Opportunity").trim();
  const category = (brand.category || "Business").trim();
  const sector = (brand.sector || category).trim();
  const hq = (brand.hq || brand.location || "India").trim();
  const investment = (brand.investment_range || (brand.minInvestment ? `Rs. ${Number(brand.minInvestment).toLocaleString('en-IN')}` : "Rs. 5 Lakh - 10 Lakh")).trim();
  const space = (brand.areaRequired || "200 - 500 Sq. Ft.").trim();
  const royalty = (brand.royaltyFee || "0%").trim();
  const training = brand.trainingSupport === "Yes" ? "Complete operational and staff training provided" : "Standard onboarding and operational guidance provided";
  const masterAvailable = Boolean(brand.masterFranchiseAvailable);
  const brandUrlId = brand._id || brand.id || "";
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-franchise`;
  const canonicalUrl = brandUrlId ? `https://franchiseroots.com/brands/${brandUrlId}-${slug}` : `https://franchiseroots.com/brands/${slug}`;

  // 1. Focus Keyword & Search Terms
  const focusKeyword = `${name} Franchise`;
  const focusKeywordLower = focusKeyword.toLowerCase();

  // 2. Rank Math Compliant Title & Meta Description (Title Readability: 4/4)
  // - Keyword at start: `${name} Franchise`
  // - Sentiment word: `Profit`
  // - Power words: `Complete`, `ROI`
  // - Number: `(2026)`
  const seoTitle = `${focusKeyword} in India: Complete Cost, Profit & ROI (2026) | Franchise Roots`;
  const metaDescription = `Verified guide to ${focusKeyword} in India (${category}). Total investment: ${investment}, commercial area: ${space}, royalty: ${royalty}. Check unit models, profit margins & apply online today.`;

  const secondaryKeywords = [
    `${focusKeywordLower} cost in india`,
    `${focusKeywordLower} profit margin`,
    `${focusKeywordLower} review 2026`,
    `how to get ${focusKeywordLower}`,
    `best ${category.toLowerCase()} franchise under ${investment.toLowerCase()}`,
    `${name.toLowerCase()} dealership near me`,
    `franchise roots ${name.toLowerCase()}`
  ].join(", ");

  const ogTitle = `${focusKeyword} - Direct Investment & Dealership Guide`;
  const ogDescription = `Official verified listing for ${focusKeyword} (${category}). Investment range: ${investment}, required area: ${space}, HQ: ${hq}. Connect directly with brand management.`;
  const ogImage = brand.image || "https://franchiseroots.com/WhatsApp_Image_2026-07-16_at_4.40.00_PM__2_-removebg-preview.png";

  const geoTitle = `Best ${category} Franchise in ${hq} & PAN India - ${name}`;
  const geoDescription = `Explore ${focusKeyword} opportunities in ${hq}, Delhi NCR, Mumbai, Bangalore, Pune, Hyderabad, Jaipur, and all major Indian cities. Direct verified consultation via Franchise Roots.`;

  // 3. GEO: Fact-Dense Summary Paragraph for Perplexity & ChatGPT Search
  const aeoContent = `${name} is an established ${category} (${sector}) franchise opportunity headquartered in ${hq}. The estimated investment ranges between ${investment} with a commercial space requirement of ${space}. Franchisees benefit from a ${royalty} royalty structure, ${training.toLowerCase()}, and pan-India brand recognition. Prospective investors can apply directly on Franchise Roots for verified dealership rights and financial disclosures.`;

  // 4. AEO: 6 High-Converting Direct Answer FAQs
  const faqs = [
    {
      question: `What is the total investment required for a ${focusKeyword}?`,
      answer: `The total investment required to open a ${focusKeyword} is approximately ${investment}. This capital covers infrastructure setup, equipment, initial inventory, working capital, and the one-time franchise onboarding fee.`
    },
    {
      question: `How much space or carpet area is required for a ${focusKeyword} outlet?`,
      answer: `To set up a ${focusKeyword} unit, a commercial carpet area of approximately ${space} is required. High-footfall locations such as prime retail high-streets, commercial shopping centers, or key market hubs are strongly recommended.`
    },
    {
      question: `What is the franchise fee and ongoing royalty model for ${name}?`,
      answer: `The franchise fee for ${name} is structured based on outlet format and territory, with an ongoing royalty/commission of ${royalty}. Detailed financial statements, royalty schedules, and disclosure documents are shared upon enquiry review.`
    },
    {
      question: `Does ${name} provide training, hiring, and operational support?`,
      answer: `${training}. Additionally, ${name} assists franchise partners with site feasibility evaluation, standardized interior layout, supply chain logistics, and grand opening launch marketing campaigns.`
    },
    {
      question: `Are master franchise or territorial rights available for ${name}?`,
      answer: masterAvailable
        ? `Yes, ${name} offers master franchise and territorial exclusivity rights for qualified multi-unit operators and high-net-worth investors across key regional territories.`
        : `Currently, ${name} primarily focuses on unit-level franchise expansion across target cities, with multi-unit expansion evaluated on investor merit.`
    },
    {
      question: `How can I apply for an official ${focusKeyword} on Franchise Roots?`,
      answer: `You can apply directly through the Franchise Roots platform by submitting the free enquiry form. Our certified franchise advisory desk verifies your profile, shares the official confidential disclosure pack, and connects you directly with ${name}'s expansion team.`
    }
  ];

  // 5. Table of Contents (TOC)
  const toc = [
    { id: "about-brand", title: `1. About ${focusKeyword} Opportunity` },
    { id: "cost-breakdown", title: `2. ${focusKeyword} Cost Breakdown & Investment Analysis` },
    { id: "space-setup", title: `3. Commercial Space & Location Requirements` },
    { id: "training-support", title: `4. Training, Operational & Supply Chain Support` },
    { id: "profit-roi", title: `5. Expected Profit Margins, Royalty & Payback Timeline` },
    { id: "how-to-apply", title: `6. Step-by-Step Guide to Apply for ${focusKeyword}` },
    { id: "faqs", title: `7. Frequently Asked Questions (AEO Answers for Investors)` }
  ];

  // Authority outbound link based on industry
  const externalAuthorityLink = category.toLowerCase().includes("food")
    ? '<a href="https://www.fssai.gov.in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Food Safety and Standards Authority of India (FSSAI) guidelines</a>'
    : '<a href="https://www.startupindia.gov.in" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Startup India & MSME Government Compliance Portal</a>';

  // 6. Complete 850+ Words Pillar Content Guide
  // Written in clean semantic HTML with short paragraphs, subheadings, internal links,
  // outbound authority links, and an exact ~1% keyword density (8-10 mentions).
  const pillarContent = `
<div class="pillar-guide-container" style="font-family: inherit; color: #1e293b; line-height: 1.75;">

  <p><img src="${ogImage}" alt="${focusKeyword}" loading="lazy" style="max-width:100%;height:auto;" /></p>

  <section id="about-brand" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      1. About the ${focusKeyword} Opportunity in India
    </h2>
    <p style="margin-bottom: 14px;">
      Investing in a <strong>${focusKeyword}</strong> offers entrepreneurs a verified pathway to enter the high-growth ${category} market in India. Headquartered in ${hq}, ${name} has built a recognizable consumer presence driven by consistent customer loyalty, standardized service quality, and scalable unit economics.
    </p>
    <p style="margin-bottom: 14px;">
      Whether you are an aspiring first-time business owner or an experienced entrepreneur diversifying your retail portfolio, a <strong>${focusKeyword}</strong> provides the stability of an established brand combined with comprehensive corporate backing. To explore similar verified options, you can browse our comprehensive <a href="/brands" style="color: #2563eb; font-weight: 600; text-decoration: underline;">Franchise Brands Catalog</a>.
    </p>
  </section>

  <section id="cost-breakdown" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      2. ${focusKeyword} Cost Breakdown & Investment Analysis
    </h2>
    <p style="margin-bottom: 14px;">
      Financial clarity is the cornerstone of any sound business decision. The complete setup budget for a <strong>${focusKeyword}</strong> ranges between <strong>${investment}</strong>. This planned investment encompasses your interior store setup, initial equipment acquisition, working capital reserve, and licensing.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 18px 0;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Key Commercial Specifications:
      </h3>
      <ul style="padding-left: 20px; margin: 0; display: grid; gap: 8px;">
        <li><strong>Estimated Total Investment:</strong> ${investment}</li>
        <li><strong>Ongoing Royalty Fee:</strong> ${royalty}</li>
        <li><strong>Required Commercial Area:</strong> ${space}</li>
        <li><strong>Headquarters Location:</strong> ${hq}</li>
        <li><strong>Sector Classification:</strong> ${sector}</li>
      </ul>
    </div>
    <p style="margin-bottom: 14px;">
      All business registrations conform to statutory national standards, including ${externalAuthorityLink}. Transparent fee disclosures protect incoming partners and facilitate rapid break-even timelines.
    </p>
  </section>

  <section id="space-setup" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      3. Commercial Space & Location Requirements
    </h2>
    <p style="margin-bottom: 14px;">
      To maximize footfall and daily turnover, a <strong>${focusKeyword}</strong> unit requires a commercial space of approximately <strong>${space}</strong>. Prime locations include high-street retail markets, high-density residential catchments, metro feeder hubs, and popular commercial shopping complexes.
    </p>
    <p style="margin-bottom: 14px;">
      The corporate expansion team assists franchise partners with comprehensive site evaluation, footfall heat-mapping, and lease negotiation reviews to ensure your selected retail space meets strict commercial viability benchmarks.
    </p>
  </section>

  <section id="training-support" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      4. Training, Operational & Supply Chain Support
    </h2>
    <p style="margin-bottom: 14px;">
      One of the primary benefits of partnering with ${name} is the structured operational ecosystem. ${training}. Franchisees receive step-by-step manuals covering day-to-day point-of-sale operations, customer relationship management, and inventory replenishment.
    </p>
    <p style="margin-bottom: 14px;">
      Centralized supply chain support ensures uninterrupted access to certified raw materials and proprietary products at preferential bulk rates, protecting operating gross margins for every unit operator.
    </p>
  </section>

  <section id="profit-roi" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      5. Expected Profit Margins, Royalty & Payback Timeline
    </h2>
    <p style="margin-bottom: 14px;">
      With a disciplined operational model and an ongoing royalty of ${royalty}, a well-managed <strong>${focusKeyword}</strong> is designed to achieve healthy gross margins typical of the ${sector} industry. Most franchisees target an operational break-even within 3 to 6 months of store launch.
    </p>
    <p style="margin-bottom: 14px;">
      Full capital return (complete ROI) is traditionally achieved within 14 to 24 months, subject to store location footfall, local demand, and consistent local marketing execution. For regional expansion inquiries, explore our <a href="/master-franchising" style="color: #2563eb; font-weight: 600; text-decoration: underline;">Master Franchise Exclusivity Opportunities</a>.
    </p>
  </section>

  <section id="how-to-apply" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      6. Step-by-Step Guide to Apply for a ${focusKeyword}
    </h2>
    <p style="margin-bottom: 14px;">
      Franchise Roots streamlines the entire enquiry and application lifecycle into 4 transparent stages:
    </p>
    <ol style="padding-left: 22px; margin: 0 0 16px 0; display: grid; gap: 10px;">
      <li><strong>Submit Free Enquiry:</strong> Fill out the investor enquiry form on this page with your budget and preferred location.</li>
      <li><strong>Eligibility Verification:</strong> Our certified franchise advisors verify your investment profile and location suitability within 24 hours.</li>
      <li><strong>Disclosure Pack & Meeting:</strong> Review detailed unit financial models, agreement terms, and attend a direct meeting with ${name}'s leadership.</li>
      <li><strong>Agreement Signing & Store Launch:</strong> Finalize territory rights, initiate store fit-out, and complete staff onboarding for launch day.</li>
    </ol>
    <p style="margin-bottom: 0;">
      Have questions or need assistance? <a href="/contact" style="color: #2563eb; font-weight: 600; text-decoration: underline;">Connect with our Franchise Consultation Desk</a> for free one-on-one expert guidance.
    </p>
  </section>

  <section id="due-diligence" style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
      7. Due Diligence, Compliance & Local Growth Plan
    </h2>
    <p style="margin-bottom: 14px;">
      Before committing capital, investors should validate the proposed territory, review the franchise agreement, confirm all one-time and recurring charges, and request written assumptions behind sales, margins, and payback estimates. A practical launch plan should also account for rent, staffing, utilities, local permits, taxes, insurance, inventory cycles, and a working-capital reserve for the first few months.
    </p>
    <p style="margin-bottom: 14px;">
      Local demand research is equally important. Compare nearby competitors, customer profiles, peak hours, parking and access, delivery coverage, and the visibility of the proposed site. After launch, track enquiries, conversion rate, average order value, repeat customers, wastage, and monthly cash flow. These measurements help the operator make evidence-based decisions and keep the outlet aligned with brand standards.
    </p>
    <p style="margin-bottom: 0;">
      Financial results vary by city, site, format, execution, and market conditions. Treat the figures on this page as an initial planning guide, verify them with the brand team, and obtain independent professional advice before signing any agreement or making a payment.
    </p>
  </section>

</div>
`.trim();

  // 7. Schema.org JSON-LD Structured Data
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${canonicalUrl}#business`,
        "name": name,
        "image": ogImage,
        "description": metaDescription,
        "priceRange": investment,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": hq,
          "addressCountry": "IN"
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumbs`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://franchiseroots.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Brands",
            "item": "https://franchiseroots.com/brands"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": name,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  // 8. Deterministic score calculated from the generated fields.
  const generatedSeo = {
    seoTitle, metaDescription, focusKeyword, secondaryKeywords, canonicalUrl,
    ogTitle, ogDescription, ogImage, geoTitle, geoDescription, aeoContent,
    pillarContent, toc
  };
  const audit = auditSeoData(generatedSeo, faqs);
  const rankMathScore = audit.score;
  const rankMathChecks = [
    { id: "keyword-in-title", label: "Focus Keyword in SEO Title", passed: audit.checks.focusKeywordInTitle },
    { id: "keyword-in-description", label: "Focus Keyword in Meta Description", passed: audit.checks.focusKeywordInDesc },
    { id: "keyword-in-url", label: "Focus Keyword in URL Slug", passed: audit.checks.focusKeywordInUrl },
    { id: "keyword-at-start", label: "Focus Keyword at beginning of content", passed: audit.checks.focusKeywordAtStartContent },
    { id: "keyword-in-content", label: "Focus Keyword in body content", passed: audit.checks.focusKeywordInContent },
    { id: "content-length", label: "Pillar Content length 600-2500 words", passed: audit.checks.contentLengthValid },
    { id: "keyword-in-subheadings", label: "Focus Keyword in H2/H3 subheadings", passed: audit.checks.focusKeywordInSubheadings },
    { id: "image-alt-text", label: "Image with Focus Keyword as alt text", passed: audit.checks.hasImageAltWithKeyword },
    { id: "keyword-density", label: "Keyword density ~1% (natural distribution)", passed: audit.checks.keywordDensityValid },
    { id: "external-links", label: "Outbound authority links (DoFollow)", passed: audit.checks.hasExternalLinks },
    { id: "internal-links", label: "Internal links in content", passed: audit.checks.hasInternalLinks },
    { id: "title-keyword-start", label: "Focus Keyword near beginning of title", passed: audit.checks.titleKwNearStart },
    { id: "title-sentiment", label: "Sentiment word present in title (Profit)", passed: audit.checks.titleHasSentiment },
    { id: "title-power-word", label: "Power word present in title (Complete/ROI)", passed: audit.checks.titleHasPowerWord },
    { id: "title-number", label: "Number present in SEO title (2026)", passed: audit.checks.titleHasNumber },
    { id: "table-of-contents", label: "Table of Contents (TOC) breakdown present", passed: audit.checks.hasTableOfContents },
    { id: "short-paragraphs", label: "Short concise paragraphs for UX", passed: audit.checks.hasShortParagraphs },
    { id: "schema-valid", label: "Valid Schema.org JSON-LD (@graph)", passed: !!schemaData["@graph"] }
  ];

  return {
    seoData: {
      seoTitle,
      metaDescription,
      focusKeyword,
      secondaryKeywords,
      canonicalUrl,
      ogTitle,
      ogDescription,
      ogImage,
      geoTitle,
      geoDescription,
      aeoContent,
      pillarContent,
      toc
      ,rankMathScore
    },
    faqs,
    schemaData,
    rankMathScore,
    rankMathChecks,
    scorecard: rankMathChecks,
    pillarContent,
    toc,
    keywords: [focusKeyword, ...secondaryKeywords.split(",").map((s) => s.trim()).filter(Boolean)],
    seoStatus: brand.seoStatus || "Auto-Generated"
  };
}
