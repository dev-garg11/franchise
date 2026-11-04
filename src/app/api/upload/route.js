import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "brands");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. Handle FormData (File upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const brandSlug = formData.get("slug") || "brand";

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const mimeType = file.type || "image/jpeg";
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/jpg"];
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        return NextResponse.json({ error: "Invalid file type. Allowed: JPG, PNG, WEBP, GIF, SVG" }, { status: 400 });
      }

      const extMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
        "image/svg+xml": "svg"
      };
      const ext = extMap[mimeType.toLowerCase()] || "jpg";

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File exceeds maximum size of 5MB" }, { status: 400 });
      }

      const safeSlug = String(brandSlug).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const fileName = `${safeSlug || "brand"}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/brands/${fileName}`;

      return NextResponse.json({ success: true, url: publicUrl });
    }

    // 2. Handle Base64 JSON payload
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { dataUrl, slug } = body;

      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
        return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!matches) {
        return NextResponse.json({ error: "Malformed data URI" }, { status: 400 });
      }

      let ext = matches[1].toLowerCase();
      if (ext === "jpeg") ext = "jpg";
      if (ext === "svg+xml") ext = "svg";

      const buffer = Buffer.from(matches[2], "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Decoded image exceeds maximum size of 5MB" }, { status: 400 });
      }

      const safeSlug = String(slug || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const fileName = `${safeSlug || "brand"}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      await fs.promises.writeFile(filePath, buffer);
      const publicUrl = `/uploads/brands/${fileName}`;

      return NextResponse.json({ success: true, url: publicUrl });
    }

    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 415 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
