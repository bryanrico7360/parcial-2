import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String },
  stock: { type: Number, required: true },
  foto: { type: String }, // URL pública de Cloudinary
  fotoPublicId: { type: String }, // ID de Cloudinary para borrar
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
