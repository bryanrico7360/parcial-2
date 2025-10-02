"use client";
import { useState } from "react";

export default function ActualizarProductoPage() {
  const [id, setId] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto actualizado correctamente");
        setId("");
        setFormData({ nombre: "", precio: "", descripcion: "", stock: "" });
      } else {
        setMessage(result.error || "❌ Error al actualizar");
      }
    } catch (error) {
      setMessage("❌ Error de conexión");
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-black text-center">
          Actualizar Producto
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

        <input
          type="text"
          name="nombre"
          placeholder="Nuevo nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
        />

        <input
          type="number"
          name="precio"
          placeholder="Nuevo precio"
          value={formData.precio}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
        />

        <textarea
          name="descripcion"
          placeholder="Nueva descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
        />

        <input
          type="number"
          name="stock"
          placeholder="Nuevo stock"
          value={formData.stock}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transform hover:scale-105 transition-transform"
        >
          Actualizar Producto
        </button>
      </form>
    </main>
  );
}
