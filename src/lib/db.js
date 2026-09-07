import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Brand from "@/models/Brand";
import Investor from "@/models/Investor";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Blog from "@/models/Blog";
import Service from "@/models/Service";
import Advertisement from "@/models/Advertisement";
import Log from "@/models/Log";
import bcrypt from "bcryptjs";
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
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB via Next.js Mongoose connection helper");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    await seedDatabase();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
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


export async function getBrands() {
  await dbConnect();
  try {
    const brands = await Brand.find({}).populate('user').sort({ createdAt: -1 }).lean();
    return brands.map(b => {
      const userEmail = (b.user && typeof b.user === 'object' && b.user.email) ? b.user.email : null;
      const email = userEmail || b.email || "";
      return {
        ...b,
        id: b.id || b._id.toString(),
        name: b.name || "Unnamed Brand",
        company: b.company || b.name || "",
        category: b.category || "General",
        status: b.status || "Pending",
        email: email
      };
    });
  } catch (error) {
    console.error("Error reading brands from MongoDB:", error);
    return [];
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
    if (!brand) return null;
    return {
      ...brand,
      id: brand.id || brand._id.toString(),
      email: brand.user ? brand.user.email : brand.email
    };
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
    let userObj = await User.findOne({ email: emailLower });

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
    const brandPayload = {
      ...brandData,
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

export async function updateBrand(id, updatedFields) {
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

    const updated = await Brand.findOneAndUpdate(
      query,
      { $set: payload },
      { returnDocument: 'after' }
    ).populate('user').lean();

    if (!updated) return null;

    const obj = {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: (updated.user && typeof updated.user === 'object' && updated.user.email) ? updated.user.email : (updated.email || "")
    };

    // Trigger status change emails
    if (updatedFields.status === "Approved") {
      sendBrandApprovalEmail(obj).catch(err =>
        console.error("Failed to send brand approval email:", err)
      );
    } else if (updatedFields.status === "Declined") {
      sendBrandDeclineEmail(obj).catch(err =>
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

    const result = await Brand.deleteOne(query);
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
    return [];
  }
}

export async function saveInvestor(investorData) {
  await dbConnect();
  try {
    const investorName = investorData.name || investorData.fullName || "Investor";
    const emailLower = (investorData.email || "").toLowerCase();
    let userObj = await User.findOne({ email: emailLower });
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
    delete investorPayload.email;

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

export async function assignBrandToInvestors(brandId, investorIds) {
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

    // 2. Fetch the investor details
    const cleanInvestorIds = (investorIds || []).filter(Boolean);
    const queryInvestors = {
      $or: [
        { _id: { $in: cleanInvestorIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
        { id: { $in: cleanInvestorIds } }
      ]
    };
    const rawInvestors = await Investor.find(queryInvestors).populate('user').lean();
    const selectedInvestors = rawInvestors.map(inv => ({
      ...inv,
      email: inv.user ? inv.user.email : inv.email
    }));

    // 3. Remove brandId from all investors first
    await Investor.updateMany(
      { assignedBrands: { $in: [brandId, brand?._id?.toString(), brand?.id].filter(Boolean) } },
      { $pull: { assignedBrands: { $in: [brandId, brand?._id?.toString(), brand?.id].filter(Boolean) } } }
    );

    // 4. Add brandId to selected investors
    const storedBrandId = brand?.id || brand?._id?.toString() || brandId;
    if (cleanInvestorIds.length > 0) {
      await Investor.updateMany(
        queryInvestors,
        { $addToSet: { assignedBrands: storedBrandId } }
      );
    }

    // 5. Send emails
    if (brand && selectedInvestors.length > 0) {
      sendBrandAssignedToInvestorsEmail(brand, selectedInvestors).catch(err =>
        console.error("Failed to send brand assignment email to brand owner:", err)
      );

      selectedInvestors.forEach(inv => {
        sendInvestorAssignedBrandEmail(inv, brand).catch(err =>
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
  await dbConnect();
  try {
    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    };
    const user = await User.findOne(query).lean();
    if (!user) {
      return { success: false, message: "Invalid email/username or password." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Invalid email/username or password." };
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
    return { success: false, message: "Server error during login." };
  }
}

export async function updateInvestor(id, updatedFields) {
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

    return {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: updated.user ? updated.user.email : (updated.email || "")
    };
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

    const result = await Investor.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting investor from MongoDB:", error);
    throw error;
  }
}

export async function getBlogs() {
  await dbConnect();
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
    return blogs.map(b => ({
      ...b,
      id: b._id.toString()
    }));
  } catch (error) {
    console.error("Error reading blogs from MongoDB:", error);
    return [];
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

    const updated = await Blog.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { new: true }
    ).lean();

    if (!updated) return null;

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
  await dbConnect();
  try {
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
    return null;
  }
}

export async function getServices() {
  await dbConnect();
  try {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    return services.map(s => ({
      ...s,
      id: s._id.toString()
    }));
  } catch (error) {
    console.error("Error reading services from MongoDB:", error);
    return [];
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

    const updated = await Service.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { new: true }
    ).lean();

    if (!updated) return null;

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
  await dbConnect();
  try {
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
    return null;
  }
}

export async function getAdvertisements() {
  await dbConnect();
  try {
    const ads = await Advertisement.find({}).sort({ createdAt: -1 }).lean();
    return ads.map(a => ({
      ...a,
      id: a._id.toString()
    }));
  } catch (error) {
    console.error("Error reading advertisements from MongoDB:", error);
    return [];
  }
}

export async function saveAdvertisement(adData) {
  await dbConnect();
  try {
    const ad = new Advertisement(adData);
    const saved = await ad.save();
    const obj = saved.toObject();
    return {
      ...obj,
      id: obj._id.toString()
    };
  } catch (error) {
    console.error("Error saving advertisement to MongoDB:", error);
    throw error;
  }
}

export async function updateAdvertisement(id, updatedFields) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Advertisement ID");

    const updated = await Advertisement.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { new: true }
    ).lean();

    if (!updated) return null;

    return {
      ...updated,
      id: updated._id.toString()
    };
  } catch (error) {
    console.error("Error updating advertisement in MongoDB:", error);
    throw error;
  }
}

export async function deleteAdvertisement(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) throw new Error("Invalid Advertisement ID");

    const result = await Advertisement.deleteOne(query);
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting advertisement from MongoDB:", error);
    throw error;
  }
}

export async function getAdvertisementById(id) {
  await dbConnect();
  try {
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : null;
    if (!query) return null;

    const ad = await Advertisement.findOne(query).lean();
    if (!ad) return null;

    return {
      ...ad,
      id: ad._id.toString()
    };
  } catch (error) {
    console.error("Error reading advertisement by ID from MongoDB:", error);
    return null;
  }
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



