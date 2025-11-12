import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      nombre: String,
      cantidad: Number,
      precio: Number,
      subtotal: Number,
    },
  ],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
