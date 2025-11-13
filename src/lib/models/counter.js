import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // nombre de la secuencia, ej: "clientid"
  seq: { type: Number, default: 0 },
});

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);
