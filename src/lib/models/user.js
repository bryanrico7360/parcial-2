import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombreUsuario: {
    type: String,
    required: false, // puedes poner true si lo haces obligatorio
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  secretQuestion: {
    type: String,
    default: "",
  },
  secretAnswer: {
    type: String,
    default: "",
  },
  resetToken: {
    type: String,
    default: "",
  },
  resetTokenExp: {
    type: Date,
  },
  faceEmbedding: {
    type: [Number],
    default: [],
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
