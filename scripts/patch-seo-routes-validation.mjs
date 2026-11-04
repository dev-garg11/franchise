import fs from "fs";
import path from "path";

// 1. Patch src/app/api/admin/seo/[id]/route.js
const routePath = path.join(process.cwd(), "src", "app", "api", "admin", "seo", "[id]", "route.js");
let routeContent = fs.readFileSync(routePath, "utf8");

if (!routeContent.includes('validateTitle, validateDescription')) {
  routeContent = routeContent.replace(
    'import { auditSeoData } from "@/lib/seoAudit";',
    'import { auditSeoData } from "@/lib/seoAudit";\r\nimport { validateTitle, validateDescription } from "@/lib/seo/validate";'
  );
  if (!routeContent.includes('validateTitle, validateDescription')) {
    routeContent = routeContent.replace(
      'import { auditSeoData } from "@/lib/seoAudit";',
      'import { auditSeoData } from "@/lib/seoAudit";\nimport { validateTitle, validateDescription } from "@/lib/seo/validate";'
    );
  }
}

const targetPatchSeo = `    if (seoData) {
      updatedFields.seoData = {`;

const newPatchSeo = `    if (seoData) {
      if (seoData.seoTitle) {
        const titleVal = validateTitle(seoData.seoTitle);
        if (!titleVal.isValid) {
          return NextResponse.json({ success: false, error: titleVal.reason }, { status: 400 });
        }
      }
      if (seoData.metaDescription) {
        const descVal = validateDescription(seoData.metaDescription);
        if (!descVal.isValid) {
          return NextResponse.json({ success: false, error: descVal.reason }, { status: 400 });
        }
      }
      updatedFields.seoData = {`;

if (routeContent.includes(targetPatchSeo)) {
  routeContent = routeContent.replace(targetPatchSeo, newPatchSeo);
} else {
  const targetCRLF = targetPatchSeo.replace(/\n/g, "\r\n");
  const newCRLF = newPatchSeo.replace(/\n/g, "\r\n");
  if (routeContent.includes(targetCRLF)) {
    routeContent = routeContent.replace(targetCRLF, newCRLF);
  } else {
    console.warn("Could not find targetPatchSeo in route.js");
  }
}

fs.writeFileSync(routePath, routeContent, "utf8");
console.log("Successfully patched src/app/api/admin/seo/[id]/route.js!");

// 2. Patch src/components/admin/SeoEditModal.js
const modalPath = path.join(process.cwd(), "src", "components", "admin", "SeoEditModal.js");
let modalContent = fs.readFileSync(modalPath, "utf8");

const targetHandleSave = `  // Handle Save
  const handleSave = () => {
    const updatedSeoData = {`;

const newHandleSave = `  // Handle Save
  const handleSave = () => {
    if (seoTitle && seoTitle.trim().length > 60) {
      alert(\`SEO Title is \${seoTitle.trim().length} chars (Maximum allowed: 60 chars). Please shorten before saving.\`);
      return;
    }
    if (metaDescription && metaDescription.trim().length > 160) {
      alert(\`Meta Description is \${metaDescription.trim().length} chars (Maximum allowed: 160 chars). Please shorten before saving.\`);
      return;
    }
    const updatedSeoData = {`;

if (modalContent.includes(targetHandleSave)) {
  modalContent = modalContent.replace(targetHandleSave, newHandleSave);
} else {
  const targetCRLF = targetHandleSave.replace(/\n/g, "\r\n");
  const newCRLF = newHandleSave.replace(/\n/g, "\r\n");
  if (modalContent.includes(targetCRLF)) {
    modalContent = modalContent.replace(targetCRLF, newCRLF);
  } else {
    console.warn("Could not find targetHandleSave in SeoEditModal.js");
  }
}

fs.writeFileSync(modalPath, modalContent, "utf8");
console.log("Successfully patched src/components/admin/SeoEditModal.js!");
