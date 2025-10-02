import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "@/lib/models/user";
import { connectDB } from "@/lib/db"; 
import { NextResponse } from "next/server";

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

    // transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
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
