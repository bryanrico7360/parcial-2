import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, trim: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String },
    stock: { type: Number, required: true },
    foto: { type: String }, // URL pública de Cloudinary
    fotoPublicId: { type: String }, // ID de Cloudinary para borrar
  },
  { timestamps: true }
);

// 🔹 Generar automáticamente un id tipo P001, P002, etc.
ProductSchema.pre("save", async function (next) {
  if (this.id) return next(); // ya tiene id asignado

  try {
    const lastProduct = await mongoose.models.Product.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastProduct && lastProduct.id) {
      const match = lastProduct.id.match(/P(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    this.id = `P${String(nextNumber).padStart(3, "0")}`;
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
