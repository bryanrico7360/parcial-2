"use client";
import { useState } from "react";

export default function EliminarProductoPage() {
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto eliminado correctamente");
        setId("");
      } else {
        setMessage(result.error || "❌ Error al eliminar");
      }
    } catch (error) {
      setMessage("❌ Error de conexión");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleDelete}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-black text-center">
          Eliminar Producto
        </h1>

        {message && <p className="text-center text-blue-600">{message}</p>}

        <input
          type="text"
          name="id"
          placeholder="ID del producto (ej: PROD001)"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border text-black p-2 w-full rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded 
                     hover:bg-red-700 transform transition-transform 
                     duration-200 hover:scale-105 shadow-md cursor-pointer"
        >
          Eliminar Producto
        </button>
      </form>
    </main>
  );
}
