import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const ads = await mongoose.connection.db.collection("advertisements").find({}).toArray();
  console.log(`Found ${ads.length} ads:`);
  for (const ad of ads) {
    console.log(`- ID: ${ad._id}, Title: "${ad.title}", mediaType: ${ad.mediaType}, badge: "${ad.badge}", image: "${ad.image?.slice(0, 50)}..."`);
  }
  await mongoose.disconnect();
}
run();
