import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Brand from "@/models/Brand";
import Investor from "@/models/Investor";
import Admin from "@/models/Admin";
import User from "@/models/User";
import Blog from "@/models/Blog";
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
    seedDatabase().catch(err => console.error("Error seeding DB async:", err));
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
    //await seedDatabase();
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
async function seedDatabase() {
  try {
    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      const dataFilePath = path.join(process.cwd(), "src/lib/data.json");
      if (fs.existsSync(dataFilePath)) {
        const brandsData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
        if (brandsData.length > 0) {
          const validatedBrands = brandsData.map(b => ({
            ...b,
            password: b.password || "password123",
            minInvestment: b.minInvestment || 0,
            maxInvestment: b.maxInvestment || 0,
            category: b.category || "General"
          }));
          await Brand.insertMany(validatedBrands, { ordered: false });
          console.log(`Seeded ${validatedBrands.length} brands from data.json to MongoDB.`);
        }
      }
    }

    const investorCount = await Investor.countDocuments();
    if (investorCount === 0) {
      const investorsFilePath = path.join(process.cwd(), "src/lib/investors.json");
      if (fs.existsSync(investorsFilePath)) {
        const investorsData = JSON.parse(fs.readFileSync(investorsFilePath, "utf8"));
        if (investorsData.length > 0) {
          const validatedInvestors = investorsData.map(i => ({
            ...i,
            password: i.password || "password123",
            budgetMin: i.budgetMin || 0,
            budgetMax: i.budgetMax || 0
          }));
          await Investor.insertMany(validatedInvestors, { ordered: false });
          console.log(`Seeded ${validatedInvestors.length} investors from investors.json to MongoDB.`);
        }
      }
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        username: "admin",
        password: "admin123"
      });
      console.log("Seeded default admin user to MongoDB.");
    }

    // Seed User Collection (For central login with role and encrypted passwords)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      // Seed Admin User
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        email: "admin@franchiseroots.com",
        username: "admin",
        password: hashedAdminPassword,
        role: "admin",
        name: "Administrator"
      });

      // Seed Brand Users and link them via foreign key
      const brands = await Brand.find({});
      for (const brand of brands) {
        if (brand.email) {
          const emailLower = brand.email.toLowerCase();
          let existing = await User.findOne({ email: emailLower });
          if (!existing) {
            const hashedPassword = await bcrypt.hash(brand.password || "password123", 10);
            existing = await User.create({
              email: brand.email,
              password: hashedPassword,
              role: "brand",
              name: brand.name,
              phone: brand.phone
            });
          }
          brand.user = existing._id;
          await brand.save();
        }
      }

      // Seed Investor Users and link them via foreign key
      const investors = await Investor.find({});
      for (const investor of investors) {
        if (investor.email) {
          const emailLower = investor.email.toLowerCase();
          let existing = await User.findOne({ email: emailLower });
          if (!existing) {
            const hashedPassword = await bcrypt.hash(investor.password || "password123", 10);
            existing = await User.create({
              email: investor.email,
              password: hashedPassword,
              role: "investor",
              name: investor.name,
              phone: investor.phone
            });
          }
          investor.user = existing._id;
          await investor.save();
        }
      }
      console.log("Seeded User collection and linked all profiles via foreign key.");
    }

    // Migration fallback: Ensure all existing brands and investors in MongoDB have their user reference set
    const unlinkedBrands = await Brand.find({ user: { $exists: false } });
    for (const b of unlinkedBrands) {
      if (b.email) {
        let existing = await User.findOne({ email: b.email.toLowerCase() });
        if (!existing) {
          const hashedPassword = await bcrypt.hash(b.password || "password123", 10);
          existing = await User.create({
            email: b.email.toLowerCase(),
            password: hashedPassword,
            role: "brand",
            name: b.name,
            phone: b.phone
          });
        }
        b.user = existing._id;
        await b.save();
      }
    }

    const unlinkedInvestors = await Investor.find({ user: { $exists: false } });
    for (const inv of unlinkedInvestors) {
      if (inv.email) {
        let existing = await User.findOne({ email: inv.email.toLowerCase() });
        if (!existing) {
          const hashedPassword = await bcrypt.hash(inv.password || "password123", 10);
          existing = await User.create({
            email: inv.email.toLowerCase(),
            password: hashedPassword,
            role: "investor",
            name: inv.name,
            phone: inv.phone
          });
        }
        inv.user = existing._id;
        await inv.save();
      }
    }
  } catch (error) {
    console.error("Error during Next.js DB seeding:", error);
  }
}


export async function getBrands() {
  await dbConnect();
  try {
    const brands = await Brand.find({}).populate('user').sort({ createdAt: -1 }).lean();
    return brands.map(b => ({
      ...b,
      id: b.id || b._id.toString(),
      email: b.user ? b.user.email : b.email
    }));
  } catch (error) {
    console.error("Error reading brands from MongoDB:", error);
    return [];
  }
}

export async function saveBrand(brandData) {
  await dbConnect();
  try {
    const rawPassword = brandData.password || "password123";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Save to User collection
    const createdUser = await User.create({
      email: brandData.email.toLowerCase(),
      password: hashedPassword,
      role: 'brand',
      name: brandData.name,
      phone: brandData.phone
    });

    const id = brandData.id || `brand-${Date.now()}`;
    const brandPayload = {
      ...brandData,
      user: createdUser._id,
      id,
      status: brandData.status || "Pending",
      featured: brandData.featured || false,
      createdAt: brandData.createdAt || new Date()
    };
    delete brandPayload.password;
    delete brandPayload.email;

    const brand = new Brand(brandPayload);
    const saved = await brand.save();

    const obj = await Brand.findById(saved._id).populate('user').lean();
    const returnObj = {
      ...obj,
      id: obj.id || obj._id.toString(),
      email: obj.user ? obj.user.email : brandData.email
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
        await User.updateOne({ _id: existingBrand.user }, { $set: userUpdate });
      }
    }

    const payload = { ...updatedFields };
    delete payload.password;
    delete payload.email;

    const updated = await Brand.findOneAndUpdate(
      query,
      { $set: payload },
      { new: true }
    ).populate('user').lean();

    if (!updated) return null;

    const obj = {
      ...updated,
      id: updated.id || updated._id.toString(),
      email: updated.user ? updated.user.email : (updated.email || "")
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
    const emailLower = investorData.email.toLowerCase();
    let userObj = await User.findOne({ email: emailLower });
    if (!userObj) {
      const rawPassword = investorData.password || "password123";
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Save to User collection
      userObj = await User.create({
        email: emailLower,
        password: hashedPassword,
        role: 'investor',
        name: investorData.name,
        phone: investorData.phone
      });
    }

    const id = investorData.id || `investor-${Date.now()}`;
    const pincode = investorData.pincode || "000000";
    const investment_range = investorData.investment_range || "Not Specified";
    const max_investment_limit = investorData.max_investment_limit || "Not Specified";

    const investorPayload = {
      pincode,
      investment_range,
      max_investment_limit,
      ...investorData,
      user: userObj._id,
      id,
      brandId: investorData.brandId || null,
      brandName: investorData.brandName || null,
      category: investorData.category || null,
      investorId: investorData.investorId || null,
      status: investorData.status || "Pending",
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


