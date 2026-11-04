import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "app", "api", "brands", "route.js");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes('import { validateArea, validateBrandName, validateImageUrl }')) {
  content = content.replace(
    'import { getBrands, resetDatabaseConnection, saveBrand } from "@/lib/db";',
    'import { getBrands, resetDatabaseConnection, saveBrand } from "@/lib/db";\r\nimport { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";'
  );
  if (!content.includes('import { validateArea, validateBrandName, validateImageUrl }')) {
    content = content.replace(
      'import { getBrands, resetDatabaseConnection, saveBrand } from "@/lib/db";',
      'import { getBrands, resetDatabaseConnection, saveBrand } from "@/lib/db";\nimport { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";'
    );
  }
}

const targetValidation = `    if (body.minInvestment && body.maxInvestment && Number(body.maxInvestment) < Number(body.minInvestment)) {
      return NextResponse.json({ error: "Maximum investment must be greater than or equal to minimum investment." }, { status: 400 });
    }`;

const newValidation = `    if (body.minInvestment && body.maxInvestment && Number(body.maxInvestment) < Number(body.minInvestment)) {
      return NextResponse.json({ error: "Maximum investment must be greater than or equal to minimum investment." }, { status: 400 });
    }

    // Phase 1 Strict Validation
    const nameVal = validateBrandName(name);
    if (!nameVal.isValid) {
      return NextResponse.json({ error: nameVal.reason }, { status: 400 });
    }

    let sanitizedArea = null;
    if (body.areaRequired && String(body.areaRequired).trim()) {
      const areaVal = validateArea(body.areaRequired);
      if (!areaVal.isValid) {
        return NextResponse.json({ error: \`Invalid Area: \${areaVal.reason}. Must be between 50 and 50,000 sq ft.\` }, { status: 400 });
      }
      sanitizedArea = areaVal.value;
    }

    if (body.image && typeof body.image === "string") {
      const imgVal = validateImageUrl(body.image);
      if (!imgVal.isValid) {
        return NextResponse.json({ error: \`Invalid Image: \${imgVal.reason}\` }, { status: 400 });
      }
    }`;

if (content.includes(targetValidation)) {
  content = content.replace(targetValidation, newValidation);
} else {
  // Try CRLF
  const targetCRLF = targetValidation.replace(/\n/g, "\r\n");
  const newCRLF = newValidation.replace(/\n/g, "\r\n");
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, newCRLF);
  } else {
    console.warn("Could not find targetValidation");
  }
}

content = content.replace(
  'status: body.status || "Pending"',
  'areaRequired: sanitizedArea,\r\n      status: body.status || "Pending"'
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully updated src/app/api/brands/route.js with Phase 1 validation!");
