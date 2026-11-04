import dotenv from 'dotenv';
dotenv.config();

import { POST, GET } from '../src/app/api/advertisements/route.js';

console.log("Testing GET /api/advertisements...");
try {
  const getReq = new Request("http://localhost:3000/api/advertisements", { method: "GET" });
  const getRes = await GET(getReq);
  const getData = await getRes.json();
  console.log("GET response status:", getRes.status);
  console.log("GET response data count:", Array.isArray(getData) ? getData.length : getData);
} catch (err) {
  console.error("GET error:", err);
}

console.log("\nTesting POST /api/advertisements...");
try {
  const adPayload = {
    title: "Test Ad Title " + Date.now(),
    subtitle: "Test Subtitle",
    image: "https://example.com/test.png",
    link: "/brand-registration",
    badge: "SPONSORED",
    position: "homepage_banner",
    isActive: true
  };
  const postReq = new Request("http://localhost:3000/api/advertisements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adPayload)
  });
  const postRes = await POST(postReq);
  const postData = await postRes.json();
  console.log("POST response status:", postRes.status);
  console.log("POST response data:", postData);
} catch (err) {
  console.error("POST error:", err);
}

