import express from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import Brand from "./src/models/Brand.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/roots";

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Database connected efficiently for MCP."))
    .catch(err => console.error("Database connection error:", err));

const server = new Server(
    { name: "franchise-roots-seo-manager", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

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
                        },
                        faqs: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question: { type: "string" },
                                    answer: { type: "string" }
                                }
                            }
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "list_brands_needing_seo") {
            const limit = request.params.arguments?.limit || 5;
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
                seoStatus: "Pending Review"
            }, { new: true });
            return {
                content: [{
                    type: "text",
                    text: `Successfully saved SEO/FAQ/Schema proposals for Brand [${updatedBrand.name}]. Status set to 'Pending Review'.`
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

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const transports = new Map();

app.get('/sse', async (req, res) => {
    console.log("New SSE Connection established");
    const transport = new SSEServerTransport('/message', res);
    transports.set(transport.sessionId, transport);

    res.on("close", () => {
        console.log("SSE Connection closed", transport.sessionId);
        transports.delete(transport.sessionId);
    });

    await server.connect(transport);
});

app.post('/message', async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports.get(sessionId);
    if (!transport) {
        console.log("Session not found:", sessionId);
        return res.status(404).send('Session not found');
    }
    await transport.handlePostMessage(req, res);
});

const PORT = 5055;
app.listen(PORT, () => {
    console.log(`MCP SSE Server listening on port ${PORT}`);
});
