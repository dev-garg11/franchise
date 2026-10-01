import { getBlogById } from "@/lib/db";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const post = await getBlogById(id);

    if (!post) {
        return {
            title: "Post Not Found - Franchise Roots",
            description: "The requested blog post could not be found."
        };
    }

    const title = `${post.title} | Franchise Roots`;
    const description = post.desc ? post.desc.substring(0, 155) + "..." : `Read ${post.title} on Franchise Roots Insights.`;

    return {
        title: title,
        description: description,
        alternates: {
            canonical: `https://www.franchiseroots.com/blogs/${id}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://www.franchiseroots.com/blogs/${id}`,
            images: [
                {
                    url: post.image || "https://www.franchiseroots.com/logo-footer.png",
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            siteName: "Franchise Roots",
            type: "article",
            locale: "en_IN",
        }
    };
}

export default function BlogDetailLayout({ children }) {
    return <>{children}</>;
}
