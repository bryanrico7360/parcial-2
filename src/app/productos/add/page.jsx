"use client";
import { useState } from "react";

export default function AddProductPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Sube una imagen");

    // 1. subir imagen
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      alert("Error subiendo imagen");
      return;
    }

    const photo = data.fileName;

    // 2. guardar producto
    const productRes = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, description, stock, photo }),
    });

    if (productRes.ok) {
      alert("✅ Producto agregado");
      setName(""); setPrice(""); setDescription(""); setStock(""); setFile(null); setPreview(null);
    } else {
      alert("Error guardando producto");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Agregar Producto</h1>

        <input
          type="text"
          placeholder="Nombre"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Precio"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <textarea
          placeholder="Descripción"
          className="border p-2 w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          className="border p-2 w-full"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer bg-gray-50"
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-32 h-32 mx-auto object-cover" />
          ) : (
            "Arrastra una imagen aquí"
          )}
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
