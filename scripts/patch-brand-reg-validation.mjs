import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "app", "brand-registration", "page.js");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes('import { validateArea, validateBrandName }')) {
  content = content.replace(
    'import { toast } from "@/lib/swal";',
    'import { toast } from "@/lib/swal";\r\nimport { validateArea, validateBrandName } from "@/lib/seo/validate";'
  );
  if (!content.includes('import { validateArea, validateBrandName }')) {
    content = content.replace(
      'import { toast } from "@/lib/swal";',
      'import { toast } from "@/lib/swal";\nimport { validateArea, validateBrandName } from "@/lib/seo/validate";'
    );
  }
}

// In handleSubmit
const targetCheck = `    const rangeIndex = INVESTMENT_OPTIONS.indexOf(formData.investment_range);
    const maxIndex = INVESTMENT_OPTIONS.indexOf(formData.max_investment_limit);
    if (maxIndex < rangeIndex) {
      setError("Maximum investment must be greater than or equal to minimum investment.");
      setLoading(false);
      return;
    }`;

const newCheck = `    const rangeIndex = INVESTMENT_OPTIONS.indexOf(formData.investment_range);
    const maxIndex = INVESTMENT_OPTIONS.indexOf(formData.max_investment_limit);
    if (maxIndex < rangeIndex) {
      setError("Maximum investment must be greater than or equal to minimum investment.");
      setLoading(false);
      return;
    }

    // Phase 1 Validation
    const nameVal = validateBrandName(formData.name);
    if (!nameVal.isValid) {
      setError(nameVal.reason || "Invalid brand name. Test/dummy names cannot be submitted.");
      setLoading(false);
      return;
    }

    let sanitizedArea = formData.areaRequired;
    if (formData.areaRequired && formData.areaRequired.trim()) {
      const areaVal = validateArea(formData.areaRequired);
      if (!areaVal.isValid) {
        setError(\`Invalid Area: \${areaVal.reason}. Space required must be between 50 and 50,000 sq ft.\`);
        setLoading(false);
        return;
      }
      sanitizedArea = areaVal.value;
    }`;

if (content.includes(targetCheck)) {
  content = content.replace(targetCheck, newCheck);
} else {
  const targetCRLF = targetCheck.replace(/\n/g, "\r\n");
  const newCRLF = newCheck.replace(/\n/g, "\r\n");
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, newCRLF);
  } else {
    console.warn("Could not find targetCheck in brand-registration/page.js");
  }
}

content = content.replace(
  'franchiseFee: Number(formData.franchiseFee) || 50000,',
  'areaRequired: sanitizedArea,\r\n        franchiseFee: Number(formData.franchiseFee) || 50000,'
);

// Add helper text in UI
const targetInput = `<input
                  type="text"
                  name="areaRequired"
                  placeholder="e.g. 200 - 350 Sq. Ft."
                  value={formData.areaRequired}
                  onChange={handleChange}
                  className="form-input"
                />`;

const newInput = `<input
                  type="text"
                  name="areaRequired"
                  placeholder="e.g. 200 - 350 Sq. Ft."
                  value={formData.areaRequired}
                  onChange={handleChange}
                  className="form-input"
                />
                <small style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                  Unit: sq ft. Allowed range: 50 to 50,000 sq ft. Leave blank if not applicable.
                </small>`;

if (content.includes(targetInput)) {
  content = content.replace(targetInput, newInput);
} else {
  const targetInputCRLF = targetInput.replace(/\n/g, "\r\n");
  const newInputCRLF = newInput.replace(/\n/g, "\r\n");
  if (content.includes(targetInputCRLF)) {
    content = content.replace(targetInputCRLF, newInputCRLF);
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Successfully patched src/app/brand-registration/page.js!");
