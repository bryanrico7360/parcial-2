import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretQuestion: { type: String },
  secretAnswer: { type: String },
  resetToken: { type: String },
  resetTokenExp: { type: Date },
  faceEmbedding: { type: [Number], default: [] }, // 🔹 Nuevo campo para rostro
});

export default mongoose.models.User || mongoose.model("User", userSchema);
