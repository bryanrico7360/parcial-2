import { Resend } from "resend";
import jwt from "jsonwebtoken";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/db"; 
import { NextResponse } from "next/server";

// inicializar Resend con tu API Key desde las variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // generar token válido 15 min
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.BASE_URL}/reset?token=${token}`;

    // enviar correo con Resend
    await resend.emails.send({
      from: "Soporte <onboarding@resend.dev>", // dominio de prueba de Resend
      to: email,
      subject: "Recupera tu contraseña",
      html: `<p>Haz click aquí para cambiar tu contraseña:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    return NextResponse.json({ message: "Correo de recuperación enviado ✅" });
  } catch (err) {
    console.error("Error en recover:", err);
    return NextResponse.json({ error: "Error al enviar correo" }, { status: 500 });
  }
}
