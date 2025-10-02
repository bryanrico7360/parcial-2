"use client";
import { useState } from "react";

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRecover = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setError(data.error || "Error al enviar correo");
      }
    } catch (err) {
      setError("Error en la petición");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRecover}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl text-black font-bold text-center">
          Recuperar contraseña
        </h1>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <input
          type="email"
          placeholder="Ingresa tu correo registrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border text-black p-2 w-full rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md 
                     transform transition hover:scale-105 hover:bg-blue-700 cursor-pointer"
        >
          Enviar enlace
        </button>
      </form>
    </main>
  );
}
