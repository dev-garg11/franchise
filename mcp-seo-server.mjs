import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import Brand from "./src/models/Brand.js";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/roots";

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.error("Database connected efficiently for MCP."))
    .catch(err => console.error("Database connection error:", err));

const server = new Server(
    {
        name: "franchise-roots-seo-manager",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_brands_needing_seo",
                description: "Retrieves a list of approved brands that are missing detailed SEO, GEO, AEO, and FAQ data.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: { type: "number", description: "Maximum number of brands to fetch (default: 5)" }
                    }
                }
            },
            {
                name: "get_brand_details",
                description: "Retrieves comprehensive raw details for a specific brand to generate SEO content.",
                inputSchema: {
                    type: "object",
                    properties: {
                        brandId: { type: "string", description: "The MongoDB ObjectId of the brand." }
                    },
                    required: ["brandId"]
                }
            },
            {
                name: "propose_seo_update",
                description: "Proposes newly generated automated SEO, GEO, AEO, FAQ, and Schema content for admin review.",
                inputSchema: {
                    type: "object",
                    properties: {
                        brandId: { type: "string" },
                        seoData: {
                            type: "object",
                            description: "The advanced SEO metadata (seoTitle, metaDescription, canonicalUrl, ogTitle, geoTitle, aeoContent, etc.)"
                        },
                        faqs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" }
                                }
                            },
                            description: "Array of exactly 5 tailored KPIs/FAQs based on the brand's raw data."
                        },
                        schemaData: {
                            type: "object",
                            description: "A built Schema.org JSON object (e.g. LocalBusiness, FAQPage) related to this business."
                        }
                    },
                    required: ["brandId", "seoData", "faqs"]
                }
            }
        ]
    };
});

// Implement Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "list_brands_needing_seo") {
            const limit = request.params.arguments?.limit || 5;
            // Brands without SEO approved
            const brands = await Brand.find({ seoStatus: { $ne: "Approved" } })
                .select("id name category status seoStatus")
                .limit(limit)
                .lean();

            return {
                content: [{ type: "text", text: JSON.stringify(brands, null, 2) }]
            };
        }

        else if (request.params.name === "get_brand_details") {
            const { brandId } = request.params.arguments;
            const brand = await Brand.findById(brandId).lean();
            if (!brand) throw new Error("Brand not found.");

            return {
                content: [{ type: "text", text: JSON.stringify(brand, null, 2) }]
            };
        }

        else if (request.params.name === "propose_seo_update") {
            const { brandId, seoData, faqs, schemaData } = request.params.arguments;

            const updatedBrand = await Brand.findByIdAndUpdate(brandId, {
                seoData: seoData,
                faqs: faqs,
                schemaData: schemaData || {},
                seoStatus: "Pending Review" // Admin takes over from here in dashboard
            }, { new: true });

            return {
                content: [{
                    type: "text",
                    text: `Successfully saved SEO/FAQ/Schema proposals for Brand [${updatedBrand.name}]. Status set to 'Pending Review'. The Admin can now review it in the CMS.`
                }]
            };
        }

        throw new Error("Tool not found");
    } catch (err) {
        return {
            content: [{ type: "text", text: `Error executing tool: ${err.message}` }],
            isError: true,
        };
    }
});

// Run with standard stdio
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Roots MCP Server running on stdio.");
}

run().catch(console.error);
