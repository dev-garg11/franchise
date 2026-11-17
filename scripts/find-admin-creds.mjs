import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function findAdmins() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log("=== ADMINS COLLECTION ===");
  const admins = await db.collection("admins").find({}).toArray();
  for (const a of admins) {
    console.log({
      id: a._id,
      username: a.username,
      email: a.email,
      role: a.role,
      name: a.name,
      hasPassword: !!a.password
    });
  }

  console.log("\n=== USERS COLLECTION (ADMINS) ===");
  const users = await db.collection("users").find({ role: { $in: ["admin", "superadmin"] } }).toArray();
  for (const u of users) {
    console.log({
      id: u._id,
      username: u.username,
      email: u.email,
      role: u.role,
      name: u.name,
      hasPassword: !!u.password
    });
  }

  await mongoose.disconnect();
}

findAdmins().catch(console.error);
