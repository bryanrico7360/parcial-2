"use client";
import { useState } from "react";

export default function RegistrarProductoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
  });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("precio", formData.precio);
    data.append("descripcion", formData.descripcion);
    data.append("stock", formData.stock);
    if (file) data.append("foto", file);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto registrado correctamente");
        setFormData({ nombre: "", precio: "", descripcion: "", stock: "" });
        setFile(null);
      } else {
        setMessage(result.error || "❌ Error al registrar");
      }
    } catch (error) {
  console.error("Error en la petición:", error);
  if (error.response) {
    console.error("Respuesta del servidor:", error.response.data);
  } else if (error.request) {
    console.error("No hubo respuesta del servidor:", error.request);
  } else {
    console.error("Error al configurar la petición:", error.message);
  }
}

  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-black text-center">Registrar Producto</h1>

        {message && <p className="text-center text-blue-600">{message}</p>}

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={formData.precio}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        <input
          type="number"
          name="stock"
          placeholder="Cantidad en stock"
          value={formData.stock}
          onChange={handleChange}
          className="border text-black p-2 w-full rounded"
          required
        />

        {/* Drag & Drop */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed p-6 rounded text-center text-gray-500"
        >
          {file ? (
            <p className="text-black">📸 {file.name}</p>
          ) : (
            "Arrastra una imagen aquí o haz click"
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer text-blue-600 block mt-2">
            Seleccionar archivo
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Guardar Producto
        </button>
      </form>
    </main>
  );
}
