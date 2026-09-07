import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  panel: {
    type: String,
    enum: ["admin", "brand", "investor"],
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    default: "",
    index: true
  },
  userName: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    default: ""
  },
  targetId: {
    type: String,
    default: ""
  },
  targetType: {
    type: String,
    default: ""
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
