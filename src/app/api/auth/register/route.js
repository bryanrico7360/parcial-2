import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  try {
    const { nombreUsuario, email, password, faceEmbedding } = await req.json();

    if (!nombreUsuario || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombreUsuario,
      email,
      password: hashedPassword,
      faceEmbedding,
    });

    await newUser.save();

    return NextResponse.json({ ok: true, message: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}
