import { getBrandById } from "@/lib/db";

export async function generateMetadata({ params }) {
    // Await params carefully per Next.js 14+ documentation requirements
    const { id } = await params;
    const brand = await getBrandById(id);

    if (!brand) {
        return {
            title: "Brand Not Found - Franchise Roots",
            description: "The requested brand or franchise could not be found."
        };
    }

    const title = `${brand.name} Franchise Opportunity & Details in India`;
    const description = `Explore the ${brand.name} franchise opportunity on Franchise Roots. Minimum investment is ${brand.minInvestment} with required area of ${brand.areaRequired || 'Contact Support'}. Connect directly with brand operators now.`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: `https://www.franchiseroots.com/brands/${id}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://www.franchiseroots.com/brands/${id}`,
            images: [
                {
                    url: brand.image || "https://www.franchiseroots.com/logo-footer.png",
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

export default function BrandDetailLayout({ children }) {
    return <>{children}</>;
}
