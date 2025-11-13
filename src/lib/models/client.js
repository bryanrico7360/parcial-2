import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", clientSchema);
