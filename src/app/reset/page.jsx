"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // 👈 necesitas: npm i lucide-react

export default function ResetPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Contraseña cambiada con éxito");
      router.push("/login");
    } else {
      alert(data.error || "Error al cambiar contraseña");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded-xl shadow w-80 space-y-4"
      >
        <h1 className="text-black text-2xl font-bold text-center">
          Restablecer Contraseña
        </h1>

        {/* Nueva contraseña */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
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

        {/* Confirmar contraseña */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border text-black p-2 w-full rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black cursor-pointer"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md 
                     transform transition hover:scale-105 hover:bg-blue-700 cursor-pointer"
        >
          Cambiar contraseña
        </button>
      </form>
    </main>
  );
}
