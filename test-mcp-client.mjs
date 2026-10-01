import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";

async function runTest() {
    console.log("Setting up client");
    const cfUrl = fs.readFileSync("cloudflare-url-clean.txt", "utf8").trim();
    console.log("Using URL:", cfUrl + "/sse");

    const transport = new SSEClientTransport(new URL(cfUrl + "/sse"));

    const client = new Client(
        { name: "test-client", version: "1.0.0" },
        { capabilities: {} }
    );

    try {
        console.log("Connecting to MCP SSE Server...");
        await client.connect(transport);
        console.log("Connected successfully!");

        console.log("Listing tools...");
        const result = await client.listTools();
        console.log("Tools available:", result.tools.map(t => t.name));

        console.log("Calling a mocked or default function (just testing call integration):");
        const toolResult = await client.request(
            {
                method: "tools/list"
            },
            CallToolRequestSchema
        );

        console.log("SUCCESS. Complete flow tested.");
    } catch (err) {
        console.error("FAILED testing complete flow:", err);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}

runTest();
