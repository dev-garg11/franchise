import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function getAds() {
  await mongoose.connect(process.env.MONGODB_URI);
  const ads = await mongoose.connection.db.collection("advertisements").find({}).toArray();
  for (const ad of ads) {
    console.log("------------------------------------------");
    console.log("ID:", ad._id);
    console.log("Title:", ad.title);
    console.log("Subtitle:", ad.subtitle);
    console.log("MediaType:", ad.mediaType);
    console.log("Badge:", ad.badge);
    console.log("Image length / type:", ad.image?.startsWith("data:") ? "base64" : ad.image);
    console.log("Link:", ad.link);
  }
  await mongoose.disconnect();
}
getAds().catch(console.error);
