import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Brand from "@/models/Brand";
import { getBrands } from "@/lib/db";

// Format currency in Lakhs or Crores for Indian context
function formatCurrency(val) {
  if (!val && val !== 0) return "N/A";
  if (typeof val === "string" && (val.includes("Lakh") || val.includes("Cr") || val.includes("₹"))) return val;
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹ ${(num / 100000).toFixed(1)} Lakhs`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}

// Category mappings for smart intent matching
const CATEGORY_MAP = {
  food: ["Food and Beverage", "food", "beverage", "restaurant", "cafe", "tea", "coffee", "cloud kitchen", "bakery", "snack", "pizza", "burger", "sandwich"],
  automotive: ["Automotive", "car", "auto", "detailing", "bike", "vehicle", "automobile", "wash", "mobility"],
  services: ["Business Services", "service", "laundry", "courier", "logistics", "consultant", "cleaning", "consulting"],
  fashion: ["Fashion", "clothing", "apparel", "wear", "garments", "textile", "retail", "footwear", "baby"],
  dealers: ["Dealers & Distributors", "dealer", "distributor", "mobility", "distribution", "electric"],
  fitness: ["Sports, Fitness & Entertainment", "gym", "fitness", "sports", "entertainment", "wellness", "workout"],
  health: ["Beauty & Health", "health", "clinic", "hospital", "beauty", "salon", "medical", "care", "wellness"],
  education: ["Education", "school", "coaching", "learning", "chess", "training", "edtech", "academy"],
  home: ["Home Based Business", "home", "elder care", "wfh", "remote", "part time"]
};

// Parse budget numbers from text
function extractBudgetInRupees(text) {
  const lower = text.toLowerCase();
  
  // Under / Below / Less than
  const underLakhsMatch = lower.match(/(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/i);
  if (underLakhsMatch) {
    return { max: parseFloat(underLakhsMatch[1]) * 100000 };
  }

  const underCrMatch = lower.match(/(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/i);
  if (underCrMatch) {
    return { max: parseFloat(underCrMatch[1]) * 10000000 };
  }

  // Direct mention of 5L, 10 lakhs, 20 lakhs
  const directLakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/i);
  if (directLakhMatch) {
    const val = parseFloat(directLakhMatch[1]) * 100000;
    return { target: val, max: val * 1.3, min: Math.max(0, val * 0.5) };
  }

  const directCrMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/i);
  if (directCrMatch) {
    const val = parseFloat(directCrMatch[1]) * 10000000;
    return { target: val, max: val * 1.3, min: Math.max(0, val * 0.5) };
  }

  if (lower.includes("low investment") || lower.includes("affordable") || lower.includes("cheap")) {
    return { max: 1500000 }; // <= 15 Lakhs
  }

  return null;
}

// Built-in intelligent SEO scoring and brand recommendation engine
function recommendBrands(allBrands, userQuery) {
  const query = userQuery.toLowerCase().trim();
  const budget = extractBudgetInRupees(query);

  const isMasterRequested = query.includes("master") || query.includes("territory") || query.includes("exclusive");
  const isHighRoi = query.includes("roi") || query.includes("return") || query.includes("profit") || query.includes("best") || query.includes("top");
  const isLinkRequested = query.includes("link") || query.includes("url") || query.includes("page");

  // Determine target categories
  const targetCategories = [];
  for (const [key, terms] of Object.entries(CATEGORY_MAP)) {
    if (terms.some(t => query.includes(t.toLowerCase()))) {
      targetCategories.push(terms[0]);
    }
  }

  // Location detection
  const commonLocations = [
    "mumbai", "delhi", "new delhi", "pune", "chandigarh", "bengaluru", "bangalore",
    "ahmedabad", "surat", "ludhiana", "gurugram", "malappuram", "chennai", "kolkata",
    "hyderabad", "jaipur", "lucknow", "indore", "kochi", "amritsar", "kota"
  ];
  const detectedLocation = commonLocations.find(loc => query.includes(loc));

  // Score each brand
  const scored = allBrands.map(b => {
    let score = 0;
    const bName = (b.name || "").toLowerCase();
    const bCompany = (b.company || "").toLowerCase();
    const bCat = (b.category || "").toLowerCase();
    const bDesc = (b.description || "").toLowerCase();
    const bLoc = (b.location || "").toLowerCase();
    const seoTitle = (b.seoData?.seoTitle || "").toLowerCase();
    const focusKeyword = (b.seoData?.focusKeyword || "").toLowerCase();
    const aeoContent = (b.seoData?.aeoContent || "").toLowerCase();

    // 1. Direct Name Match (Highest Weight)
    if (bName && query.includes(bName)) {
      score += 120;
    } else {
      const nameTokens = bName.split(/\s+/).filter(t => t.length > 2);
      for (const token of nameTokens) {
        if (query.includes(token)) score += 35;
      }
    }

    // 2. Category Match
    if (targetCategories.length > 0) {
      if (targetCategories.some(tc => tc.toLowerCase() === bCat)) {
        score += 65;
      }
    }

    // 3. Budget Fit
    if (budget) {
      const bMin = Number(b.minInvestment) || 0;
      const bMax = Number(b.maxInvestment) || bMin;

      if (budget.max && bMin <= budget.max) {
        score += 45;
        // Closer to budget max without exceeding
        if (bMax <= budget.max) score += 15;
      } else if (budget.target) {
        if (bMin <= budget.target && bMax >= budget.target * 0.7) {
          score += 40;
        }
      }
    }

    // 4. Location Match
    if (detectedLocation && (bLoc.includes(detectedLocation) || query.includes(bLoc))) {
      score += 40;
    }

    // 5. Master Franchise
    if (isMasterRequested && (b.masterFranchiseAvailable || b.territoryOffered?.includes("State") || b.territoryOffered?.includes("Exclusivity"))) {
      score += 45;
    }

    // 6. SEO Keywords & Content Match
    if (focusKeyword && query.includes(focusKeyword)) score += 30;
    if (seoTitle && seoTitle.split(" ").some(w => w.length > 3 && query.includes(w))) score += 15;
    if (aeoContent && aeoContent.split(" ").some(w => w.length > 4 && query.includes(w))) score += 10;
    if (b.featured) score += 15;

    // Quality of brand listing
    if (b.image) score += 5;
    if (b.description && b.description.length > 50) score += 5;

    return { brand: b, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // If high scores exist, filter to top matches
  let topBrands = scored.filter(s => s.score > 30).slice(0, 4).map(s => s.brand);

  // Fallback: If query was generic or no strong match found
  if (topBrands.length === 0) {
    topBrands = allBrands
      .filter(b => b.status === "Approved")
      .slice(0, 3);
  }

  return {
    topBrands,
    targetCategories,
    detectedLocation,
    budget,
    isMasterRequested,
    isHighRoi,
    isLinkRequested
  };
}

// Generate friendly, SEO-rich AI response
function generateAiResponse({ topBrands, userQuery, targetCategories, detectedLocation, budget, isMasterRequested }) {
  if (!topBrands || topBrands.length === 0) {
    return {
      text: "I couldn't find an exact franchise match in our database matching those specific filters. However, we have a growing network of verified brands across Food & Beverage, Automotive, Business Services, Fashion, and Healthcare. Would you like me to recommend our most popular high-ROI opportunities?",
      cards: [],
      suggestedPrompts: [
        "🔥 Show Top 3 Trending Franchises",
        "🍔 Best Food & Beverage Brands",
        "💰 Franchises Under ₹10 Lakhs",
        "👑 Master Franchise Opportunities"
      ]
    };
  }

  // Format brand cards for structured UI
  const cards = topBrands.map(b => {
    const brandId = b.id || b._id?.toString();
    const minInv = formatCurrency(b.minInvestment);
    const maxInv = formatCurrency(b.maxInvestment);
    const rangeText = (b.minInvestment && b.maxInvestment) 
      ? `${minInv} - ${maxInv}` 
      : b.investment_range || "Contact for Investment";

    return {
      id: brandId,
      name: b.name,
      company: b.company || b.name,
      category: b.category,
      location: b.location || "Pan India",
      investmentRange: rangeText,
      minInvestment: b.minInvestment,
      maxInvestment: b.maxInvestment,
      areaRequired: b.areaRequired || "Varies by model",
      masterFranchiseAvailable: !!b.masterFranchiseAvailable,
      image: b.image || "",
      link: `/brands/${brandId}`,
      seoSummary: b.seoData?.metaDescription || b.description?.slice(0, 140) + "..." || "Verified franchise opportunity on Franchise Roots.",
      focusKeyword: b.seoData?.focusKeyword || b.category
    };
  });

  // Construct Conversational AI Markdown text
  const criteriaParts = [];
  if (targetCategories.length > 0) criteriaParts.push(`**${targetCategories.join(", ")}**`);
  if (detectedLocation) criteriaParts.push(`in **${detectedLocation.toUpperCase()}**`);
  if (budget?.max) criteriaParts.push(`under **${formatCurrency(budget.max)}**`);
  if (isMasterRequested) criteriaParts.push("with **Master / Exclusive Territory** rights");

  const criteriaSummary = criteriaParts.length > 0 
    ? ` based on your preference for ${criteriaParts.join(" ")}` 
    : "";

  let markdown = `### 🌟 Recommended Franchise Brands & Direct Links\n\n`;
  markdown += `I've analyzed verified franchise opportunities on **Franchise Roots**${criteriaSummary}. Here are the top-performing brands with direct links to review their complete investment sheets:\n\n`;

  cards.forEach((card, index) => {
    markdown += `**${index + 1}. [${card.name}](${card.link})** — *${card.category}*\n`;
    markdown += `- 💰 **Investment Range**: ${card.investmentRange}\n`;
    markdown += `- 📍 **Location / Expansion**: ${card.location}\n`;
    if (card.areaRequired && card.areaRequired !== "Varies by model") {
      markdown += `- 🏬 **Space Required**: ${card.areaRequired}\n`;
    }
    if (card.masterFranchiseAvailable) {
      markdown += `- 👑 **Master Franchise**: Available with territory exclusivity\n`;
    }
    markdown += `- 🔗 **Direct Page Link**: [View ${card.name} Opportunity →](${card.link})\n\n`;
  });

  markdown += `💡 *SEO & Market Tip*: These brands have high digital search volume and strong customer brand recall in their respective sectors. Click any brand card below to view details, agreements, and connect with franchise directors!`;

  // Dynamic follow-up suggestion chips
  const suggestedPrompts = [];
  if (cards.length > 0) {
    suggestedPrompts.push(`Tell me about franchise fee for ${cards[0].name}`);
  }
  if (!budget) {
    suggestedPrompts.push("💰 Show brands under ₹15 Lakhs");
  }
  if (!isMasterRequested) {
    suggestedPrompts.push("👑 Master franchise opportunities");
  }
  if (!targetCategories.includes("Food and Beverage")) {
    suggestedPrompts.push("🍔 Top Food & Beverage brands");
  } else {
    suggestedPrompts.push("🚗 Automotive & Detailing franchises");
  }

  return {
    text: markdown,
    cards,
    suggestedPrompts: suggestedPrompts.slice(0, 4)
  };
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    agent: "FranchiseRoots FR AI Agent",
    version: "1.0.0",
    features: [
      "Natural Language Franchise Brand Matching",
      "Direct Brand URL Generation",
      "SEO Keyword & Search Authority Ranking",
      "Investment Range & Budget Filtering",
      "Master Franchise Territory Insights"
    ]
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message || "";
    const history = body.history || [];

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Connect to DB and fetch all approved brands
    let allBrands = [];
    try {
      allBrands = await getBrands();
    } catch (dbErr) {
      console.error("Error fetching brands for AI Agent:", dbErr);
    }

    // Fallback if no brands returned from getBrands
    if (!allBrands || allBrands.length === 0) {
      try {
        allBrands = await Brand.find({}).lean();
      } catch (err) {
        console.error("Secondary Brand.find error:", err);
      }
    }

    // Only focus on Approved or all available brands
    const approvedBrands = allBrands.filter(b => b.status === "Approved");
    const brandsPool = approvedBrands.length > 0 ? approvedBrands : allBrands;

    // Run AI recommendation engine
    const matchAnalysis = recommendBrands(brandsPool, message);
    const aiResponse = generateAiResponse({
      ...matchAnalysis,
      userQuery: message
    });

    return NextResponse.json({
      success: true,
      message: aiResponse.text,
      brands: aiResponse.cards,
      suggestedPrompts: aiResponse.suggestedPrompts,
      matchedCount: aiResponse.cards.length
    });
  } catch (error) {
    console.error("AI Agent Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response. Please try again.",
        message: "I encountered a brief connection error while processing brand data. Please try asking again!"
      },
      { status: 500 }
    );
  }
}
