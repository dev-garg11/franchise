import { NextResponse } from "next/server";
import { getBlogs, getBrands, getServices } from "@/lib/db";

const CATEGORY_ALIASES = {
  automotive: ["automotive", "auto", "car", "bike", "vehicle", "detailing", "workshop", "ऑटो", "कार"],
  "beauty & health": ["beauty", "health", "salon", "spa", "clinic", "medical", "wellness", "ब्यूटी", "हेल्थ", "सलून"],
  "business services": ["business service", "digital marketing", "consulting", "logistics", "courier", "co working", "बिजनेस सर्विस"],
  "dealers & distributors": ["dealer", "distributor", "distribution", "solar", "energy", "डीलर", "डिस्ट्रीब्यूटर"],
  education: ["education", "school", "coaching", "preschool", "daycare", "training", "academy", "शिक्षा", "कोचिंग"],
  fashion: ["fashion", "clothing", "apparel", "footwear", "garments", "फैशन", "कपड़े"],
  "food and beverage": ["food", "beverage", "restaurant", "cafe", "tea", "coffee", "bakery", "qsr", "fast food", "pizza", "burger", "फूड", "रेस्टोरेंट", "कैफे"],
  "home based business": ["home based", "home business", "online consulting", "handmade", "tutoring", "घर से", "होम बेस्ड"],
  "hotel, travel & tourism": ["hotel", "travel", "tourism", "resort", "homestay", "tour", "होटल", "ट्रैवल"],
  retail: ["retail", "supermarket", "grocery", "eyewear", "electronics", "gifting", "रिटेल", "सुपरमार्केट"],
  "sports, fitness & entertainment": ["sports", "fitness", "gym", "play zone", "gaming", "entertainment", "जिम", "फिटनेस"]
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "are", "what", "which", "where", "how", "can", "you", "tell", "about", "please", "show", "me", "is", "in", "of", "a", "an", "to", "on", "my", "your",
  "hai", "hain", "ka", "ki", "ke", "ko", "se", "mein", "mujhe", "mujhko", "batao", "bataiye", "chahiye", "kya", "kaise", "kahan", "ye", "yeh", "aur", "ya", "par", "ek", "do", "kr", "karo", "karein"
]);

const WEBSITE_TERMS = [
  "franchise", "brand", "investment", "invest", "business", "opportunity", "opportunities", "service", "services", "blog", "blogs", "article", "category", "sector", "location", "city", "state", "territory", "master", "exclusive", "royalty", "fee", "area", "support", "training", "agreement", "website", "franchise roots", "फ्रेंचाइजी", "ब्रांड", "निवेश", "बिजनेस", "सर्विस", "शुल्क", "फीस", "एरिया", "सपोर्ट"
];

function clean(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}\s&.-]/gu, " ").replace(/\s+/g, " ").trim();
}

function tokens(value) {
  return clean(value).split(/\s+/).filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function formatCurrency(value) {
  if (value === undefined || value === null || value === "") return "Not specified on the website";
  if (typeof value === "string" && /lakh|lac|crore|cr|₹|rs\.?/i.test(value)) return value;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(1)} Lakhs`;
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

function isHindiLike(query) {
  const lower = clean(query);
  return /[\u0900-\u097f]/u.test(query) || /\b(hai|hain|mujhe|batao|bataiye|chahiye|kya|kaise|kahan|kitna|kitni|aap|mera|meri|ke liye|se|par)\b/.test(lower);
}

function answerText(english, hindi, query) {
  return isHindiLike(query) ? hindi : english;
}

function extractBudget(query) {
  const lower = clean(query);
  const lakh = lower.match(/(?:under|below|upto|up to|within|less than|से कम|तक)\s*(?:₹|rs|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l|लाख)/i);
  if (lakh) return Number(lakh[1]) * 100000;
  const crore = lower.match(/(?:under|below|upto|up to|within|less than|से कम|तक)\s*(?:₹|rs|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr|करोड़)/i);
  if (crore) return Number(crore[1]) * 10000000;
  return null;
}

function categoryFor(query) {
  const lower = clean(query);
  return Object.entries(CATEGORY_ALIASES).find(([, aliases]) => aliases.some((alias) => lower.includes(clean(alias))))?.[0] || null;
}

function scoreDocument(query, document) {
  const queryText = clean(query);
  const queryTokens = tokens(query);
  const text = clean(document.searchText);
  let score = 0;
  if (document.title && queryText.includes(clean(document.title))) score += 100;
  for (const token of queryTokens) {
    if (text.includes(token)) score += token.length > 4 ? 8 : 4;
  }
  return score;
}

function isWebsiteQuestion(query) {
  const lower = clean(query);
  return WEBSITE_TERMS.some((term) => lower.includes(clean(term))) || categoryFor(query) !== null || extractBudget(query) !== null;
}

function isContentQuestion(query) {
  const lower = clean(query);
  return /\b(service|services|blog|blogs|article|articles)\b/i.test(lower) || /सर्विस|ब्लॉग|आर्टिकल/u.test(lower);
}

function websiteOverviewAnswer(query, brands) {
  const lower = clean(query);
  if (/what is franchise roots|about franchise roots|franchise roots kya|franchise roots kya hai|फ्रेंचाइज़ रूट्स क्या|फ्रैंचाइज़ रूट्स क्या/u.test(lower)) {
    return {
      text: answerText(
        "Franchise Roots is a platform for discovering franchise and business opportunities in India. You can explore verified brand listings, investment details, services, blogs and franchise enquiry options available on this website.",
        "Franchise Roots India mein franchise aur business opportunities discover karne ka platform hai. Is website par aap verified brands, investment details, services, blogs aur franchise enquiry options dekh sakte hain.",
        query
      ),
      cards: [],
      suggestedPrompts: ["Show franchise categories", "Show available brands", "Tell me about your services"]
    };
  }
  if (/\b(categories|category|sectors|industries)\b/i.test(lower) || /कैटेगरी|श्रेणी|सेक्टर|इंडस्ट्री/u.test(lower)) {
    const categories = [...new Set(brands.map((brand) => brand.category).filter(Boolean))];
    if (!categories.length) return null;
    return {
      text: answerText(`The website currently lists these franchise categories: ${categories.join(", ")}. Ask me for brands in any one category.`, `Website par abhi ye franchise categories listed hain: ${categories.join(", ")}. Kisi bhi category ke brands ke baare mein pooch sakte hain.`, query),
      cards: [],
      suggestedPrompts: categories.slice(0, 4).map((category) => `Show ${category} brands`)
    };
  }
  return null;
}

function mapBrand(brand) {
  const id = brand.id || brand._id?.toString();
  return {
    id,
    name: brand.name || "Unnamed Brand",
    company: brand.company || brand.name || "",
    category: brand.category || "Franchise Opportunity",
    location: brand.location || "Pan India",
    investmentRange: brand.minInvestment || brand.maxInvestment
      ? `${formatCurrency(brand.minInvestment)} - ${formatCurrency(brand.maxInvestment)}`
      : brand.investment_range || "Contact for investment details",
    minInvestment: brand.minInvestment,
    maxInvestment: brand.maxInvestment,
    areaRequired: brand.areaRequired || "Not specified on the website",
    masterFranchiseAvailable: Boolean(brand.masterFranchiseAvailable),
    image: brand.image || "",
    link: id ? `/brands/${id}` : "/brands",
    seoSummary: brand.seoData?.metaDescription || brand.description || "Details available on the brand page."
  };
}

function brandAnswer(brands, query) {
  const budget = extractBudget(query);
  const category = categoryFor(query);
  const lowerQuery = clean(query);
  const asksForMaster = lowerQuery.includes("master") || lowerQuery.includes("exclusive") || lowerQuery.includes("मास्टर");
  const asksForBrands = /\b(top|best|trending|brands?|opportunities|franchise)\b/i.test(lowerQuery) || /ब्रांड|फ्रेंचाइजी|अवसर/u.test(lowerQuery);
  const ranked = brands
    .map((brand) => ({ brand, score: scoreDocument(query, { title: brand.name, searchText: [brand.name, brand.company, brand.category, brand.sector, brand.location, brand.description, brand.investment_range, brand.territoryOffered, brand.areaRequired].join(" ") }) }))
    .filter(({ brand, score }) => {
      const categoryText = clean([brand.category, brand.sector, brand.description].filter(Boolean).join(" "));
      const categoryAliases = category ? [category, ...(CATEGORY_ALIASES[category] || [])].map(clean) : [];
      const categoryMatches = !category || categoryAliases.some((alias) => alias.length > 2 && categoryText.includes(alias));
      const budgetMatches = !budget || !brand.minInvestment || Number(brand.minInvestment) <= budget;
      const masterMatches = !asksForMaster || brand.masterFranchiseAvailable || clean(brand.territoryOffered).includes("exclusive");
      return score >= 8 && categoryMatches && budgetMatches && masterMatches;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ brand }) => brand);

  const selected = ranked.length
    ? ranked
    : asksForBrands && !category && !budget && !asksForMaster
      ? brands.filter((brand) => (!asksForMaster || brand.masterFranchiseAvailable || clean(brand.territoryOffered).includes("exclusive")) && (!budget || !brand.minInvestment || Number(brand.minInvestment) <= budget)).slice(0, 4)
      : [];
  if (!selected.length) return null;
  const cards = selected.map(mapBrand);
  const lines = cards.map((brand, index) => `${index + 1}. **[${brand.name}](${brand.link})** — ${brand.category}\n   - Investment: ${brand.investmentRange}\n   - Location: ${brand.location}${brand.areaRequired ? `\n   - Area required: ${brand.areaRequired}` : ""}`);
  const criteria = [category, budget ? `under ${formatCurrency(budget)}` : ""].filter(Boolean).join(" and ");
  const english = `According to the Franchise Roots website, these ${criteria ? `${criteria} ` : ""}franchise opportunities are relevant:\n\n${lines.join("\n\n")}\n\nOpen a brand page for the complete details. I will only share information available on this website.`;
  const hindi = `Franchise Roots website ke data ke according ${criteria ? `${criteria} ke liye ` : ""}ye relevant franchise opportunities hain:\n\n${lines.join("\n\n")}\n\nComplete details ke liye brand page open karein. Main sirf website par available information hi share karunga.`;
  return { text: answerText(english, hindi, query), cards, suggestedPrompts: ["Show food and beverage brands", "Franchises under ₹10 Lakhs", "Master franchise opportunities"] };
}

function contentAnswer(query, services, blogs) {
  const documents = [
    ...services.map((item) => ({ ...item, kind: "service", title: item.title, searchText: `${item.title} ${item.content}` })),
    ...blogs.map((item) => ({ ...item, kind: "blog", title: item.title, searchText: `${item.title} ${item.content}` }))
  ];
  const matches = documents.map((item) => ({ item, score: scoreDocument(query, item) })).filter(({ score }) => score >= 8).sort((a, b) => b.score - a.score).slice(0, 3);
  if (!matches.length) return null;
  const result = matches.map(({ item }) => {
    const id = item.id || item._id?.toString();
    const link = `/${item.kind === "service" ? "services" : "blogs"}/${id}`;
    const summary = clean(item.content).slice(0, 300);
    return `- **[${item.title}](${link})**: ${summary}${summary.length === 300 ? "..." : ""}`;
  }).join("\n");
  const english = `I found this information on the Franchise Roots website:\n\n${result}\n\nFor the complete details, open the linked page.`;
  const hindi = `Mujhe Franchise Roots website par ye information mili:\n\n${result}\n\nComplete details ke liye linked page open karein.`;
  return { text: answerText(english, hindi, query), cards: [], suggestedPrompts: ["Show franchise brands", "Tell me about your services"] };
}

function fallback(query) {
  return {
    text: answerText(
      "I can answer only from the information available on the Franchise Roots website. This question is outside that information. Please contact the Franchise Roots admin team for a verified answer.",
      "Main sirf Franchise Roots website par available information ke basis par answer de sakta hoon. Ye question website ke available data ke bahar hai. Verified answer ke liye Franchise Roots admin team se contact karein.",
      query
    ),
    cards: [],
    suggestedPrompts: ["Show franchise brands", "Find brands by category", "Show services available on the website"]
  };
}

export async function GET() {
  return NextResponse.json({ status: "ok", agent: "Franchise Roots Website Assistant", version: "2.0.0", source: "Franchise Roots website data only" });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
    const history = Array.isArray(body.history) ? body.history : [];
    const previousUserMessage = [...history].reverse().find((item) => item?.role === "user" && typeof item.content === "string")?.content || "";
    const searchMessage = message.length < 40 && previousUserMessage ? `${previousUserMessage} ${message}` : message;

    const [allBrands, services, blogs] = await Promise.all([getBrands(), getServices(), getBlogs()]);
    const approvedBrands = allBrands.filter((brand) => brand.status === "Approved");
    const greeting = /^(hi|hello|hey|namaste|नमस्ते|help|मदद)[!.\s]*$/iu.test(message);
    let result = greeting
      ? { text: answerText("Hello! I can help you find Franchise Roots brands, investments, categories, services and website blogs. What would you like to know?", "Namaste! Main Franchise Roots ke brands, investment, categories, services aur website blogs ke baare mein bata sakta hoon. Aap kya jaana chahte hain?", message), cards: [], suggestedPrompts: ["Show top franchise brands", "Show food and beverage brands", "Tell me about services"] }
      : null;

    if (!result) result = websiteOverviewAnswer(searchMessage, approvedBrands);
    if (!result && isContentQuestion(searchMessage)) result = contentAnswer(searchMessage, services, blogs) || brandAnswer(approvedBrands, searchMessage);
    if (!result && isWebsiteQuestion(searchMessage)) result = brandAnswer(approvedBrands, searchMessage) || contentAnswer(searchMessage, services, blogs);
    if (!result && !isWebsiteQuestion(searchMessage)) result = contentAnswer(searchMessage, services, blogs);
    result = result || fallback(message);

    return NextResponse.json({ success: true, message: result.text, brands: result.cards, suggestedPrompts: result.suggestedPrompts, matchedCount: result.cards.length, source: "website" });
  } catch (error) {
    console.error("AI Agent Route Error:", error);
    return NextResponse.json({ success: false, error: "Failed to read website data", message: "Website data read karne mein temporary problem aa gayi. Please thodi der baad try karein." }, { status: 500 });
  }
}
