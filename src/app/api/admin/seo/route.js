import { NextResponse } from "next/server";
import { getBrands, updateBrand, dbConnect } from "@/lib/db";
import Brand from "@/models/Brand";
import { generateBrandSeoData } from "@/lib/brandSeoGenerator";
import { auditSeoData } from "@/lib/seoAudit";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "all";

    // Query brands directly from DB for speed and lean footprint
    const query = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (status && status !== "all") {
      query.seoStatus = status;
    }
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { name: regex },
        { category: regex },
        { "seoData.focusKeyword": regex }
      ];
    }

    const brands = await Brand.find(query)
      .select("id name brandName category investmentRange minInvestment maxInvestment areaRequired royaltyFee status seoStatus seoData faqs schemaData image logo createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formattedBrands = brands.map((b) => {
      const id = b.id || b._id.toString();
      const seo = b.seoData || {};
      const faqs = Array.isArray(b.faqs) ? b.faqs : [];
      const audit = auditSeoData(seo, faqs);
      const score = audit.score;

      return {
        id,
        _id: id,
        name: b.name || b.brandName || "Unnamed Brand",
        category: b.category || "General",
        investmentRange: b.investmentRange || "Contact Support",
        minInvestment: b.minInvestment || 0,
        maxInvestment: b.maxInvestment || 0,
        areaRequired: b.areaRequired || "",
        royaltyFee: b.royaltyFee || "0%",
        image: b.image || b.logo || "",
        status: b.status || "Pending",
        seoStatus: b.seoStatus || "Pending Review",
        seoData: {
          seoTitle: seo.seoTitle || "",
          metaDescription: seo.metaDescription || "",
          focusKeyword: seo.focusKeyword || "",
          secondaryKeywords: seo.secondaryKeywords || "",
          canonicalUrl: seo.canonicalUrl || "",
          geoDescription: seo.geoDescription || "",
          aeoContent: seo.aeoContent || "",
          pillarContent: seo.pillarContent || "",
          toc: Array.isArray(seo.toc) ? seo.toc : [],
          keywords: Array.isArray(seo.keywords) ? seo.keywords : [],
          rankMathScore: score,
          lastGeneratedAt: seo.lastGeneratedAt || null
        },
        faqsCount: faqs.length,
        hasPillarContent: !!(seo.pillarContent && seo.pillarContent.length > 200),
        hasSchema: !!(b.schemaData && Object.keys(b.schemaData).length > 0)
      };
    });

    // Summary stats
    const total = formattedBrands.length;
    const fullyOptimized = formattedBrands.filter((b) => (b.seoData?.rankMathScore || 0) >= 80).length;
    const pendingReview = formattedBrands.filter((b) => b.seoStatus === "Pending Review").length;
    const approved = formattedBrands.filter((b) => b.seoStatus === "Approved").length;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        fullyOptimized,
        pendingReview,
        approved
      },
      brands: formattedBrands
    });
  } catch (error) {
    console.error("Error fetching SEO brands:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch SEO data" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    if (action === "batch-generate") {
      // Find all brands and run SEO generator for each
      const brands = await Brand.find({}).lean();
      let updatedCount = 0;

      // Keep the batch fast without opening one unbounded promise per brand.
      // Eight concurrent writes is enough to reduce wall time while protecting MongoDB.
      const batchSize = 8;
      for (let offset = 0; offset < brands.length; offset += batchSize) {
        const batch = brands.slice(offset, offset + batchSize);
        await Promise.all(batch.map(async (b) => {
          const id = b.id || b._id.toString();
          const generated = generateBrandSeoData(b);
          await updateBrand(id, {
            seoData: {
              ...generated.seoData,
              pillarContent: generated.pillarContent,
              toc: generated.toc,
              keywords: generated.keywords,
              rankMathScore: generated.rankMathScore,
              lastGeneratedAt: new Date()
            },
            faqs: generated.faqs,
            schemaData: generated.schemaData,
            seoStatus: "Approved"
          });
        }));
        updatedCount += batch.length;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully generated AI SEO data for ${updatedCount} brands`,
        count: updatedCount
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Batch SEO generation failed:", error);
    return NextResponse.json({ success: false, error: "Batch generation failed" }, { status: 500 });
  }
}

