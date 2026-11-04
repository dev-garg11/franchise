import { NextResponse } from "next/server";
import { getBrandById, updateBrand, dbConnect } from "@/lib/db";
import { generateBrandSeoData } from "@/lib/brandSeoGenerator";
import { auditSeoData } from "@/lib/seoAudit";
import { validateTitle, validateDescription } from "@/lib/seo/validate";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const brand = await getBrandById(id);

    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    const existingSeo = brand.seoData || {};

    const mergedData = {
      brand: {
        id: brand.id || brand._id.toString(),
        name: brand.name,
        category: brand.category,
        investmentRange: brand.investmentRange,
        minInvestment: brand.minInvestment,
        maxInvestment: brand.maxInvestment,
        areaRequired: brand.areaRequired,
        royaltyFee: brand.royaltyFee,
        image: brand.image || brand.logo || "",
        status: brand.status,
        seoStatus: brand.seoStatus || "Pending Review"
      },
      seoData: {
        seoTitle: existingSeo.seoTitle || "",
        metaDescription: existingSeo.metaDescription || "",
        focusKeyword: existingSeo.focusKeyword || "",
        secondaryKeywords: existingSeo.secondaryKeywords || "",
        canonicalUrl: existingSeo.canonicalUrl || "",
        geoDescription: existingSeo.geoDescription || "",
        aeoContent: existingSeo.aeoContent || "",
        pillarContent: existingSeo.pillarContent || "",
        toc: Array.isArray(existingSeo.toc) ? existingSeo.toc : [],
        keywords: Array.isArray(existingSeo.keywords) ? existingSeo.keywords : [],
        rankMathScore: auditSeoData(existingSeo, brand.faqs).score,
        lastGeneratedAt: existingSeo.lastGeneratedAt || null
      },
      faqs: Array.isArray(brand.faqs) ? brand.faqs : [],
      schemaData: brand.schemaData && Object.keys(brand.schemaData).length > 0 ? brand.schemaData : {},
      rankMathScorecard: auditSeoData(existingSeo, brand.faqs)
    };

    return NextResponse.json({ success: true, data: mergedData });
  } catch (error) {
    console.error("Failed to fetch brand SEO detail:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brand SEO detail" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { seoData, faqs, schemaData, seoStatus } = body;

    const brand = await getBrandById(id);
    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    const updatedFields = {};
    if (seoData) {
      if (seoData.seoTitle) {
        const titleVal = validateTitle(seoData.seoTitle);
        if (!titleVal.isValid) {
          return NextResponse.json({ success: false, error: titleVal.reason }, { status: 400 });
        }
      }
      if (seoData.metaDescription) {
        const descVal = validateDescription(seoData.metaDescription);
        if (!descVal.isValid) {
          return NextResponse.json({ success: false, error: descVal.reason }, { status: 400 });
        }
      }
      updatedFields.seoData = {
        ...(brand.seoData || {}),
        ...seoData
      };
      updatedFields.seoData.rankMathScore = auditSeoData(updatedFields.seoData, faqs || brand.faqs).score;
    }
    if (Array.isArray(faqs)) {
      updatedFields.faqs = faqs;
    }
    if (schemaData) {
      updatedFields.schemaData = schemaData;
    }
    if (seoStatus) {
      updatedFields.seoStatus = seoStatus;
    }

    const updated = await updateBrand(id, updatedFields, "Admin updated brand SEO & AI configuration", {
      email: "admin@franchiseroots.com",
      name: "Administrator"
    });

    return NextResponse.json({
      success: true,
      message: "SEO data saved successfully",
      brand: updated
    });
  } catch (error) {
    console.error("Failed to update brand SEO:", error);
    return NextResponse.json({ success: false, error: "Failed to update brand SEO" }, { status: 500 });
  }
}

// POST: Trigger 1-click AI Generation for this specific brand
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const brand = await getBrandById(id);

    if (!brand) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    // Generate fresh 22-rule Rank Math, GEO, AEO, Pillar Content & Schema
    const generated = generateBrandSeoData(brand);

    const updatedSeoData = {
      ...generated.seoData,
      pillarContent: generated.pillarContent,
      toc: generated.toc,
      keywords: generated.keywords,
      rankMathScore: generated.rankMathScore,
      lastGeneratedAt: new Date()
    };

    const updated = await updateBrand(id, {
      seoData: updatedSeoData,
      faqs: generated.faqs,
      schemaData: generated.schemaData,
      seoStatus: "Approved"
    }, "AI generated comprehensive SEO, AEO, and GEO strategy", {
      email: "ai-engine@franchiseroots.com",
      name: "AI SEO Engine"
    });

    return NextResponse.json({
      success: true,
      message: `AI SEO data generated with Rank Math Score: ${generated.rankMathScore}/100`,
      data: {
        seoData: updatedSeoData,
        faqs: generated.faqs,
        schemaData: generated.schemaData,
        rankMathScorecard: generated.scorecard,
        brand: updated
      }
    });
  } catch (error) {
    console.error("Failed to run AI SEO generation:", error);
    return NextResponse.json({ success: false, error: "Failed to run AI SEO generation" }, { status: 500 });
  }
}

