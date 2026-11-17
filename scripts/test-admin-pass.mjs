import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

async function testPasswords() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const adminInUsers = await db.collection("users").findOne({ username: "admin" });
  const adminInAdmins = await db.collection("admins").findOne({ username: "admin" });

  console.log("Admin in Users hash:", adminInUsers?.password);
  console.log("Admin in Admins hash:", adminInAdmins?.password);

  const candidates = [
    "admin",
    "admin123",
    "Admin123",
    "Admin@123",
    "admin@123",
    "admin123#",
    "Admin123#",
    "franchiseroot",
    "franchiseroot123",
    "franchise123",
    "Franchise123",
    "FranchiseRoots@123",
    "password",
    "password123",
    "123456",
    "root",
    "superadmin"
  ];

  for (const p of candidates) {
    if (adminInUsers?.password) {
      const match1 = await bcrypt.compare(p, adminInUsers.password).catch(() => false);
      if (match1 || adminInUsers.password === p) {
        console.log(`>>> MATCH FOUND for User admin! Password is: "${p}"`);
      }
    }
    if (adminInAdmins?.password) {
      const match2 = await bcrypt.compare(p, adminInAdmins.password).catch(() => false);
      if (match2 || adminInAdmins.password === p) {
        console.log(`>>> MATCH FOUND for Legacy Admin! Password is: "${p}"`);
      }
    }
  }

  await mongoose.disconnect();
}

testPasswords().catch(console.error);
