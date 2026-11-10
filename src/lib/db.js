import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Brand from "@/models/Brand";
import Investor from "@/models/Investor";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Blog from "@/models/Blog";
import Service from "@/models/Service";
import { DEFAULT_BLOGS, DEFAULT_SERVICES } from "./defaultContent";
import Advertisement from "@/models/Advertisement";
import Log from "@/models/Log";
import LoginOtp from "@/models/LoginOtp";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateBrandSeoData } from "./brandSeoGenerator";
import {
  sendBrandRegistrationEmail,
  sendInvestorRegistrationEmail,
  sendBrandApprovalEmail,
  sendBrandDeclineEmail,
  sendBrandAssignedToInvestorsEmail,
  sendInvestorAssignedBrandEmail,
  sendAdminNewBrandNotification,
  sendAdminNewInvestorNotification
} from "./email";


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, promiseStartedAt: 0, seeded: false, seedPromise: null };
}

// Completely disable Mongoose query buffering and autoIndex globally
// This ensures queries never freeze for 10,000ms if a connection drops
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);

export async function dbConnect() {
  const readyState = mongoose.connection ? mongoose.connection.readyState : (cached.conn?.connection?.readyState || 0);
  if (readyState === 1) {
    return mongoose;
  }
  if (cached.conn && readyState === 1) {
    return cached.conn;
  }

  // Mongoose state 2 means the connection is in-flight.
  if (readyState === 2 && cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (error) {
      cached.conn = null;
      cached.promise = null;
      cached.promiseStartedAt = 0;
      throw error;
    }
  }

  if (readyState === 0 || readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.promise && cached.promiseStartedAt && Date.now() - cached.promiseStartedAt > 10000) {
    cached.promise = null;
    cached.promiseStartedAt = 0;
  }

  if (!cached.promise) {
    cached.promiseStartedAt = Date.now();
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 60000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.seeded) {
      cached.seeded = true;
      if (!cached.seedPromise) {
        cached.seedPromise = seedDatabase().catch((error) => {
          console.error("Background database seed failed:", error);
        });
      }
    }
  } catch (e) {
    cached.conn = null;
    cached.promise = null;
    cached.promiseStartedAt = 0;
    throw e;
  }

  return cached.conn;
}

export const connectToDatabase = dbConnect;

export async function resetDatabaseConnection() {
  try {
    if (cached.conn?.connection) {
      await cached.conn.connection.close(false);
    }
  } catch (error) {
    // The connection may already be closed; reset the cache regardless.
  }
  cached.conn = null;
  cached.promise = null;
  cached.promiseStartedAt = 0;
}

async function connectForAuth() {
  try {
    return await dbConnect();
  } catch (firstError) {
    console.warn("Auth database connection failed; resetting and retrying once:", firstError?.message || firstError);
    await resetDatabaseConnection();
    return dbConnect();
  }
}

// A long-running Next dev process can retain a Mongoose model while its
// underlying socket has gone stale. Retry one database operation after a
// clean reconnect so registration does not fail until the server is restarted.
async function withDatabaseRetry(operation, label) {
  try {
    return await operation();
  } catch (firstError) {
    console.warn(`${label} failed; reconnecting once:`, firstError?.message || firstError);
    await resetDatabaseConnection();
    await dbConnect();
    return operation();
  }
}

async function seedDatabase() {
  try {
    // Ensure default Admin user exists in Admin collection
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "admin",
        password: "admin123"
      });
      console.log("Seeded default admin user to MongoDB.");
    }

    // Ensure default Admin user exists in User collection
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        email: "admin@franchiseroots.com",
        username: "admin",
        password: hashedAdminPassword,
        role: "admin",
        name: "Administrator"
      });
    }
  } catch (error) {
    console.error("Error during DB initialization:", error);
  }
}


let publicBrandsCache = null;
let publicBrandsCacheTime = 0;
const PUBLIC_BRANDS_CACHE_TTL = 30 * 1000; // 30 seconds

export function clearPublicBrandsCache() {
  publicBrandsCache = null;
  publicBrandsCacheTime = 0;
}

export async function getPublicApprovedBrands() {
  if (publicBrandsCache && Date.now() - publicBrandsCacheTime < PUBLIC_BRANDS_CACHE_TTL) {
    return publicBrandsCache;
  }
  await dbConnect();
  try {
    const brands = await Brand.find({ status: "Approved" })
      .select("-password -__v -seoData.schemaData")
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    const formatted = brands.map(b => ({
      ...b,
      id: b.id || b._id.toString(),
      name: b.name || "Unnamed Brand",
      company: b.company || b.name || "",
      category: b.category || "General",
      status: "Approved",
      minInvestment: b.minInvestment || 0,
      maxInvestment: b.maxInvestment || 0,
      investment_range: b.investment_range || "Contact for Investment",
      max_investment_limit: b.max_investment_limit || b.investment_range || "Contact for Investment",
      image: b.image || (Array.isArray(b.images) && b.images[0]) || "",
      images: Array.isArray(b.images) && b.images.length > 0 ? b.images : (b.image ? [b.image] : [])
    }));

    publicBrandsCache = formatted;
    publicBrandsCacheTime = Date.now();
    return formatted;
  } catch (error) {
    console.error("Error reading public approved brands from MongoDB:", error);
    throw error;
  }
}

export async function getBrands() {
  await dbConnect();
  try {
    const [brands, investors] = await Promise.all([
      Brand.find({}).populate('user').sort({ createdAt: -1 }).lean(),
      Investor.find({}).select('brandId brandName assignedBrands status investmentStatus').lean()
    ]);
    return brands.map(b => {
      const userEmail = (b.user && typeof b.user === 'object' && b.user.email) ? b.user.email : null;
      const email = userEmail || b.email || "";
      const brandIds = [b.id, b._id?.toString()].filter(Boolean).map(String);
      const brandName = String(b.name || '').trim().toLowerCase();
      const relatedInvestors = investors.filter(inv => {
        const directId = inv.brandId && brandIds.includes(String(inv.brandId));
        const directName = !inv.brandId && inv.brandName && String(inv.brandName).trim().toLowerCase() === brandName;
        const assigned = Array.isArray(inv.assignedBrands) && inv.assignedBrands.some(id => brandIds.includes(String(id)));
        return directId || directName || assigned;
      });
      const assignedInvestors = relatedInvestors.filter(inv => Array.isArray(inv.assignedBrands) && inv.assignedBrands.some(id => brandIds.includes(String(id))));
      return {
        ...b,
        id: b.id || b._id.toString(),
        name: b.name || "Unnamed Brand",
        company: b.company || b.name || "",
        category: b.category || "General",
        status: b.status || "Pending",
        email: email,
        investorsCount: relatedInvestors.length,
        approvedLeadsCount: relatedInvestors.filter(inv => inv.status === 'Approved').length,
        assignedInvestorsCount: assignedInvestors.length,
        investedInvestorsCount: relatedInvestors.filter(inv => inv.investmentStatus === 'Invested' || inv.investmentStatus === 'Closed').length,
        investedAmount: relatedInvestors
          .filter(inv => inv.investmentStatus === 'Invested' || inv.investmentStatus === 'Closed')
          .reduce((total, inv) => total + (Number(inv.investmentAmount) || 0), 0)
      };
    });
  } catch (error) {
    console.error("Error reading brands from MongoDB:", error);
    throw error;
  }
}

export async function getBrandById(id) {
  await dbConnect();
  try {
    let brand = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      brand = await Brand.findById(id).populate('user').lean();
    }
    if (!brand) {
      brand = await Brand.findOne({ id: id }).populate('user').lean();
    }
    // Canonical SEO URLs use id-slug, while the app still resolves the stable id.
    if (!brand && id.includes("-")) {
      const idPrefix = id.startsWith("brand-") ? id.split("-").slice(0, 2).join("-") : id.split("-")[0];
      if (mongoose.Types.ObjectId.isValid(idPrefix)) {
        brand = await Brand.findById(idPrefix).populate('user').lean();
      }
      if (!brand) {
        brand = await Brand.findOne({ id: new RegExp(`^${idPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:-|$)`) }).populate('user').lean();
      }
    }
    if (!brand) return null;
    const finalBrand = {
      ...brand,
      id: brand.id || brand._id.toString(),
      email: brand.user ? brand.user.email : brand.email
    };

    return finalBrand;
  } catch (error) {
    console.error("Error fetching brand by ID:", error);
    return null;
  }
}


export async function saveBrand(brandData) {
  await dbConnect();
  try {
    const emailLower = (brandData.email || "").toLowerCase().trim();
    if (!emailLower) {
      throw new Error("Email is required for brand registration.");
    }

    const rawPassword = brandData.password || "password123";
    let userObj = await withDatabaseRetry(
      () => User.findOne({ email: emailLower }),
      "Brand user lookup"
    );

    if (!userObj) {
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      userObj = await User.create({
        email: emailLower,
        password: hashedPassword,
        role: 'brand',
        name: brandData.name,
        phone: brandData.phone || ""
      });
    }

    const id = brandData.id || `brand-${Date.now()}`;
    const autoSeo = generateBrandSeoData(brandData);

    const brandPayload = {
      ...brandData,
      seoData: (brandData.seoData && brandData.seoData.seoTitle) ? brandData.seoData : autoSeo.seoData,
      faqs: (Array.isArray(brandData.faqs) && brandData.faqs.length > 0) ? brandData.faqs : autoSeo.faqs,
      schemaData: (brandData.schemaData && Object.keys(brandData.schemaData).length > 0) ? brandData.schemaData : autoSeo.schemaData,
      seoStatus: brandData.seoStatus || "Approved",
      email: emailLower,
      user: userObj._id,
      id,
      status: brandData.status || "Pending",
      featured: brandData.featured || false,
      createdAt: brandData.createdAt || new Date()
    };
    delete brandPayload.password;

    const brand = new Brand(brandPayload);
    const saved = await brand.save();
    clearPublicBrandsCache();

    const obj = await Brand.findById(saved._id).populate('user').lean();
    const returnObj = {
      ...obj,
      id: obj.id || obj._id.toString(),
      email: obj.user ? obj.user.email : emailLower
    };

    // Trigger registration email
    sendBrandRegistrationEmail(returnObj).catch(err =>
      console.error("Failed to send brand registration email:", err)
    );

    // Trigger admin notification email
    sendAdminNewBrandNotification(returnObj).catch(err =>
      console.error("Failed to send admin brand notification email:", err)
    );

    return returnObj;
  } catch (error) {
    console.error("Error saving brand to MongoDB:", error);
    throw error;
  }
}

export async function updateBrand(id, updatedFields, customMessage = "", adminInfo = {}) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const existingBrand = await Brand.findOne(query);
    if (existingBrand && existingBrand.user) {
      const userUpdate = {};
      if (updatedFields.name) userUpdate.name = updatedFields.name;
      if (updatedFields.phone) userUpdate.phone = updatedFields.phone;
      if (updatedFields.email) userUpdate.email = updatedFields.email.toLowerCase();
      if (Object.keys(userUpdate).length > 0) {
        const userId = typeof existingBrand.user === 'object' ? existingBrand.user._id : existingBrand.user;
        await User.updateOne({ _id: userId }, { $set: userUpdate }).catch(err =>
          console.error("User update failed during brand update:", err)
        );
      }
    }

    const payload = { ...updatedFields };
    delete payload._id;
    delete payload.id;
    delete payload.password;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;

    if (updatedFields.email) {
      payload.email = updatedFields.email.toLowerCase();
    }

    const updated = await withDatabaseRetry(
      () => Brand.findOneAndUpdate(
        query,
        { $set: payload },
        { returnDocument: 'after' }
      ).populate('user').lean(),
      "Brand update"
    );

    if (!updated) return null;
    clearPublicBrandsCache();

    const obj = {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: (updated.user && typeof updated.user === 'object' && updated.user.email) ? updated.user.email : (updated.email || "")
    };

    // Trigger status change emails & audit logs
    if (updatedFields.status === "Approved") {
      const action = "BRAND_APPROVED";
      const desc = `Approved brand listing '${obj.name}'${customMessage ? `. Note: ${customMessage}` : ""}`;
      
      await createLog({
        panel: "admin",
        action,
        description: desc,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: obj.id,
        targetType: "Brand",
        details: { brandName: obj.name, customMessage }
      }).catch(err => console.error("Log creation error:", err));

      if (obj.email) {
        await createLog({
          panel: "brand",
          action,
          description: `Your brand listing '${obj.name}' was approved.${customMessage ? ` Note: ${customMessage}` : ""}`,
          userEmail: obj.email,
          userName: obj.name,
          targetId: obj.id,
          targetType: "Brand",
          details: { brandName: obj.name, customMessage }
        }).catch(err => console.error("Log creation error:", err));
      }

      sendBrandApprovalEmail(obj, customMessage).catch(err =>
        console.error("Failed to send brand approval email:", err)
      );
    } else if (updatedFields.status === "Declined" || updatedFields.status === "Rejected") {
      const action = "BRAND_DECLINED";
      const desc = `Declined brand listing '${obj.name}'${customMessage ? `. Reason: ${customMessage}` : ""}`;

      await createLog({
        panel: "admin",
        action,
        description: desc,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: obj.id,
        targetType: "Brand",
        details: { brandName: obj.name, customMessage }
      }).catch(err => console.error("Log creation error:", err));

      if (obj.email) {
        await createLog({
          panel: "brand",
          action,
          description: `Your brand listing '${obj.name}' was declined.${customMessage ? ` Reason: ${customMessage}` : ""}`,
          userEmail: obj.email,
          userName: obj.name,
          targetId: obj.id,
          targetType: "Brand",
          details: { brandName: obj.name, customMessage }
        }).catch(err => console.error("Log creation error:", err));
      }

      sendBrandDeclineEmail(obj, customMessage).catch(err =>
        console.error("Failed to send brand decline email:", err)
      );
    }

    return obj;
  } catch (error) {
    console.error("Error updating brand in MongoDB:", error);
    throw error;
  }
}

export async function deleteBrand(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const result = await withDatabaseRetry(
      () => Brand.deleteOne(query),
      "Brand delete"
    );
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting brand from MongoDB:", error);
    throw error;
  }
}

export async function getInvestors() {
  await dbConnect();
  try {
    const investors = await Investor.find({}).populate('user').sort({ createdAt: -1 }).lean();
    return investors.map(i => ({
      ...i,
      id: i.id || i._id.toString(),
      email: i.user ? i.user.email : i.email
    }));
  } catch (error) {
    console.error("Error reading investors from MongoDB:", error);
    throw error;
  }
}

export async function saveInvestor(investorData) {
  await dbConnect();
  try {
    const investorName = investorData.name || investorData.fullName || "Investor";
    const emailLower = (investorData.email || "").toLowerCase();
    let userObj = await withDatabaseRetry(
      () => User.findOne({ email: emailLower }),
      "Investor user lookup"
    );
    if (!userObj) {
      const rawPassword = investorData.password || "password123";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Save to User collection
      userObj = await User.create({
        email: emailLower,
        password: hashedPassword,
        role: 'investor',
        name: investorName,
        phone: investorData.phone || ""
      });
    }

    const id = investorData.id || `investor-${Date.now()}`;
    const pincode = investorData.pincode || "000000";
    const investment_range = investorData.investment_range || investorData.investmentCapacity || "Not Specified";
    const max_investment_limit = investorData.max_investment_limit || investorData.investmentCapacity || "Not Specified";
    const brandId = investorData.brandId || investorData.targetBrandId || null;
    const brandName = investorData.brandName || investorData.targetBrand || null;
    const category = investorData.category || investorData.interestedCategory || null;
    const preferredLocation = investorData.preferredLocation || investorData.city || "Not specified";
    const comments = investorData.comments || investorData.notes || "";
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    const status = validStatuses.includes(investorData.status) ? investorData.status : 'Pending';

    const investorPayload = {
      pincode,
      investment_range,
      max_investment_limit,
      ...investorData,
      name: investorName,
      email: emailLower,
      user: userObj._id,
      id,
      brandId,
      brandName,
      category,
      preferredLocation,
      comments,
      status,
      investorId: investorData.investorId || null,
      appliedAt: investorData.appliedAt || new Date(),
      createdAt: investorData.createdAt || new Date()
    };
    delete investorPayload.password;

    const investor = new Investor(investorPayload);
    const saved = await investor.save();

    const obj = await Investor.findById(saved._id).populate('user').lean();
    const returnObj = {
      ...obj,
      id: obj.id || obj._id.toString(),
      email: obj.user ? obj.user.email : investorData.email
    };

    // Trigger registration email
    sendInvestorRegistrationEmail(returnObj).catch(err =>
      console.error("Failed to send investor registration email:", err)
    );

    // Trigger admin notification email
    sendAdminNewInvestorNotification(returnObj).catch(err =>
      console.error("Failed to send admin investor notification email:", err)
    );

    return returnObj;
  } catch (error) {
    console.error("Error saving investor to MongoDB:", error);
    throw error;
  }
}

export async function assignBrandToInvestors(brandId, investorIds, customMessage = "", adminInfo = {}) {
  await dbConnect();
  try {
    // 1. Fetch the brand details
    const queryBrand = mongoose.Types.ObjectId.isValid(brandId)
      ? { $or: [{ _id: brandId }, { id: brandId }] }
      : { id: brandId };
    const rawBrand = await Brand.findOne(queryBrand).populate('user').lean();
    const brand = rawBrand ? {
      ...rawBrand,
      email: rawBrand.user ? rawBrand.user.email : rawBrand.email
    } : null;

    const storedBrandId = brand?.id || brand?._id?.toString() || brandId;

    // 2. Fetch previously assigned investors for this brand
    const prevAssignedInvestors = await Investor.find({
      assignedBrands: { $in: [brandId, brand?._id?.toString(), brand?.id].filter(Boolean) }
    }).populate('user').lean();
    const prevInvestorIds = new Set(prevAssignedInvestors.map(inv => inv.id || inv._id.toString()));

    // 3. Fetch selected new investor details
    const cleanInvestorIds = (investorIds || []).filter(Boolean);
    const queryInvestors = {
      $or: [
        { _id: { $in: cleanInvestorIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
        { id: { $in: cleanInvestorIds } }
      ]
    };
    const rawInvestors = cleanInvestorIds.length > 0
      ? await Investor.find(queryInvestors).populate('user').lean()
      : [];
    const selectedInvestors = rawInvestors.map(inv => ({
      ...inv,
      id: inv.id || inv._id.toString(),
      email: inv.user ? inv.user.email : inv.email
    }));
    const newInvestorIds = new Set(selectedInvestors.map(inv => inv.id));

    // 4. Remove brandId from all investors first
    await Investor.updateMany(
      { assignedBrands: { $in: [brandId, brand?._id?.toString(), brand?.id].filter(Boolean) } },
      { $pull: { assignedBrands: { $in: [brandId, brand?._id?.toString(), brand?.id].filter(Boolean) } } }
    );

    // 5. Add brandId to selected investors
    if (cleanInvestorIds.length > 0) {
      await Investor.updateMany(
        queryInvestors,
        { $addToSet: { assignedBrands: storedBrandId } }
      );
    }

    // 6. Identify newly assigned and unassigned/declined investors for logging
    const newlyAssigned = selectedInvestors.filter(inv => !prevInvestorIds.has(inv.id));
    const unassigned = prevAssignedInvestors
      .map(inv => ({ ...inv, id: inv.id || inv._id.toString(), email: inv.user ? inv.user.email : inv.email }))
      .filter(inv => !newInvestorIds.has(inv.id));

    const adminEmail = adminInfo.email || "admin@franchiseroots.com";
    const adminName = adminInfo.name || "Administrator";

    for (const inv of newlyAssigned) {
      const desc = `Assigned investor lead '${inv.name}' to brand '${brand ? brand.name : brandId}'.${customMessage ? ` Message: ${customMessage}` : ""}`;
      await createLog({
        panel: "admin",
        action: "INVESTOR_ASSIGNED_TO_BRAND",
        description: desc,
        userEmail: adminEmail,
        userName: adminName,
        targetId: inv.id,
        targetType: "Investor",
        details: { brandId, brandName: brand?.name, investorName: inv.name, customMessage }
      }).catch(err => console.error("Log error:", err));

      if (inv.email) {
        await createLog({
          panel: "investor",
          action: "INVESTOR_ASSIGNED_TO_BRAND",
          description: `Assigned and matched to brand '${brand ? brand.name : brandId}'.${customMessage ? ` Message: ${customMessage}` : ""}`,
          userEmail: inv.email,
          userName: inv.name,
          targetId: inv.id,
          targetType: "Investor",
          details: { brandId, brandName: brand?.name, customMessage }
        }).catch(err => console.error("Log error:", err));
      }
    }

    for (const inv of unassigned) {
      const desc = `Declined/Unassigned investor lead '${inv.name}' from brand '${brand ? brand.name : brandId}'.${customMessage ? ` Message: ${customMessage}` : ""}`;
      await createLog({
        panel: "admin",
        action: "INVESTOR_DECLINED_FROM_BRAND",
        description: desc,
        userEmail: adminEmail,
        userName: adminName,
        targetId: inv.id,
        targetType: "Investor",
        details: { brandId, brandName: brand?.name, investorName: inv.name, customMessage }
      }).catch(err => console.error("Log error:", err));

      if (inv.email) {
        await createLog({
          panel: "investor",
          action: "INVESTOR_DECLINED_FROM_BRAND",
          description: `Declined/Unassigned from brand '${brand ? brand.name : brandId}'.${customMessage ? ` Message: ${customMessage}` : ""}`,
          userEmail: inv.email,
          userName: inv.name,
          targetId: inv.id,
          targetType: "Investor",
          details: { brandId, brandName: brand?.name, customMessage }
        }).catch(err => console.error("Log error:", err));
      }
    }

    // 7. Send emails
    if (brand && selectedInvestors.length > 0) {
      sendBrandAssignedToInvestorsEmail(brand, selectedInvestors, customMessage).catch(err =>
        console.error("Failed to send brand assignment email to brand owner:", err)
      );

      selectedInvestors.forEach(inv => {
        sendInvestorAssignedBrandEmail(inv, brand, customMessage).catch(err =>
          console.error(`Failed to send brand assignment email to investor ${inv.email}:`, err)
        );
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning brand to investors:", error);
    throw error;
  }
}

export async function getAdmins() {
  await dbConnect();
  try {
    let admins = await Admin.find({}).lean();
    if (admins.length === 0) {
      await Admin.create({
        username: "admin",
        password: "admin123"
      });
      admins = await Admin.find({}).lean();
      console.log("Seeded default admin user to MongoDB.");
    }
    return admins.map(a => ({
      ...a,
      id: a.id || a._id.toString()
    }));
  } catch (error) {
    console.error("Error reading admins from MongoDB:", error);
    return [];
  }
}

export async function loginUser(identifier, password) {
  try {
    await connectForAuth();
    const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
    const normalizedPhone = normalizedIdentifier.replace(/\D/g, "");
    if (!normalizedIdentifier || !password) {
      return { success: false, message: "Invalid email/username or password." };
    }

    const query = {
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
        ...(normalizedPhone.length >= 10 ? [{ phone: normalizedPhone }] : [])
      ]
    };
    const user = await User.findOne(query).lean();

    // Backward compatibility for the original Admin collection. Some local
    // installations have the admin credentials there instead of User.
    const tryLegacyAdminLogin = async () => {
      const legacyUsername = normalizedIdentifier === "admin@franchiseroots.com"
        ? "admin"
        : normalizedIdentifier;
      const legacyAdmin = await Admin.findOne({ username: legacyUsername }).lean();
      if (!legacyAdmin) return null;
      let legacyMatch = false;
      try { legacyMatch = await bcrypt.compare(password, legacyAdmin.password || ""); } catch { legacyMatch = false; }
      if (!legacyMatch && legacyAdmin.password === password) legacyMatch = true;
      if (!legacyMatch) return null;
      return {
        success: true,
        user: {
          id: legacyAdmin.id || legacyAdmin._id.toString(),
          email: "admin@franchiseroots.com",
          username: legacyAdmin.username,
          role: "admin",
          name: "Administrator",
          phone: ""
        }
      };
    };

    if (!user) {
      const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
      if (normalizedIdentifier === "admin@franchiseroots.com" && password === defaultAdminPassword) {
        return {
          success: true,
          user: {
            id: "admin-local-fallback",
            email: "admin@franchiseroots.com",
            username: "admin",
            role: "admin",
            name: "Administrator",
            phone: ""
          }
        };
      }
      return (await tryLegacyAdminLogin()) || { success: false, message: "Invalid email/username or password." };
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password || "");
    } catch {
      isMatch = false;
    }

    // Migrate very old accounts that may still contain a legacy plaintext
    // password. New registrations always store bcrypt hashes.
    if (!isMatch && user.password === password) {
      isMatch = true;
      const migratedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ _id: user._id }, { $set: { password: migratedPassword } });
    }

    if (!isMatch) {
      return (await tryLegacyAdminLogin()) || { success: false, message: "Invalid email/username or password." };
    }

    // Retrieve corresponding ID if brand or investor
    let profileId = user._id.toString();
    if (user.role === 'brand') {
      const brand = await Brand.findOne({ $or: [{ user: user._id }, { email: user.email.toLowerCase() }] }).lean();
      if (brand) profileId = brand.id || brand._id.toString();
    } else if (user.role === 'investor') {
      const investor = await Investor.findOne({ $or: [{ user: user._id }, { email: user.email.toLowerCase() }] }).lean();
      if (investor) profileId = investor.id || investor._id.toString();
    }

    return {
      success: true,
      user: {
        id: profileId,
        email: user.email,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    };
  } catch (error) {
    console.error("Error during login:", error);
    const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
    const defaultAdminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
    if (normalizedIdentifier === "admin@franchiseroots.com" && password === defaultAdminPassword) {
      return {
        success: true,
        user: {
          id: "admin-local-fallback",
          email: "admin@franchiseroots.com",
          username: "admin",
          role: "admin",
          name: "Administrator",
          phone: ""
        }
      };
    }
    return { success: false, message: "Server error during login." };
  }
}

function normalizeLoginIdentifier(identifier) {
  const value = String(identifier || "").trim().toLowerCase();
  return { value, phone: value.replace(/\D/g, "") };
}

async function findLoginUser(identifier) {
  const { value, phone } = normalizeLoginIdentifier(identifier);
  if (!value) return null;
  const user = await User.findOne({
    $or: [
      { email: value },
      { username: value },
      ...(phone.length >= 10 ? [{ phone }] : [])
    ]
  });
  if (user) return user;

  // Fallback to Admin collection for backward compatibility
  const legacyUsername = value === "admin@franchiseroots.com" ? "admin" : value;
  const legacyAdmin = await Admin.findOne({ username: legacyUsername }).lean();
  if (legacyAdmin) {
    return {
      _id: legacyAdmin._id,
      email: "admin@franchiseroots.com",
      username: legacyAdmin.username,
      role: "admin",
      name: "Administrator",
      phone: ""
    };
  }
  return null;
}

async function findLoginUserWithRetry(identifier) {
  try {
    return await findLoginUser(identifier);
  } catch (firstError) {
    console.warn("Login user lookup failed; reconnecting once:", firstError?.message || firstError);
    await resetDatabaseConnection();
    await connectForAuth();
    return findLoginUser(identifier);
  }
}

export async function requestLoginOtp(identifier) {
  await connectForAuth();
  const user = await findLoginUserWithRetry(identifier);
  if (!user) return { success: false, message: "No account found for this email or mobile number." };

  // Generate real secure 6-digit random OTP
  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  await LoginOtp.deleteMany({ user: user._id });
  await LoginOtp.create({
    user: user._id,
    codeHash,
    destination: user.email,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  // Dispatch OTP strictly to user's registered Gmail
  try {
    const { sendLoginOtpEmail } = await import("./email");
    await sendLoginOtpEmail({ email: user.email, code });
  } catch (mailError) {
    console.error("Failed to deliver Gmail OTP:", mailError);
    return {
      success: false,
      message: "Failed to send OTP to Gmail. Please check email service configuration or try again."
    };
  }

  const maskedEmail = user.email.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  return {
    success: true,
    destination: maskedEmail,
    message: `OTP sent successfully to your Gmail (${maskedEmail}). Please check your inbox.`
  };
}

export async function verifyLoginOtp(identifier, code) {
  await connectForAuth();
  const user = await findLoginUserWithRetry(identifier);
  const cleanCode = String(code || "").trim();
  if (!user || !/^\d{6}$/.test(cleanCode)) {
    return { success: false, message: "Please enter a valid 6-digit OTP." };
  }

  const otp = await LoginOtp.findOne({ user: user._id }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt.getTime() <= Date.now() || otp.attempts >= 5) {
    return { success: false, message: "OTP has expired or exceeded maximum attempts. Please request a new OTP." };
  }

  const codeHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
  if (codeHash !== otp.codeHash) {
    await LoginOtp.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
    return { success: false, message: "Invalid OTP. Please check your Gmail and try again." };
  }

  // OTP verified successfully - clear pending OTPs
  await LoginOtp.deleteMany({ user: user._id }).catch(() => {});

  const profileId = user._id.toString();
  let resolvedId = profileId;
  if (user.role === "brand") {
    const brand = await Brand.findOne({ $or: [{ user: user._id }, { email: user.email }] }).lean();
    if (brand) resolvedId = brand.id || brand._id.toString();
  } else if (user.role === "investor") {
    const investor = await Investor.findOne({ $or: [{ user: user._id }, { email: user.email }] }).lean();
    if (investor) resolvedId = investor.id || investor._id.toString();
  }

  return {
    success: true,
    user: {
      id: resolvedId,
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      phone: user.phone
    }
  };
}

export async function updateInvestor(id, updatedFields, customMessage = "", adminInfo = {}) {
  await dbConnect();
  try {
    const cleanId = String(id || "").trim();
    if (!cleanId) return null;
    const isObjectId = mongoose.Types.ObjectId.isValid(cleanId);
    const query = {
      $or: [
        ...(isObjectId ? [{ _id: new mongoose.Types.ObjectId(cleanId) }, { _id: cleanId }] : []),
        { id: cleanId },
        { investorId: cleanId }
      ]
    };
    const updatePayload = { ...updatedFields };
    delete updatePayload._id;
    delete updatePayload.id;
    delete updatePayload.createdAt;
    delete updatePayload.updatedAt;
    delete updatePayload.__v;
    if (updatePayload.brandId) {
      updatePayload.assignedBrands = [String(updatePayload.brandId)];
    }
    const updated = await withDatabaseRetry(
      () => Investor.findOneAndUpdate(
        query,
        { $set: updatePayload },
        { returnDocument: 'after', new: true }
      ).populate('user').lean(),
      "Investor update"
    );
    if (!updated) {
      console.warn("Investor lead not found with query:", query);
      return null;
    }
    const resObj = {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: (updated.user && typeof updated.user === 'object' && updated.user.email) ? updated.user.email : (updated.email || "")
    };
    if (updatedFields.investmentStatus === "Invested") {
      createLog({
        panel: "admin",
        action: "INVESTMENT_MARKED",
        description: `Marked investor lead '${resObj.name}' as invested${(updatedFields.brandName || resObj.brandName) ? ` in '${updatedFields.brandName || resObj.brandName}'` : ""}${updatedFields.investmentAmount ? ` for Rs. ${Number(updatedFields.investmentAmount).toLocaleString("en-IN")}` : ""}.`,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: resObj.id,
        targetType: "Investor",
        details: {
          investorName: resObj.name,
          investmentAmount: updatedFields.investmentAmount || 0,
          investmentDate: updatedFields.investmentDate || new Date(),
          notes: updatedFields.investmentNotes || ""
        }
      }).catch(err => console.error("Investment log error:", err));
      if (resObj.email) {
        createLog({
          panel: "investor",
          action: "INVESTMENT_MARKED",
          description: "Your investment was marked as completed by the admin.",
          userEmail: resObj.email,
          userName: resObj.name,
          targetId: resObj.id,
          targetType: "Investor",
          details: { investmentAmount: updatedFields.investmentAmount || 0 }
        }).catch(err => console.error("Investor investment log error:", err));
      }
    }
    return resObj;
  } catch (error) {
    console.error("Error updating investor in MongoDB:", error);
    throw error;
  }
}

async function _legacyUpdateInvestor(id, updatedFields, customMessage = "", adminInfo = {}) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const updated = await Investor.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { new: true }
    ).populate('user').lean();

    if (!updated) return null;
    clearPublicBrandsCache();

    const resObj = {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: updated.user ? updated.user.email : (updated.email || "")
    };

    if (updatedFields.investmentStatus === "Invested") {
      await createLog({
        panel: "admin",
        action: "INVESTMENT_MARKED",
        description: `Marked investor lead '${resObj.name}' as invested${(updatedFields.brandName || resObj.brandName) ? ` in '${updatedFields.brandName || resObj.brandName}'` : ""}${updatedFields.investmentAmount ? ` for Rs. ${Number(updatedFields.investmentAmount).toLocaleString("en-IN")}` : ""}.`,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: resObj.id,
        targetType: "Investor",
        details: {
          investorName: resObj.name,
          investmentAmount: updatedFields.investmentAmount || 0,
          investmentDate: updatedFields.investmentDate || new Date(),
          notes: updatedFields.investmentNotes || ""
        }
      }).catch(err => console.error("Investment log error:", err));

      if (resObj.email) {
        await createLog({
          panel: "investor",
          action: "INVESTMENT_MARKED",
          description: "Your investment was marked as completed by the admin.",
          userEmail: resObj.email,
          userName: resObj.name,
          targetId: resObj.id,
          targetType: "Investor",
          details: { investmentAmount: updatedFields.investmentAmount || 0 }
        }).catch(err => console.error("Investor investment log error:", err));
      }
    }

    if (updatedFields.status === "Approved") {
      const action = "INVESTOR_APPROVED";
      const desc = `Approved investor lead '${resObj.name}'${customMessage ? `. Note: ${customMessage}` : ""}`;
      
      await createLog({
        panel: "admin",
        action,
        description: desc,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: resObj.id,
        targetType: "Investor",
        details: { investorName: resObj.name, customMessage }
      }).catch(err => console.error("Log error:", err));

      if (resObj.email) {
        await createLog({
          panel: "investor",
          action,
          description: `Your investor lead profile was approved.${customMessage ? ` Note: ${customMessage}` : ""}`,
          userEmail: resObj.email,
          userName: resObj.name,
          targetId: resObj.id,
          targetType: "Investor",
          details: { customMessage }
        }).catch(err => console.error("Log error:", err));
      }
    } else if (updatedFields.status === "Rejected" || updatedFields.status === "Declined") {
      const action = "INVESTOR_DECLINED";
      const desc = `Declined investor lead '${resObj.name}'${customMessage ? `. Reason: ${customMessage}` : ""}`;

      await createLog({
        panel: "admin",
        action,
        description: desc,
        userEmail: adminInfo.email || "admin@franchiseroots.com",
        userName: adminInfo.name || "Administrator",
        targetId: resObj.id,
        targetType: "Investor",
        details: { investorName: resObj.name, customMessage }
      }).catch(err => console.error("Log error:", err));

      if (resObj.email) {
        await createLog({
          panel: "investor",
          action,
          description: `Your investor lead request was declined.${customMessage ? ` Reason: ${customMessage}` : ""}`,
          userEmail: resObj.email,
          userName: resObj.name,
          targetId: resObj.id,
          targetType: "Investor",
          details: { customMessage }
        }).catch(err => console.error("Log error:", err));
      }
    }

    return resObj;
  } catch (error) {
    console.error("Error updating investor in MongoDB:", error);
    throw error;
  }
}

export async function deleteInvestor(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { id }] }
      : { id };

    const result = await withDatabaseRetry(
      () => Investor.deleteOne(query),
      "Investor delete"
    );
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting investor from MongoDB:", error);
    throw error;
  }
}

export async function getBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    if (blogs.length === 0) return DEFAULT_BLOGS;
    return blogs.map(b => ({
      ...b,
      id: b._id.toString()
    }));
  } catch (error) {
    console.error("Error reading blogs from MongoDB:", error);
    return DEFAULT_BLOGS;
  }
}

export async function saveBlog(blogData) {
  await dbConnect();
  try {
    const blog = new Blog(blogData);
    const saved = await blog.save();
    const obj = saved.toObject();
    return {
      ...obj,
      id: obj._id.toString()
    };
  } catch (error) {
    console.error("Error saving blog to MongoDB:", error);
    throw error;
  }
}

export async function updateBlog(id, updatedFields) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Blog ID");

    const updated = await withDatabaseRetry(
      () => Blog.findOneAndUpdate(
        query,
        { $set: updatedFields },
        { new: true }
      ).lean(),
      "Blog update"
    );

    if (!updated) return null;
    clearPublicBrandsCache();

    return {
      ...updated,
      id: updated._id.toString()
    };
  } catch (error) {
    console.error("Error updating blog in MongoDB:", error);
    throw error;
  }
}

export async function deleteBlog(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Blog ID");

    const result = await Blog.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting blog from MongoDB:", error);
    throw error;
  }
}

export async function getBlogById(id) {
  const fallback = DEFAULT_BLOGS.find((blog) => blog.id === id);
  if (fallback) return fallback;
  try {
    await dbConnect();
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) return null;

    const blog = await Blog.findOne(query).lean();
    if (!blog) return null;

    return {
      ...blog,
      id: blog._id.toString()
    };
  } catch (error) {
    console.error("Error reading blog by ID from MongoDB:", error);
    return fallback || null;
  }
}

export async function getServices() {
  try {
    await dbConnect();
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    if (services.length === 0) return DEFAULT_SERVICES;
    return services.map(s => ({
      ...s,
      id: s._id.toString()
    }));
  } catch (error) {
    console.error("Error reading services from MongoDB:", error);
    return DEFAULT_SERVICES;
  }
}

export async function saveService(serviceData) {
  await dbConnect();
  try {
    const service = new Service(serviceData);
    const saved = await service.save();
    const obj = saved.toObject();
    return {
      ...obj,
      id: obj._id.toString()
    };
  } catch (error) {
    console.error("Error saving service to MongoDB:", error);
    throw error;
  }
}

export async function updateService(id, updatedFields) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Service ID");

    const updated = await withDatabaseRetry(
      () => Service.findOneAndUpdate(
        query,
        { $set: updatedFields },
        { new: true }
      ).lean(),
      "Service update"
    );

    if (!updated) return null;
    clearPublicBrandsCache();

    return {
      ...updated,
      id: updated._id.toString()
    };
  } catch (error) {
    console.error("Error updating service in MongoDB:", error);
    throw error;
  }
}

export async function deleteService(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Service ID");

    const result = await Service.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting service from MongoDB:", error);
    throw error;
  }
}

export async function getServiceById(id) {
  const fallback = DEFAULT_SERVICES.find((service) => service.id === id);
  if (fallback) return fallback;
  try {
    await dbConnect();
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) return null;

    const service = await Service.findOne(query).lean();
    if (!service) return null;

    return {
      ...service,
      id: service._id.toString()
    };
  } catch (error) {
    console.error("Error reading service by ID from MongoDB:", error);
    return fallback || null;
  }
}

const ADS_JSON_PATH = path.join(process.cwd(), "src", "lib", "ads.json");
let localAdsCache = null;

function readLocalAds() {
  if (Array.isArray(localAdsCache)) return localAdsCache;
  try {
    if (fs.existsSync(ADS_JSON_PATH)) {
      const data = fs.readFileSync(ADS_JSON_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        localAdsCache = parsed;
        return localAdsCache;
      }
    }
  } catch (err) {
    console.error("Error reading ads.json:", err);
  }
  return [];
}

// Public pages should not wait for a cold/slow MongoDB connection just to
// render promotional placements. The local store is kept in sync whenever an
// admin creates or updates an ad and is safe to use as the fast read path.
export function getLocalAdvertisements() {
  return readLocalAds();
}

function writeLocalAds(ads) {
  try {
    fs.writeFileSync(ADS_JSON_PATH, JSON.stringify(ads, null, 2), "utf-8");
    localAdsCache = Array.isArray(ads) ? ads : null;
  } catch (err) {
    console.error("Error writing ads.json:", err);
  }
}

export async function getAdvertisements() {
  try {
    await dbConnect();
    const ads = await Advertisement.find({}).sort({ createdAt: -1 }).lean();
    if (Array.isArray(ads) && ads.length > 0) {
      const formatted = ads.map(a => ({
        ...a,
        id: a._id.toString()
      }));
      writeLocalAds(formatted);
      return formatted;
    }
  } catch (error) {
    console.error("Error reading advertisements from MongoDB, falling back to local ads.json:", error);
  }

  const localAds = readLocalAds();
  return localAds;
}

export async function saveAdvertisement(adData) {
  let savedObj = null;
  const localId = new mongoose.Types.ObjectId().toString();
  const fallbackRecord = {
    ...adData,
    id: localId,
    _id: localId,
    isActive: adData.isActive !== false,
    createdAt: adData.createdAt || new Date()
  };

  try {
    await dbConnect();
    const ad = new Advertisement(adData);
    const saved = await ad.save();
    const obj = saved.toObject();
    savedObj = {
      ...obj,
      id: obj._id.toString()
    };
  } catch (error) {
    console.error("MongoDB saveAdvertisement failed, persisting via resilient local store:", error);
  }

  try {
    const localAds = readLocalAds();
    const recordToPersist = savedObj || fallbackRecord;
    localAds.unshift(recordToPersist);
    writeLocalAds(localAds);
    if (!savedObj) savedObj = recordToPersist;
  } catch (fileErr) {
    console.error("Failed writing to local ads store:", fileErr);
  }

  return savedObj || fallbackRecord;
}

export async function updateAdvertisement(id, updatedFields) {
  let updatedObj = null;
  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;

  try {
    await dbConnect();
    if (query) {
      const updated = await withDatabaseRetry(
        () => Advertisement.findOneAndUpdate(
          query,
          { $set: updatedFields },
          { returnDocument: 'after' }
        ).lean(),
        "Advertisement update"
      );

      if (updated) {
        updatedObj = {
          ...updated,
          id: updated._id.toString()
        };
      }
    }
  } catch (error) {
    console.error("Error updating advertisement in MongoDB, falling back to local store:", error);
  }

  try {
    const localAds = readLocalAds();
    const index = localAds.findIndex(a => a.id === id || a._id === id);
    if (index !== -1) {
      localAds[index] = {
        ...localAds[index],
        ...updatedFields,
        id: localAds[index].id || id
      };
      writeLocalAds(localAds);
      if (!updatedObj) updatedObj = localAds[index];
    }
  } catch (err) {
    console.error("Failed updating local ads store:", err);
  }

  return updatedObj;
}

export async function deleteAdvertisement(id) {
  let deleted = false;
  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;

  try {
    await dbConnect();
    if (query) {
      const result = await Advertisement.deleteOne(query);
      if (result.deletedCount > 0) deleted = true;
    }
  } catch (error) {
    console.error("Error deleting advertisement from MongoDB:", error);
  }

  try {
    const localAds = readLocalAds();
    const filtered = localAds.filter(a => a.id !== id && a._id !== id);
    if (filtered.length !== localAds.length) {
      writeLocalAds(filtered);
      deleted = true;
    }
  } catch (err) {
    console.error("Failed deleting from local ads store:", err);
  }

  return deleted;
}

export async function getAdvertisementById(id) {
  const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;

  try {
    await dbConnect();
    if (query) {
      const ad = await Advertisement.findOne(query).lean();
      if (ad) {
        return {
          ...ad,
          id: ad._id.toString()
        };
      }
    }
  } catch (error) {
    console.error("Error reading advertisement by ID from MongoDB:", error);
  }

  const localAds = readLocalAds();
  const found = localAds.find(a => a.id === id || a._id === id);
  return found || null;
}

export async function createLog(logData) {
  await dbConnect();
  try {
    const newLog = await Log.create({
      panel: logData.panel || "admin",
      action: logData.action || "SYSTEM_EVENT",
      description: logData.description || "",
      userEmail: logData.userEmail || "",
      userName: logData.userName || "",
      role: logData.role || "",
      targetId: logData.targetId || "",
      targetType: logData.targetType || "",
      details: logData.details || null,
      createdAt: new Date()
    });
    return {
      ...newLog.toObject(),
      id: newLog._id.toString()
    };
  } catch (error) {
    console.error("Error creating log entry in DB:", error);
    return null;
  }
}

export async function getLogs(filter = {}) {
  await dbConnect();
  try {
    const query = {};
    if (filter.panel && filter.panel !== "all") {
      query.panel = filter.panel;
    }
    if (filter.userEmail) {
      query.userEmail = filter.userEmail;
    }
    if (filter.search) {
      const searchRegex = new RegExp(filter.search, "i");
      query.$or = [
        { action: searchRegex },
        { description: searchRegex },
        { userEmail: searchRegex },
        { userName: searchRegex },
        { targetType: searchRegex }
      ];
    }
    const limitNum = filter.limit ? parseInt(filter.limit) : 500;
    const logs = await Log.find(query).sort({ createdAt: -1 }).limit(limitNum).lean();
    return logs.map(l => ({
      ...l,
      id: l._id.toString()
    }));
  } catch (error) {
    console.error("Error fetching logs from DB:", error);
    return [];
  }
}

export async function deleteLog(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) return false;
    const res = await Log.deleteOne(query);
    return res.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting log from DB:", error);
    return false;
  }
}

export async function clearLogs(panel = null, userEmail = null) {
  await dbConnect();
  try {
    const query = {};
    if (panel && panel !== "all") query.panel = panel;
    if (userEmail) query.userEmail = userEmail;
    const res = await Log.deleteMany(query);
    return res.deletedCount;
  } catch (error) {
    console.error("Error clearing logs from DB:", error);
    return 0;
  }
}



