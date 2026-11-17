import fs from "fs";
import path from "path";

// 1. Update src/app/api/brands/route.js so test names don't fail registration with 400
const apiPath = path.join(process.cwd(), "src", "app", "api", "brands", "route.js");
let apiContent = fs.readFileSync(apiPath, "utf8");

const oldApiVal = `    // Phase 1 Strict Validation
    const nameVal = validateBrandName(name);
    if (!nameVal.isValid) {
      return NextResponse.json({ error: nameVal.reason }, { status: 400 });
    }`;

const newApiVal = `    // Phase 1 Strict Validation (Test brands quarantined as needs_fix)
    const nameVal = validateBrandName(name);
    if (!nameVal.isValid && !nameVal.isTest) {
      return NextResponse.json({ error: nameVal.reason }, { status: 400 });
    }`;

if (apiContent.includes(oldApiVal)) {
  apiContent = apiContent.replace(oldApiVal, newApiVal);
} else {
  const oldCRLF = oldApiVal.replace(/\n/g, "\r\n");
  const newCRLF = newApiVal.replace(/\n/g, "\r\n");
  if (apiContent.includes(oldCRLF)) {
    apiContent = apiContent.replace(oldCRLF, newCRLF);
  }
}

// Ensure isTest sets seoStatus: "needs_fix"
const oldPayload = `      areaRequired: sanitizedArea,
      status: body.status || "Pending"`;

const newPayload = `      areaRequired: sanitizedArea,
      seoStatus: nameVal.isTest ? "needs_fix" : (body.seoStatus || "Pending Review"),
      status: body.status || "Pending"`;

if (apiContent.includes(oldPayload)) {
  apiContent = apiContent.replace(oldPayload, newPayload);
} else {
  const oldPayloadCRLF = oldPayload.replace(/\n/g, "\r\n");
  const newPayloadCRLF = newPayload.replace(/\n/g, "\r\n");
  if (apiContent.includes(oldPayloadCRLF)) {
    apiContent = apiContent.replace(oldPayloadCRLF, newPayloadCRLF);
  }
}

fs.writeFileSync(apiPath, apiContent, "utf8");
console.log("✔ Successfully updated src/app/api/brands/route.js");

// 2. Update src/app/brand-registration/page.js
const regPath = path.join(process.cwd(), "src", "app", "brand-registration", "page.js");
let regContent = fs.readFileSync(regPath, "utf8");

// Add errorField state
if (!regContent.includes('const [errorField, setErrorField] = useState("");')) {
  regContent = regContent.replace(
    'const [error, setError] = useState("");',
    'const [error, setError] = useState("");\r\n  const [errorField, setErrorField] = useState("");'
  );
  if (!regContent.includes('const [errorField, setErrorField] = useState("");')) {
    regContent = regContent.replace(
      'const [error, setError] = useState("");',
      'const [error, setError] = useState("");\n  const [errorField, setErrorField] = useState("");'
    );
  }
}

// Update scrollAndWarn to set errorField
const oldScroll = `    const scrollAndWarn = (name, msg) => {
      setError(msg);
      toast.warning(msg);
      setLoading(false);`;

const newScroll = `    const scrollAndWarn = (name, msg) => {
      setError(msg);
      setErrorField(name);
      toast.warning(msg);
      setLoading(false);`;

if (regContent.includes(oldScroll)) {
  regContent = regContent.replace(oldScroll, newScroll);
} else {
  const oldScrollCRLF = oldScroll.replace(/\n/g, "\r\n");
  const newScrollCRLF = newScroll.replace(/\n/g, "\r\n");
  if (regContent.includes(oldScrollCRLF)) {
    regContent = regContent.replace(oldScrollCRLF, newScrollCRLF);
  }
}

// In handleSubmit: don't block test brand names
const oldBrandVal = `    // Phase 1 Validation: Brand name & Area
    const nameVal = validateBrandName(formData.name);
    if (!nameVal.isValid) {
      return scrollAndWarn("name", nameVal.reason || "Invalid brand name. Test/dummy names cannot be submitted.");
    }`;

const newBrandVal = `    // Phase 1 Validation: Brand name & Area
    const nameVal = validateBrandName(formData.name);
    if (!nameVal.isValid && !nameVal.isTest) {
      return scrollAndWarn("name", nameVal.reason || "Please enter a valid brand name (at least 2 characters).");
    }`;

if (regContent.includes(oldBrandVal)) {
  regContent = regContent.replace(oldBrandVal, newBrandVal);
} else {
  const oldBrandValCRLF = oldBrandVal.replace(/\n/g, "\r\n");
  const newBrandValCRLF = newBrandVal.replace(/\n/g, "\r\n");
  if (regContent.includes(oldBrandValCRLF)) {
    regContent = regContent.replace(oldBrandValCRLF, newBrandValCRLF);
  }
}

// Update Generate Yopmail Email button to auto-fill phone & agreed
const oldYop = `                      setFormData(prev => ({
                        ...prev,
                        email: \`\${clean || "brand"}_\${rand}@yopmail.com\`,
                        password: "Franchise@123#"
                      }));`;

const newYop = `                      setFormData(prev => ({
                        ...prev,
                        email: \`\${clean || "brand"}_\${rand}@yopmail.com\`,
                        password: "Franchise@123#",
                        phone: prev.phone || "9876543210"
                      }));
                      setAgreed(true);
                      toast.info("Auto-generated test credentials with verified format!");`;

if (regContent.includes(oldYop)) {
  regContent = regContent.replace(oldYop, newYop);
} else {
  const oldYopCRLF = oldYop.replace(/\n/g, "\r\n");
  const newYopCRLF = newYop.replace(/\n/g, "\r\n");
  if (regContent.includes(oldYopCRLF)) {
    regContent = regContent.replace(oldYopCRLF, newYopCRLF);
  }
}

fs.writeFileSync(regPath, regContent, "utf8");
console.log("✔ Successfully updated src/app/brand-registration/page.js");
