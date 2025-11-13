import mongoose from "mongoose";
import Counter from "./counter"; // importa el modelo contador

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, trim: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String },
    stock: { type: Number, required: true },
    foto: { type: String }, // URL pública de Cloudinary
    fotoPublicId: { type: String }, // ID de Cloudinary para borrar
    createdAt: { type: Date, default: Date.now },  // Guardar fecha y hora exacta
  },
  { timestamps: true }
);

// Pre-save: generar id tipo P001, P002, ... usando contador atómico
ProductSchema.pre("save", async function (next) {
  if (this.id) return next(); // si ya tiene id, salteamos

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "productid" }, // nombre de la secuencia
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // crear si no existe
    );

    this.id = `P${String(counter.seq).padStart(3, "0")}`;
    this.createdAt = new Date(); // guarda fecha y hora exacta (opcional, timestamps ya lo hace)
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
