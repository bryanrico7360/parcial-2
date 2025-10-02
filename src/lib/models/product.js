import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // tu propio ID (ej: PROD001)
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String },
  stock: { type: Number, required: true },
  foto: { type: String }, // se guarda ruta tipo "/images/xxx.jpg"
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
