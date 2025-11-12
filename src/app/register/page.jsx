"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaceRegister } from "@/components/FaceRegister";

export default function RegisterPage() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faceEmbedding, setFaceEmbedding] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("⚠️ Las contraseñas no coinciden");
      setMessageType("error");
      return;
    }

    if (!faceEmbedding) {
      setMessage("⚠️ Debes capturar tu rostro antes de continuar");
      setMessageType("error");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreUsuario, email, password, faceEmbedding }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Usuario registrado con éxito. Redirigiendo...");
        setMessageType("success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "❌ Error en el registro");
        setMessageType("error");
      }
    } catch {
      setMessage("❌ Error al conectar con el servidor");
      setMessageType("error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-6">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col md:flex-row w-full max-w-4xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 📋 Lado Izquierdo: Formulario */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center space-y-4">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
            Crear cuenta
          </h1>
          <p className="text-center text-gray-500 text-sm mb-4">
            Regístrate para continuar
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="border border-gray-300 text-black p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 text-black p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 text-black p-3 w-full rounded-lg pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 text-black p-3 w-full rounded-lg pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* 💡 Botón principal */}
            <motion.button
              type="submit"
              disabled={!faceEmbedding}
              whileHover={faceEmbedding ? { scale: 1.05 } : {}}
              whileTap={faceEmbedding ? { scale: 0.95 } : {}}
              className={`w-full py-3 rounded-xl font-semibold text-white shadow-md transition bg-gradient-to-r ${
                faceEmbedding
                  ? "from-blue-500 to-blue-600 hover:brightness-110 cursor-pointer"
                  : "from-gray-400 to-gray-500 cursor-not-allowed"
              }`}
            >
              Crear cuenta
            </motion.button>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center font-medium mt-2 ${
                  messageType === "success"
                    ? "text-green-600"
                    : messageType === "error"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {message}
              </motion.p>
            )}

            {/* 🔹 Enlace para login */}
            <p className="text-center text-gray-600 text-sm mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline hover:text-blue-700 transition"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>

        {/* 📸 Lado Derecho: Cámara */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col justify-center items-center p-8 text-white">
          <h2 className="text-lg font-semibold mb-3">Captura tu rostro</h2>
          <div className="bg-white rounded-xl p-3 shadow-inner">
            <FaceRegister onCapture={setFaceEmbedding} />
          </div>
          <p className="mt-3 text-sm text-white/80 text-center px-6">
            Asegúrate de estar bien iluminado y frente a la cámara.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
