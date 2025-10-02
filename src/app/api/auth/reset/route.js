import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    if (!token || !password) {
      return new Response(
        JSON.stringify({ error: "Token y contraseña son requeridos" }),
        { status: 400 }
      );
    }

    // verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token inválido o expirado" }),
        { status: 400 }
      );
    }

    // buscar usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404 }
      );
    }

    // encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return new Response(
      JSON.stringify({ success: true, message: "Contraseña actualizada" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en reset:", error);
    return new Response(
      JSON.stringify({ error: "Error en el servidor" }),
      { status: 500 }
    );
  }
}
