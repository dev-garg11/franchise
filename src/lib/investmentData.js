// Utility for Franchise India style Min & Max investment filtering and validation

export const BUDGET_OPTIONS = [
  { label: "Rs. 10,000", value: 10000 },
  { label: "Rs. 50,000", value: 50000 },
  { label: "Rs. 2 Lakhs", value: 200000 },
  { label: "Rs. 5 Lakhs", value: 500000 },
  { label: "Rs. 10 Lakhs", value: 1000000 },
  { label: "Rs. 20 Lakhs", value: 2000000 },
  { label: "Rs. 30 Lakhs", value: 3000000 },
  { label: "Rs. 50 Lakhs", value: 5000000 },
  { label: "Rs. 1 Crore", value: 10000000 },
  { label: "Rs. 2 Crores", value: 20000000 },
  { label: "Rs. 5 Crores+", value: 50000000 },
];

export const parseRupeeValue = (str) => {
  if (!str || typeof str !== "string") return null;
  const cleanStr = str.toLowerCase().replace(/,/g, "").replace(/rs\.?\s*/g, "").replace(/₹\s*/g, "").trim();
  if (cleanStr === "" || cleanStr.includes("no min") || cleanStr.includes("no max") || cleanStr.includes("any")) {
    return null;
  }

  if (cleanStr.includes("crore") || cleanStr.includes("cr")) {
    const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
    return num * 10000000;
  }
  if (cleanStr.includes("lakh") || cleanStr.includes("l")) {
    const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
    return num * 100000;
  }
  if (cleanStr.includes("thousand") || cleanStr.includes("k")) {
    const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
    return num * 1000;
  }
  const num = parseFloat(cleanStr.match(/[\d.]+/)?.[0] || "0");
  return isNaN(num) || num === 0 ? null : num;
};

// Returns max budget options strictly greater than min budget
export const getFilteredMaxBudgets = (minBudgetString) => {
  const minVal = parseRupeeValue(minBudgetString);
  if (minVal === null) return BUDGET_OPTIONS;
  return BUDGET_OPTIONS.filter((opt) => opt.value > minVal);
};

// Returns min budget options strictly less than max budget
export const getFilteredMinBudgets = (maxBudgetString) => {
  const maxVal = parseRupeeValue(maxBudgetString);
  if (maxVal === null) return BUDGET_OPTIONS;
  return BUDGET_OPTIONS.filter((opt) => opt.value < maxVal);
};

// Registration Form investment range options
export const REGISTRATION_INVESTMENT_OPTIONS = [
  "Rs. 10,000 - 50,000",
  "Rs. 50,000 - 2 Lakh",
  "Rs. 2 Lakh - 5 Lakh",
  "Rs. 5 Lakh - 10 Lakh",
  "Rs. 10 Lakh - 20 Lakh",
  "Rs. 20 Lakh - 30 Lakh",
  "Rs. 30 Lakh - 50 Lakh",
  "Rs. 50 Lakh - 1 Crore",
  "Rs. 1 Crore - 2 Crore",
  "Rs. 2 Crore - 5 Crore",
  "Above Rs. 5 Crore"
];

// Returns max investment options starting from selected min range
export const getFilteredMaxLimits = (selectedMinRange) => {
  if (!selectedMinRange) return REGISTRATION_INVESTMENT_OPTIONS;
  const rangeIndex = REGISTRATION_INVESTMENT_OPTIONS.indexOf(selectedMinRange);
  if (rangeIndex === -1) return REGISTRATION_INVESTMENT_OPTIONS;
  return REGISTRATION_INVESTMENT_OPTIONS.slice(rangeIndex);
};
