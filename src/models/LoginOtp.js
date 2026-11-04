import mongoose from "mongoose";

const LoginOtpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  codeHash: { type: String, required: true },
  destination: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  createdAt: { type: Date, default: Date.now }
});

LoginOtpSchema.set('bufferCommands', false);
LoginOtpSchema.set('autoIndex', false);

export default mongoose.models.LoginOtp || mongoose.model("LoginOtp", LoginOtpSchema);
