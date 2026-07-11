import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Brand from "../../models/Brand";
import Investor from "../../models/Investor";
import {
  sendBrandRegistrationEmail,
  sendInvestorRegistrationEmail,
  sendBrandApprovalEmail,
  sendBrandDeclineEmail
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
  } catch (error) {
    console.error("Error during Next.js DB seeding:", error);
  }
}


export async function getBrands() {
  await dbConnect();
  try {
    const brands = await Brand.find({}).sort({ createdAt: -1 }).lean();
    return brands.map(b => ({
      ...b,
      id: b.id || b._id.toString()
    }));
  } catch (error) {
    console.error("Error reading brands from MongoDB:", error);
    return [];
  }
}

export async function saveBrand(brandData) {
  await dbConnect();
  try {
    const id = brandData.id || `brand-${Date.now()}`;
    const brand = new Brand({
      ...brandData,
      id,
      status: brandData.status || "Pending",
      featured: brandData.featured || false,
      createdAt: brandData.createdAt || new Date()
    });
    const saved = await brand.save();
    const obj = saved.toObject();

    // Trigger registration email
    sendBrandRegistrationEmail(obj).catch(err =>
      console.error("Failed to send brand registration email:", err)
    );

    return {
      ...obj,
      id: obj.id || obj._id.toString()
    };
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

    const updated = await Brand.findOneAndUpdate(
      query,
      { $set: updatedFields },
      { new: true }
    ).lean();

    if (!updated) return null;

    const obj = {
      ...updated,
      id: updated.id || updated._id.toString()
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
    const investors = await Investor.find({}).sort({ createdAt: -1 }).lean();
    return investors.map(i => ({
      ...i,
      id: i.id || i._id.toString()
    }));
  } catch (error) {
    console.error("Error reading investors from MongoDB:", error);
    return [];
  }
}

export async function saveInvestor(investorData) {
  await dbConnect();
  try {
    const id = investorData.id || `investor-${Date.now()}`;
    const investor = new Investor({
      ...investorData,
      id,
      createdAt: investorData.createdAt || new Date()
    });
    const saved = await investor.save();
    const obj = saved.toObject();

    // Trigger registration email
    sendInvestorRegistrationEmail(obj).catch(err =>
      console.error("Failed to send investor registration email:", err)
    );

    return {
      ...obj,
      id: obj.id || obj._id.toString()
    };
  } catch (error) {
    console.error("Error saving investor to MongoDB:", error);
    throw error;
  }
}
