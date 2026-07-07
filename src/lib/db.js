import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/lib/data.json");
const investorsFilePath = path.join(process.cwd(), "src/lib/investors.json");

// Ensure files exist
function initDB() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(investorsFilePath)) {
    fs.writeFileSync(investorsFilePath, JSON.stringify([], null, 2), "utf8");
  }
}

export function getBrands() {
  initDB();
  try {
    const fileContent = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading brands:", error);
    return [];
  }
}

export function saveBrand(brand) {
  initDB();
  try {
    const brands = getBrands();
    const newBrand = {
      id: brand.id || `brand-${Date.now()}`,
      status: brand.status || "Pending",
      featured: brand.featured || false,
      createdAt: brand.createdAt || new Date().toISOString(),
      ...brand
    };
    brands.push(newBrand);
    fs.writeFileSync(dataFilePath, JSON.stringify(brands, null, 2), "utf8");
    return newBrand;
  } catch (error) {
    console.error("Error saving brand:", error);
    throw error;
  }
}

export function updateBrand(id, updatedFields) {
  initDB();
  try {
    const brands = getBrands();
    const index = brands.findIndex(b => b.id === id);
    if (index === -1) return null;

    brands[index] = {
      ...brands[index],
      ...updatedFields
    };

    fs.writeFileSync(dataFilePath, JSON.stringify(brands, null, 2), "utf8");
    return brands[index];
  } catch (error) {
    console.error("Error updating brand:", error);
    throw error;
  }
}

export function deleteBrand(id) {
  initDB();
  try {
    let brands = getBrands();
    const beforeLength = brands.length;
    brands = brands.filter(b => b.id !== id);
    if (brands.length === beforeLength) return false;

    fs.writeFileSync(dataFilePath, JSON.stringify(brands, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw error;
  }
}

export function getInvestors() {
  initDB();
  try {
    const fileContent = fs.readFileSync(investorsFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading investors:", error);
    return [];
  }
}

export function saveInvestor(investor) {
  initDB();
  try {
    const investors = getInvestors();
    const newInvestor = {
      id: `investor-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...investor
    };
    investors.push(newInvestor);
    fs.writeFileSync(investorsFilePath, JSON.stringify(investors, null, 2), "utf8");
    return newInvestor;
  } catch (error) {
    console.error("Error saving investor:", error);
    throw error;
  }
}
