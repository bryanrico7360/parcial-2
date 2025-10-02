"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow w-80 space-y-4"
      >
        <h1 className="text-black text-2xl font-bold text-center">
          Iniciar Sesión
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border text-black p-2 w-full rounded"
        />

        {/* Campo con ojito */}
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

        <a href="/recover" className="text-sm text-blue-600 block text-center hover:underline">
          ¿Olvidaste tu contraseña?
        </a>

        {/* Separador con "O" */}
        <div className="flex items-center my-2">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500">O</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Link de registro */}
        <a
          href="/register" className="text-sm text-blue-600 block text-center hover:underline">
          Registrarse
        </a>
      </form>
    </main>
  );
}
