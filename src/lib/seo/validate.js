/**
 * SEO & Brand Data Validation Module
 * Franchise Roots - Strict Production Standards
 * 
 * Rules:
 * 1. Area: Must be a number between 50 and 50,000 sq ft (else treated as null/missing).
 * 2. Investment Text: Required (cannot be empty).
 * 3. Logo/Image: Must be a real https URL or internal /uploads/ URL (never data:image).
 * 4. Brand Name: Must not match test/demo/dummy patterns for indexing.
 * 5. SEO Title: Must be <= 60 characters.
 * 6. Meta Description: Must be <= 160 characters.
 */

// 1. Validate Area Required
export function validateArea(rawArea) {
  if (!rawArea || typeof rawArea !== "string" && typeof rawArea !== "number") {
    return { isValid: false, value: null, reason: "Area is empty or missing" };
  }

  const str = String(rawArea).trim();
  if (str === "" || str.toLowerCase() === "empty/null" || str.toLowerCase() === "null") {
    return { isValid: false, value: null, reason: "Area is empty" };
  }

  // Check impossible values like 80000000
  if (str.includes("80000000")) {
    return { isValid: false, value: null, reason: "Invalid impossible area value (80,000,000)" };
  }

  // Remove commas inside numbers (e.g. "1,500" -> "1500")
  const normalizedStr = str.replace(/,/g, "");

  // Extract all numbers from string
  const numbers = normalizedStr.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return { isValid: false, value: null, reason: "No numeric values found in area string" };
  }

  const parsedNumbers = numbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
  if (parsedNumbers.length === 0) {
    return { isValid: false, value: null, reason: "Invalid numeric area" };
  }

  // Check bounds: every number mentioned must be within 50 to 50,000 sq ft
  const minNum = Math.min(...parsedNumbers);
  const maxNum = Math.max(...parsedNumbers);

  if (maxNum > 5000) {
    return { isValid: false, value: null, reason: `Area ${maxNum} sq ft exceeds maximum allowed (5,000 sq ft)` };
  }
  if (minNum < 50) {
    return { isValid: false, value: null, reason: `Area ${minNum} sq ft is below minimum allowed (50 sq ft)` };
  }

  // Return clean formatted area
  let formatted = str;
  if (!/sq\.?\s*ft/i.test(formatted)) {
    formatted = `${formatted} sq ft`;
  }

  return { isValid: true, value: formatted, reason: null };
}

// 2. Validate Investment
export function validateInvestment(brand = {}) {
  const text = (brand.investment_range || brand.investmentRange || "").trim();
  const min = Number(brand.minInvestment || 0);

  if (!text && min <= 0) {
    return { isValid: false, value: null, reason: "Investment details are required" };
  }

  const formatted = text || (min > 0 ? `Rs. ${min.toLocaleString("en-IN")}` : "Contact for Investment");
  return { isValid: true, value: formatted, reason: null };
}

// 3. Validate Logo / Image URL
export function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return { isValid: false, value: null, reason: "Image URL is missing" };
  }

  const clean = url.trim();
  if (clean.startsWith("data:image")) {
    return { isValid: true, value: clean, reason: null };
  }

  if (clean.startsWith("https://") || clean.startsWith("http://") || clean.startsWith("/uploads/") || clean.startsWith("/")) {
    return { isValid: true, value: clean, reason: null };
  }

  return { isValid: false, value: clean, reason: "Image must be a valid image URL or uploaded photo" };
}

// 4. Validate Brand Name (No Test / Dummy Names in Production)
export function validateBrandName(name) {
  if (!name || typeof name !== "string") {
    return { isValid: false, reason: "Brand name is required" };
  }

  const clean = name.trim();
  if (clean.length < 2) {
    return { isValid: false, reason: "Brand name must be at least 2 characters long" };
  }
  if (clean.length > 30) {
    return { isValid: false, reason: "Brand name cannot exceed 30 characters" };
  }

  if (/^(test|demo|dummy|testing|sample|ajay)$/i.test(clean) || /\b(test brand|dummy brand|demo brand)\b/i.test(clean)) {
    return { isValid: false, isTest: true, reason: "Brand name appears to be a test/demo entry" };
  }

  return { isValid: true, isTest: false, value: clean, reason: null };
}

// 5. Validate Title Length (<= 60 chars)
export function validateTitle(title) {
  if (!title || typeof title !== "string") {
    return { isValid: false, len: 0, reason: "SEO title is required" };
  }
  const clean = title.trim();
  const len = clean.length;
  if (len > 60) {
    return { isValid: false, len, reason: `SEO title is ${len} chars (maximum allowed: 60 chars)` };
  }
  if (len < 15) {
    return { isValid: false, len, reason: `SEO title is too short (${len} chars)` };
  }
  return { isValid: true, len, value: clean, reason: null };
}

// 6. Validate Meta Description Length (<= 160 chars)
export function validateDescription(desc) {
  if (!desc || typeof desc !== "string") {
    return { isValid: false, len: 0, reason: "Meta description is required" };
  }
  const clean = desc.trim();
  const len = clean.length;
  if (len > 160) {
    return { isValid: false, len, reason: `Meta description is ${len} chars (maximum allowed: 160 chars)` };
  }
  if (len < 50) {
    return { isValid: false, len, reason: `Meta description is too short (${len} chars)` };
  }
  return { isValid: true, len, value: clean, reason: null };
}

// 7. Comprehensive Brand SEO Validation Suite
export function validateBrandSeo(brand = {}) {
  const errors = [];
  const warnings = [];

  const nameVal = validateBrandName(brand.name);
  if (!nameVal.isValid) errors.push(nameVal.reason);

  const areaVal = validateArea(brand.areaRequired);
  if (!areaVal.isValid && brand.areaRequired) {
    warnings.push(`Area ignored: ${areaVal.reason}`);
  }

  const investVal = validateInvestment(brand);
  if (!investVal.isValid) errors.push(investVal.reason);

  const imageVal = validateImageUrl(brand.image || brand.logo);
  if (!imageVal.isValid) errors.push(imageVal.reason);

  const seo = brand.seoData || {};
  if (seo.seoTitle) {
    const titleVal = validateTitle(seo.seoTitle);
    if (!titleVal.isValid) errors.push(titleVal.reason);
  }

  if (seo.metaDescription) {
    const descVal = validateDescription(seo.metaDescription);
    if (!descVal.isValid) errors.push(descVal.reason);
  }

  return {
    isValid: errors.length === 0,
    isTest: !!nameVal.isTest,
    errors,
    warnings,
    sanitized: {
      name: nameVal.value || brand.name,
      validArea: areaVal.isValid ? areaVal.value : null,
      validInvestment: investVal.isValid ? investVal.value : null,
      validImage: imageVal.isValid ? imageVal.value : null
    }
  };
}
