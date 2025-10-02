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
  const [mantenerFoto, setMantenerFoto] = useState(true); // OJO: clave enviada = "mantenerFoto"
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  // Validaciones
  const isFormValid =
    id.trim() !== "" &&
    (formData.nombre.trim() !== "" ||
      formData.precio !== "" ||
      formData.descripcion.trim() !== "" ||
      formData.stock !== "" ||
      !mantenerFoto) &&
    (mantenerFoto || file !== null);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Evitar negativos
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isFormValid) return; // seguridad

    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("precio", formData.precio);
      data.append("descripcion", formData.descripcion);
      data.append("stock", formData.stock);
      data.append("mantenerFoto", mantenerFoto.toString()); // importante: string "true"/"false"

      // enviar con el name que espera el backend: "foto"
      if (!mantenerFoto && file) {
        data.append("foto", file);
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto actualizado correctamente");
        setId("");
        setFormData({ nombre: "", precio: "", descripcion: "", stock: "" });
        setFile(null);
        setPreview(null);
        setMantenerFoto(true);
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
          min="0"
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
          min="0"
        />

        {/* Checkbox mantener foto */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mantenerFoto}
            onChange={(e) => setMantenerFoto(e.target.checked)}
          />
          <span className="text-black">Mantener foto actual</span>
        </label>

        {/* Recuadro de imagen (igual que registrar) */}
        {!mantenerFoto && (
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
              name="foto"               // <-- importante: name="foto"
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
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full text-white py-2 rounded ${
            isFormValid
              ? "bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-transform"
              : "bg-green-600/50 cursor-not-allowed"
          }`}
        >
          Actualizar Producto
        </button>
      </form>
    </main>
  );
}
