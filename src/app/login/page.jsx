"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { FaceLogin } from "@/components/FaceLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [useFacial, setUseFacial] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/menu");
    } else {
      alert(data.error || "Error en login");
    }
  };

  const handleFaceLogin = async (faceEmbedding) => {
    const res = await fetch("/api/auth/login-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faceEmbedding }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      router.push("/menu");
    } else {
      alert(data.error || "Error en login facial");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-80 space-y-4">
        <h1 className="text-black text-2xl font-bold text-center">Iniciar Sesión</h1>

        {!useFacial ? (
          <>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border text-black p-2 w-full rounded"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border text-black p-2 w-full rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md 
                           transform transition hover:scale-105 hover:bg-blue-700 cursor-pointer"
              >
                Entrar
              </button>
            </form>

            <a
              href="/register"
              className="text-sm text-blue-600 block text-center hover:underline cursor-pointer"
            >
              Registrarse
            </a>

            <div className="flex items-center my-2">
              <hr className="flex-grow border-gray-300" />
              <span className="px-2 text-gray-500">O</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <div className="text-center mt-3">
              <button
                onClick={() => setUseFacial(true)}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Iniciar sesión con rostro
              </button>
            </div>
          </>
        ) : (
          <>
            <FaceLogin onCapture={handleFaceLogin} />

            <div className="text-center mt-3">
              <button
                onClick={() => setUseFacial(false)}
                className="text-sm text-blue-600 hover:underline cursor-pointer"
              >
                Volver al login con contraseña
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
