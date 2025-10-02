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
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // Validaciones
  const isFormValid =
    formData.nombre.trim() !== "" &&
    formData.precio !== "" &&
    parseFloat(formData.precio) >= 0 &&
    formData.descripcion.trim() !== "" &&
    formData.stock !== "" &&
    parseInt(formData.stock) >= 0 &&
    file !== null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    if ((name === "precio" || name === "stock") && value < 0) {
      value = 0;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isFormValid) return;

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
        setPreview(null);
      } else {
        setMessage(result.error || "❌ Error al registrar");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setMessage("❌ Error al conectar con el servidor");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-black text-center">
          Registrar Producto
        </h1>

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
          min="0"
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
          min="0"
          required
        />

        {/* Drag & Drop con preview */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed p-6 rounded text-center text-gray-500"
        >
          {file ? (
            <div className="text-black flex flex-col items-center space-y-2">
              <p>📸 {file.name}</p>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 text-sm hover:underline"
              >
                Quitar archivo
              </button>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              )}
            </div>
          ) : (
            "Arrastra una imagen aquí o haz click"
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer text-blue-600 block mt-2"
          >
            Seleccionar archivo
          </label>
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full text-white py-2 rounded ${
            isFormValid
              ? "bg-blue-600 cursor-pointer hover:bg-blue-700 transform hover:scale-105 transition-transform"
              : "bg-blue-600/50 cursor-not-allowed"
          }`}
        >
          Guardar Producto
        </button>
      </form>
    </main>
  );
}
