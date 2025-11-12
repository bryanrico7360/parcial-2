"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaceLogin } from "@/components/FaceLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();


      console.log("🧩 Datos del login:", data);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombreUsuario", data.nombreUsuario || email);
        router.push("/menu");
      } else {
        setMessage(data.error || "❌ Error en el inicio de sesión");
        setMessageType("error");
      }
    } catch {
      setMessage("❌ No se pudo conectar al servidor");
      setMessageType("error");
    }
  };

  const handleFaceLogin = async (faceEmbedding) => {
    try {
      const res = await fetch("/api/auth/login-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faceEmbedding }),
      });

      const data = await res.json();
      console.log("🟢 RESPUESTA DEL LOGIN FACIAL:", data);


      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("nombreUsuario", data.nombreUsuario || "Usuario");
        router.push("/menu");
        return true;
      } else {
        setMessage(data.error || "❌ No se reconoció el rostro");
        setMessageType("error");
        return false;
      }
    } catch {
      setMessage("❌ Error al conectar con el servidor");
      setMessageType("error");
      return false;
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
        {/* 🧾 Lado izquierdo: Login con email y contraseña */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center space-y-4">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-2">
            Iniciar sesión
          </h1>
          <p className="text-center text-gray-500 text-sm mb-4">
            Ingresa con tu correo y contraseña
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl font-semibold text-white shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:brightness-110 transition cursor-pointer"
            >
              Entrar
            </motion.button>

            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center font-medium mt-2 ${
                  messageType === "error"
                    ? "text-red-600"
                    : messageType === "success"
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {message}
              </motion.p>
            )}
          </form>

          {/* 🔹 Links abajo */}
          <div className="text-center text-sm mt-4 space-y-3">
            <Link href="/recover" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>

            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <span className="flex-1 border-t border-gray-300"></span>
              <span>o</span>
              <span className="flex-1 border-t border-gray-300"></span>
            </div>

            <Link href="/register" className="text-blue-600 hover:underline">
              Crear cuenta
            </Link>
          </div>
        </div>

        {/* 📸 Lado derecho: Login facial */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col justify-center items-center p-8 text-white">
          <h2 className="text-lg font-semibold mb-3">Inicio de sesión facial</h2>
          <div className="bg-white rounded-xl p-3 shadow-inner">
            <FaceLogin onCapture={handleFaceLogin} />
          </div>
          <p className="mt-3 text-sm text-white/80 text-center px-6">
            Mira a la cámara para iniciar sesión automáticamente.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
