import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  try {
    const { email, password, secretQuestion, secretAnswer } = await req.json();

    // Validar campos
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
    }

    // Revisar si ya existe
    const userExist = await User.findOne({ email });
    if (userExist) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      secretQuestion,
      secretAnswer,
    });

    await newUser.save();

    return NextResponse.json({ ok: true, message: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
