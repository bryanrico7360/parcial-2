import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "@/lib/models/user";
import dbConnect from "@/lib/dbConnect";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "El correo es obligatorio" });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 🔑 Crear token JWT válido por 15 minutos
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Enviar correo
    const info = await transporter.sendMail({
      from: `"Soporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic en el enlace para restablecer tu contraseña:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    console.log("📩 Correo enviado:", info);

    return res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("❌ Error en recover:", error);
    return res.status(500).json({ message: "Error interno", error: error.message });
  }
}
