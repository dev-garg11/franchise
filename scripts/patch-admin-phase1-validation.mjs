import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "app", "admin", "page.js");
let content = fs.readFileSync(filePath, "utf8");

// 1. Add import
if (!content.includes('import { validateArea, validateBrandName, validateImageUrl }')) {
  content = content.replace(
    'import { generateBrandSeoData } from "@/lib/brandSeoGenerator";',
    'import { generateBrandSeoData } from "@/lib/brandSeoGenerator";\r\nimport { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";'
  );
  if (!content.includes('import { validateArea, validateBrandName, validateImageUrl }')) {
    content = content.replace(
      'import { generateBrandSeoData } from "@/lib/brandSeoGenerator";',
      'import { generateBrandSeoData } from "@/lib/brandSeoGenerator";\nimport { validateArea, validateBrandName, validateImageUrl } from "@/lib/seo/validate";'
    );
  }
}

// 2. Replace handleAdminImageFileSelect
const oldImageSelectRegex = /const handleAdminImageFileSelect = \(e\) => \{[\s\S]*?reader\.readAsDataURL\(file\);\s*\};/;
const newImageSelect = `const handleAdminImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    try {
      toast.info("Uploading image...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", adminBrandForm.name || "brand");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAdminBrandForm((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Network error while uploading image.");
    }
  };`;

if (oldImageSelectRegex.test(content)) {
  content = content.replace(oldImageSelectRegex, newImageSelect);
} else {
  console.warn("Could not find old handleAdminImageFileSelect regex");
}

// 3. Replace handleSaveAdminBrand start with validation
const oldSaveRegex = /const handleSaveAdminBrand = async \(e\) => \{[\s\S]*?const rangeIndex = REGISTRATION_INVESTMENT_OPTIONS\.indexOf\(adminBrandForm\.investment_range\);/;
const newSavePrefix = `const handleSaveAdminBrand = async (e) => {
    e.preventDefault();
    if (!editingBrand) return;

    // Phase 1 Validation
    const nameVal = validateBrandName(adminBrandForm.name);
    if (!nameVal.isValid) {
      toast.warning(nameVal.reason || "Invalid brand name. Test/dummy names cannot be approved.");
      return;
    }

    let sanitizedArea = adminBrandForm.areaRequired;
    if (adminBrandForm.areaRequired && String(adminBrandForm.areaRequired).trim()) {
      const areaVal = validateArea(adminBrandForm.areaRequired);
      if (!areaVal.isValid) {
        toast.warning(\`Invalid Area: \${areaVal.reason}. Must be between 50 and 50,000 sq ft.\`);
        return;
      }
      sanitizedArea = areaVal.value;
    } else {
      sanitizedArea = null;
    }

    if (adminBrandForm.image && String(adminBrandForm.image).trim()) {
      const imgVal = validateImageUrl(adminBrandForm.image);
      if (!imgVal.isValid) {
        toast.warning(\`Invalid Image: \${imgVal.reason}\`);
        return;
      }
    }

    const rangeIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(adminBrandForm.investment_range);`;

if (oldSaveRegex.test(content)) {
  content = content.replace(oldSaveRegex, newSavePrefix);
} else {
  console.warn("Could not find old handleSaveAdminBrand regex");
}

// Ensure payload uses sanitizedArea
content = content.replace(
  'minInvestment: rangeMinVal || editingBrand.minInvestment || 0,',
  'areaRequired: sanitizedArea,\r\n        minInvestment: rangeMinVal || editingBrand.minInvestment || 0,'
);

// 4. Update Area Required input field in modal
const oldAreaInput = `<div className="form-group">
                    <label>Space Required (Sq. Ft.)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={adminBrandForm.areaRequired}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, areaRequired: e.target.value })}
                    />
                  </div>`;

const newAreaInput = `<div className="form-group">
                    <label>Space Required (Sq. Ft.)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 500 - 1,500 sq ft"
                      value={adminBrandForm.areaRequired || ""}
                      onChange={(e) => setAdminBrandForm({ ...adminBrandForm, areaRequired: e.target.value })}
                    />
                    <small style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                      Unit: sq ft. Allowed range: 50 to 50,000 sq ft. Leave blank if not applicable.
                    </small>
                  </div>`;

if (content.includes(oldAreaInput)) {
  content = content.replace(oldAreaInput, newAreaInput);
} else {
  // Try CRLF normalization
  const oldAreaInputNorm = oldAreaInput.replace(/\n/g, "\r\n");
  const newAreaInputNorm = newAreaInput.replace(/\n/g, "\r\n");
  if (content.includes(oldAreaInputNorm)) {
    content = content.replace(oldAreaInputNorm, newAreaInputNorm);
  } else {
    console.warn("Could not find oldAreaInput in content");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully patched src/app/admin/page.js with Phase 1 validation!");
