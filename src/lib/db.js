import mongoose from "mongoose";
import { seedUser } from "./seedUser.js"; // 🔹 importa el seed

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error("⚠️ Debes definir MONGODB_URI en .env.local");
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, { dbName: "parcial1" });
    isConnected = true;
    console.log("✅ Conectado a MongoDB Atlas");

    // 🔹 Crea el usuario inicial si no existe
    await seedUser();
  } catch (err) {
    console.error("❌ Error al conectar MongoDB:", err);
  }
};
