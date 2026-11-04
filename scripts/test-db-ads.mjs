import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Advertisement from '../src/models/Advertisement.js';

console.log("Connecting to:", process.env.MONGODB_URI ? "URI exists" : "NO URI");

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB successfully!");
  const ads = await Advertisement.find({}).lean();
  console.log("Total ads found:", ads.length);
  console.log("Ads:", JSON.stringify(ads, null, 2));

  // Try creating a test ad
  const testAd = new Advertisement({
    title: "Test Ad " + Date.now(),
    subtitle: "Test Subtitle",
    image: "https://example.com/test.jpg",
    link: "/brand-registration",
    badge: "SPONSORED",
    position: "homepage_banner",
    isActive: true
  });
  const saved = await testAd.save();
  console.log("Test ad saved successfully! ID:", saved._id);
  
  // Clean up test ad
  await Advertisement.deleteOne({ _id: saved._id });
  console.log("Test ad cleaned up!");
  
  process.exit(0);
} catch (err) {
  console.error("DB Error:", err);
  process.exit(1);
}

