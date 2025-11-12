import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  // 🔐 Generar token con la información básica
  const token = jwt.sign(
    { id: user._id, email: user.email },
    "secretkey",
    { expiresIn: "1h" }
  );

  // ✅ Devolver también el nombre del usuario
  return NextResponse.json({
    ok: true,
    token,
    nombreUsuario: user.nombreUsuario, // 👈 este es el cambio clave
  });
}
