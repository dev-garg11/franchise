import { connectToDatabase } from "@/lib/db";
import Brand from "@/models/Brand";
import Service from "@/models/Service";
import Blog from "@/models/Blog";

export default async function sitemap() {
    const baseUrl = "https://www.franchiseroots.com";

    // Connect to database safely
    try {
        await connectToDatabase();
    } catch (dbErr) {
        console.error("Sitemap: Database connection error during build:", dbErr.message);
    }

    // Fetch published brands mapping
    let brands = [];
    try {
        brands = await Brand.find({ status: "Approved" }).select("_id updatedAt").lean();
    } catch (error) {
        console.error("Sitemap: Failed to load brands", error);
    }

    const brandUrls = brands.map((brand) => ({
        url: `${baseUrl}/brands/${brand._id.toString()}`,
        lastModified: brand.updatedAt || new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    // Fetch published services
    let services = [];
    try {
        services = await Service.find({}).select("_id updatedAt").lean();
    } catch (error) {
        console.error("Sitemap: Failed to load services", error);
    }

    const serviceUrls = services.map((service) => ({
        url: `${baseUrl}/services/${service._id.toString()}`,
        lastModified: service.updatedAt || new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    // Fetch published blogs
    let blogs = [];
    try {
        blogs = await Blog.find({}).select("_id updatedAt").lean();
    } catch (error) {
        console.error("Sitemap: Failed to load blogs", error);
    }

    const blogUrls = blogs.map((b) => ({
        url: `${baseUrl}/blogs/${b._id.toString()}`,
        lastModified: b.updatedAt || new Date().toISOString(),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    // Core static routes
    const routes = [
        "",
        "/about-us",
        "/brands",
        "/services",
        "/master-franchising",
        "/blogs",
        "/brand-registration",
        "/investor-registration",
        "/contact"
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: route === "" ? 1.0 : 0.9,
    }));

    return [...routes, ...brandUrls, ...serviceUrls, ...blogUrls];
}
