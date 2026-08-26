const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI missing in .env file');
  process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['brand', 'investor', 'admin'], default: 'brand' },
  name: { type: String, trim: true },
  phone: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

// Brand Schema
const BrandSchema = new mongoose.Schema({
  id: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  category: { type: String, required: true, trim: true },
  sector: { type: String, trim: true, default: 'General' },
  location: { type: String, trim: true, default: 'Delhi NCR' },
  masterFranchiseAvailable: { type: Boolean, default: true },
  masterInvestmentRange: { type: String, trim: true, default: 'Rs. 25 Lakhs - 50 Lakhs' },
  territoryOffered: { type: String, trim: true, default: 'State Level Exclusivity' },
  minInvestment: { type: Number, default: 1000000 },
  maxInvestment: { type: Number, default: 2000000 },
  pincode: { type: String, default: '110001', trim: true },
  investment_range: { type: String, required: true, trim: true },
  max_investment_limit: { type: String, required: true, trim: true },
  franchiseFee: { type: Number, default: 250000 },
  royaltyFee: { type: String, default: '5%' },
  areaRequired: { type: String, trim: true, default: '300 - 500 Sq. Ft.' },
  hq: { type: String, trim: true, default: 'Delhi NCR' },
  description: { type: String, trim: true },
  image: { type: String, default: '' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  featured: { type: Boolean, default: true },
  trainingSupport: { type: String, default: 'Yes' },
  agreement: { type: String, default: 'Yes' },
  website: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);

const CATEGORY_PAGES = [
  { url: 'https://franchiseroots.com/', name: 'Top Featured Franchises' },
  { url: 'https://franchiseroots.com/industry/automotive-franchise', name: 'Automotive' },
  { url: 'https://franchiseroots.com/industry/beauty-health-franchise', name: 'Beauty and Health' },
  { url: 'https://franchiseroots.com/industry/business-services-franchise', name: 'Business Services' },
  { url: 'https://franchiseroots.com/industry/dealers-distributors', name: 'Dealers & Distributors' },
  { url: 'https://franchiseroots.com/industry/education-franchise-opportunities', name: 'Education' },
  { url: 'https://franchiseroots.com/industry/fashion', name: 'Fashion' },
  { url: 'https://franchiseroots.com/industry/food-and-beverage', name: 'Food and Beverage' },
  { url: 'https://franchiseroots.com/industry/home-based-franchise', name: 'Home Based Business' },
  { url: 'https://franchiseroots.com/industry/hotel-travel-tourism', name: 'Hotel Travel & Tourism' },
  { url: 'https://franchiseroots.com/industry/industrial-machinery-manufacturing', name: 'Industrial Machinery & Manufacturing' },
  { url: 'https://franchiseroots.com/industry/retail-franchise', name: 'Retail' },
  { url: 'https://franchiseroots.com/industry/sports-fitness-entertainment', name: 'Sports & Fitness' },
  { url: 'https://franchiseroots.com/industry/top-businesses', name: 'Top Businesses' }
];

function formatInvestmentDetails(invStr) {
  let investment_range = 'Rs. 10 Lakh - 20 Lakh';
  let minInvestment = 1000000;
  let maxInvestment = 2000000;

  if (!invStr) {
    return { investment_range, minInvestment, maxInvestment };
  }

  const str = invStr.toLowerCase();

  if (str.includes('10 k') || str.includes('10000') || str.includes('50 k')) {
    investment_range = 'Rs. 10,000 - 50,000';
    minInvestment = 10000;
    maxInvestment = 50000;
  } else if (str.includes('50 k') || str.includes('50000') || str.includes('2 lac')) {
    investment_range = 'Rs. 50,000 - 2 Lakh';
    minInvestment = 50000;
    maxInvestment = 200000;
  } else if (str.includes('2 lac') || str.includes('200000') || str.includes('5 lac')) {
    investment_range = 'Rs. 2 Lakh - 5 Lakh';
    minInvestment = 200000;
    maxInvestment = 500000;
  } else if (str.includes('5 lac') || str.includes('500000') || str.includes('10 lac')) {
    investment_range = 'Rs. 5 Lakh - 10 Lakh';
    minInvestment = 500000;
    maxInvestment = 1000000;
  } else if (str.includes('10 lac') || str.includes('1000000') || str.includes('20 lac')) {
    investment_range = 'Rs. 10 Lakh - 20 Lakh';
    minInvestment = 1000000;
    maxInvestment = 2000000;
  } else if (str.includes('20 lac') || str.includes('2000000') || str.includes('30 lac')) {
    investment_range = 'Rs. 20 Lakh - 30 Lakh';
    minInvestment = 2000000;
    maxInvestment = 3000000;
  } else if (str.includes('30 lac') || str.includes('3000000') || str.includes('50 lac')) {
    investment_range = 'Rs. 30 Lakh - 50 Lakh';
    minInvestment = 3000000;
    maxInvestment = 5000000;
  } else if (str.includes('50 lac') || str.includes('5000000') || str.includes('1 cr')) {
    investment_range = 'Rs. 50 Lakh - 1 Crore';
    minInvestment = 5000000;
    maxInvestment = 10000000;
  } else if (str.includes('1 cr') || str.includes('10000000') || str.includes('2 cr')) {
    investment_range = 'Rs. 1 Crore - 2 Crore';
    minInvestment = 10000000;
    maxInvestment = 20000000;
  } else if (str.includes('2 cr') || str.includes('20000000') || str.includes('5 cr')) {
    investment_range = 'Rs. 2 Crore - 5 Crore';
    minInvestment = 20000000;
    maxInvestment = 50000000;
  } else if (str.includes('above') || str.includes('50000000')) {
    investment_range = 'Above Rs. 5 Crore';
    minInvestment = 50000000;
    maxInvestment = 100000000;
  }

  return { investment_range, minInvestment, maxInvestment };
}

function parseBrandsFromCategoryHtml(html, categoryName) {
  const brands = [];
  const blocks = html.split(/<div[^>]*class=["'][^"']*(?:b-blog-preview|view-sixth|grid-item|col-md-|col-sm-)[^"']*["']/gi);

  for (const block of blocks) {
    const linkMatch = block.match(/href=["'](?:\.\.\/)?business\/([^"']+)["']/i);
    if (!linkMatch) continue;

    // Image
    const imgMatch = block.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    let image = imgMatch ? imgMatch[1] : '';
    if (image && !image.startsWith('http')) {
      image = 'https://franchiseroots.com/' + image.replace(/^\.\.\//, '');
    }

    // Title
    const titleMatch = block.match(/<p[^>]*class=["'][^"']*title[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
                       block.match(/alt=["']([^"']+)["']/i) ||
                       block.match(/<a[^>]*href=["'][^"']*business\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/i);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s*-\s*Franchise/gi, '').trim() : '';
    if (!title || title.length < 2 || title.toLowerCase() === 'read more') continue;

    // Investment
    const invMatch = block.match(/Investment:\s*<\/strong>\s*([^<]+)/i) ||
                     block.match(/Investment[:\s]*([^<\n]+)/i);
    const invStr = invMatch ? invMatch[1].trim() : '';
    const { investment_range, minInvestment, maxInvestment } = formatInvestmentDetails(invStr);

    // Space
    const spaceMatch = block.match(/Space:\s*<\/strong>\s*([^<]+)/i);
    let areaRequired = spaceMatch ? spaceMatch[1].trim() : '300 - 500 Sq. Ft.';

    // Expansion / HQ
    const expMatch = block.match(/Expansion:\s*<\/strong>\s*([^<]+)/i);
    let hq = expMatch && expMatch[1].trim() ? expMatch[1].trim() : 'Delhi NCR';

    const slug = linkMatch[1];
    const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const email = `${cleanSlug}_${randomDigits}@yopmail.com`;

    brands.push({
      slug,
      name: title,
      company: `${title} Pvt. Ltd.`,
      category: categoryName,
      sector: 'General',
      hq: hq || 'Delhi NCR',
      location: hq || 'Delhi NCR',
      pincode: '110001',
      investment_range,
      max_investment_limit: investment_range,
      minInvestment,
      maxInvestment,
      franchiseFee: Math.round(minInvestment * 0.25),
      royaltyFee: '5%',
      areaRequired,
      description: `${title} is a premier business franchise listed on FranchiseRoots.com. Offering high ROI, complete operational guidance, staff training, and brand marketing support across India.`,
      image: image || 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=400',
      email,
      password: 'Franchise@123#',
      phone: '98154' + Math.floor(10000 + Math.random() * 90000),
      status: 'Approved',
      featured: true,
      trainingSupport: 'Yes',
      agreement: 'Yes',
      website: `https://www.${cleanSlug}.com`,
      createdAt: new Date()
    });
  }

  return brands;
}

async function scrapeAndSeed() {
  console.log('--- STARTING ENHANCED FRANCHISEROOTS BRAND SCRAPER & MONGODB SEEDER ---');
  console.log('Connecting to MongoDB Atlas...');

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log('Successfully connected to MongoDB Atlas.');

  const allScrapedBrands = [];
  const processedNames = new Set();

  for (const page of CATEGORY_PAGES) {
    const urlsToTry = [page.url, page.url + '.html'];
    let fetched = false;

    for (const targetUrl of urlsToTry) {
      if (fetched) break;
      try {
        console.log(`Fetching: ${targetUrl}`);
        const res = await fetch(targetUrl);
        if (res.ok) {
          const html = await res.text();
          const extracted = parseBrandsFromCategoryHtml(html, page.name);
          if (extracted.length > 0) {
            console.log(`Successfully extracted ${extracted.length} brands from ${targetUrl}`);
            for (const b of extracted) {
              if (!processedNames.has(b.name)) {
                processedNames.add(b.name);
                allScrapedBrands.push(b);
              }
            }
            fetched = true;
          }
        }
      } catch (err) {
        // Continue to next URL format
      }
    }
  }

  console.log(`\nTotal unique brands scraped across all categories: ${allScrapedBrands.length}`);

  if (allScrapedBrands.length === 0) {
    console.error('No brands found. Exiting.');
    process.exit(1);
  }

  console.log('\nProcessing brand insertion into MongoDB User and Brand collections...');

  const defaultPassword = 'Franchise@123#';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  let insertedCount = 0;
  let skippedCount = 0;
  const jsonBrandArray = [];

  for (const rawBrand of allScrapedBrands) {
    try {
      // 1. Create or Find User
      const emailLower = rawBrand.email.toLowerCase();
      let user = await User.findOne({ email: emailLower });
      if (!user) {
        user = await User.create({
          email: emailLower,
          password: hashedPassword,
          role: 'brand',
          name: rawBrand.name,
          phone: rawBrand.phone
        });
      }

      // 2. Check if brand exists in MongoDB
      const brandId = `brand-${rawBrand.slug}`;
      let brandObj = await Brand.findOne({ $or: [{ id: brandId }, { name: rawBrand.name }] });

      if (!brandObj) {
        brandObj = await Brand.create({
          id: brandId,
          name: rawBrand.name,
          company: rawBrand.company,
          category: rawBrand.category,
          sector: rawBrand.sector,
          location: rawBrand.location,
          masterFranchiseAvailable: rawBrand.masterFranchiseAvailable,
          masterInvestmentRange: rawBrand.masterInvestmentRange,
          territoryOffered: rawBrand.territoryOffered,
          minInvestment: rawBrand.minInvestment,
          maxInvestment: rawBrand.maxInvestment,
          pincode: rawBrand.pincode,
          investment_range: rawBrand.investment_range,
          max_investment_limit: rawBrand.max_investment_limit,
          franchiseFee: rawBrand.franchiseFee,
          royaltyFee: rawBrand.royaltyFee,
          areaRequired: rawBrand.areaRequired,
          hq: rawBrand.hq,
          description: rawBrand.description,
          image: rawBrand.image,
          user: user._id,
          phone: rawBrand.phone,
          status: 'Approved',
          featured: true,
          trainingSupport: rawBrand.trainingSupport,
          agreement: rawBrand.agreement,
          website: rawBrand.website,
          createdAt: new Date()
        });
        insertedCount++;
        console.log(`[SAVED TO MONGODB] ${rawBrand.name} | Email: ${emailLower} | Pass: ${defaultPassword}`);
      } else {
        skippedCount++;
        console.log(`[EXISTING IN MONGODB] ${rawBrand.name}`);
      }

      // Build JSON record
      jsonBrandArray.push({
        id: brandObj.id || `brand-${brandObj._id}`,
        name: brandObj.name,
        company: brandObj.company,
        category: brandObj.category,
        minInvestment: brandObj.minInvestment,
        maxInvestment: brandObj.maxInvestment,
        investment_range: brandObj.investment_range,
        max_investment_limit: brandObj.max_investment_limit,
        franchiseFee: brandObj.franchiseFee,
        royaltyFee: brandObj.royaltyFee,
        areaRequired: brandObj.areaRequired,
        hq: brandObj.hq,
        description: brandObj.description,
        image: brandObj.image,
        email: emailLower,
        password: defaultPassword,
        phone: brandObj.phone,
        status: 'Approved',
        featured: true,
        trainingSupport: brandObj.trainingSupport,
        agreement: brandObj.agreement,
        website: brandObj.website,
        createdAt: brandObj.createdAt
      });
    } catch (err) {
      console.error(`Failed to insert brand ${rawBrand.name}:`, err.message);
    }
  }

  // Update data.json static fallback file
  try {
    const dataFilePath = path.join(process.cwd(), 'src/lib/data.json');
    let existingData = [];
    if (fs.existsSync(dataFilePath)) {
      existingData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    }

    const mergedMap = new Map();
    for (const item of existingData) {
      mergedMap.set(item.name, item);
    }
    for (const item of jsonBrandArray) {
      mergedMap.set(item.name, item);
    }

    const finalData = Array.from(mergedMap.values());
    fs.writeFileSync(dataFilePath, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`\nUpdated src/lib/data.json with ${finalData.length} total brands.`);
  } catch (err) {
    console.error('Error updating data.json file:', err.message);
  }

  console.log('\n--- SEEDING COMPLETED ---');
  console.log(`Inserted New Brands: ${insertedCount}`);
  console.log(`Skipped/Existing Brands: ${skippedCount}`);
  console.log(`All brand user accounts created with password: ${defaultPassword}`);
  process.exit(0);
}

scrapeAndSeed();
