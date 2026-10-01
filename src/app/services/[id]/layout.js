import { getServiceById } from "@/lib/db";

export async function generateMetadata({ params }) {
    // Await params carefully per Next.js 14+ documentation requirements
    const { id } = await params;
    const service = await getServiceById(id);

    if (!service) {
        return {
            title: "Service Not Found - Franchise Roots",
            description: "The requested business advisory service could not be found."
        };
    }

    const title = `${service.title} | Expert Business Advisory Services`;
    const description = `Discover comprehensive ${service.title} services. Expert business advisory tailored for single-unit investors and corporate brand owners by Franchise Roots.`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: `https://www.franchiseroots.com/services/${id}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://www.franchiseroots.com/services/${id}`,
            images: [
                {
                    url: service.image || "https://www.franchiseroots.com/logo-footer.png",
                    width: 1200,
                    height: 630,
                    alt: `${service.title} Business Service`,
                }
            ],
            siteName: "Franchise Roots",
            type: "website",
            locale: "en_IN",
        }
    };
}

export default function ServiceDetailLayout({ children }) {
    return <>{children}</>;
}
