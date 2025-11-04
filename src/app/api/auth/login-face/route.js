import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";

// 🔹 función auxiliar para calcular similitud coseno entre dos embeddings
function cosineSimilarity(a, b) {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (normA * normB);
}

export async function POST(req) {
  try {
    await connectDB();

    const { faceEmbedding } = await req.json();
    if (!faceEmbedding) {
      return NextResponse.json({ error: "Falta el embedding facial" }, { status: 400 });
    }

    // Traemos todos los usuarios (puedes optimizar luego)
    const users = await User.find();
    if (!users.length) {
      return NextResponse.json({ error: "No hay usuarios registrados" }, { status: 404 });
    }

    // Compara embeddings
    let matchedUser = null;
    let highestSim = -1;

    for (const user of users) {
      if (!user.faceEmbedding) continue;

      const similarity = cosineSimilarity(user.faceEmbedding, faceEmbedding);
      console.log(`🔹 Similitud con ${user.email}: ${similarity}`);

      if (similarity > 0.9 && similarity > highestSim) { // umbral de 0.9 (ajustable)
        matchedUser = user;
        highestSim = similarity;
      }
    }

    if (!matchedUser) {
      return NextResponse.json({ error: "Rostro no reconocido" }, { status: 401 });
    }

    // Si se reconoce correctamente, genera el token
    const token = `FAKE_TOKEN_${matchedUser._id}`;
    return NextResponse.json({ ok: true, token });

  } catch (error) {
    console.error("❌ Error en login facial:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
