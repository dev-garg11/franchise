import { getBrandById } from "@/lib/db";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const brand = await getBrandById(id);

  if (!brand) {
    return {
      title: "Brand Not Found - Franchise Roots",
      description: "The requested brand or franchise could not be found."
    };
  }

  const seo = brand.seoData || {};
  const title = seo.seoTitle || `${brand.name} Franchise Opportunity, Cost & Profit (2026) | Franchise Roots`;
  const description = seo.metaDescription || `Explore the ${brand.name} franchise opportunity on Franchise Roots. Minimum investment is ${brand.minInvestment} with required area of ${brand.areaRequired || 'Contact Support'}. Connect directly with brand operators now.`;
  const canonicalUrl = seo.canonicalUrl || `https://www.franchiseroots.com/brands/${id}`;
  const keywords = Array.isArray(seo.keywords) && seo.keywords.length > 0
    ? seo.keywords
    : (seo.focusKeyword ? [seo.focusKeyword] : [`${brand.name} franchise`, `${brand.category} franchise India`]);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonicalUrl,
      images: [
        {
          url: seo.ogImage || brand.image || "https://www.franchiseroots.com/logo-footer.png",
          width: 1200,
          height: 630,
          alt: `${brand.name} Franchise Logo`,
        }
      ],
      siteName: "Franchise Roots",
      type: "website",
      locale: "en_IN",
    }
  };
}

export default async function BrandDetailLayout({ children, params }) {
  const { id } = await params;
  const brand = await getBrandById(id);
  const schema = brand?.schemaData;

  return (
    <>
      {schema && Object.keys(schema).length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      {children}
    </>
  );
}
