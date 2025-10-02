import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  secretQuestion: { type: String },  // coincide con lo que tienes en Compass
  secretAnswer: { type: String },
  resetToken: { type: String },      // token para recuperación vía email
  resetTokenExp: { type: Date }      // expiración del token
});

export default mongoose.models.User || mongoose.model("User", userSchema);
