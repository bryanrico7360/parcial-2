"use client";
import { useEffect, useState } from "react";

export default function GestionInventarioPage() {
  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    stock: "",
  });
  const [mantenerFoto, setMantenerFoto] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const handleEdit = (producto) => {
    setEditando(producto._id);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      stock: producto.stock,
    });
    setPreview(producto.foto);
    setMantenerFoto(true);
  };

  const handleCancel = () => {
    setEditando(null);
    setFormData({ nombre: "", precio: "", descripcion: "", stock: "" });
    setFile(null);
    setPreview(null);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if ((name === "precio" || name === "stock") && value < 0) value = 0;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (id) => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      data.append("mantenerFoto", mantenerFoto.toString());
      if (!mantenerFoto && file) data.append("foto", file);

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: data,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Producto actualizado correctamente");
        await fetchProductos();
        handleCancel();
      } else {
        setMessage(result.error || "❌ Error al actualizar");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error de conexión");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProductos(productos.filter((p) => p._id !== id));
        setMessage("🗑️ Producto eliminado");
      } else {
        const result = await res.json();
        setMessage(result.error || "❌ Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al eliminar producto");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setMantenerFoto(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setMantenerFoto(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Gestión de Inventario
        </h1>

        {message && (
          <p className="text-center text-blue-600 mb-4 font-semibold">
            {message}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-gray-800 text-sm">
            <thead className="bg-blue-100 text-blue-800 uppercase text-xs">
              <tr>
                <th className="border p-2">Imagen</th>
                <th className="border p-2">ID</th>
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Descripción</th>
                <th className="border p-2">Precio</th>
                <th className="border p-2">Stock</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="border p-2 text-center">
                      <img
                        src={p.foto}
                        alt={p.nombre}
                        className="w-12 h-12 object-cover mx-auto rounded-md shadow-sm"
                      />
                    </td>
                    <td className="border p-2 text-center">{p.id}</td>
                    <td className="border p-2 text-center">
                      {editando === p._id ? (
                        <input
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className="border border-blue-400 focus:ring focus:ring-blue-300 rounded p-1 w-full text-center text-sm"
                        />
                      ) : (
                        p.nombre
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {editando === p._id ? (
                        <textarea
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          className="border border-blue-400 focus:ring focus:ring-blue-300 rounded p-1 w-full text-sm"
                        />
                      ) : (
                        p.descripcion
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {editando === p._id ? (
                        <input
                          type="number"
                          name="precio"
                          value={formData.precio}
                          onChange={handleChange}
                          className="border border-blue-400 focus:ring focus:ring-blue-300 rounded p-1 w-20 text-center text-sm"
                        />
                      ) : (
                        `$${p.precio}`
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      {editando === p._id ? (
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          className="border border-blue-400 focus:ring focus:ring-blue-300 rounded p-1 w-20 text-center text-sm"
                        />
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td className="border p-2 text-center space-y-2">
                      {editando === p._id ? (
                        <>
                          <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-md p-2 text-xs cursor-pointer transition-all ${
                              dragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-blue-300 hover:border-blue-400"
                            }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <p className="text-blue-600 font-medium">
                              {file
                                ? file.name
                                : "Haz clic o arrastra una imagen aquí"}
                            </p>
                          </div>

                          {preview && (
                            <img
                              src={preview}
                              alt="preview"
                              className="w-14 h-14 mx-auto rounded mt-2 shadow-sm"
                            />
                          )}

                          <div className="flex justify-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdate(p._id)}
                              className="bg-green-600 hover:bg-green-700 hover:scale-110 active:scale-95 transition-transform duration-200 text-white px-3 py-1 rounded text-xs cursor-pointer"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-500 hover:bg-gray-600 hover:scale-110 active:scale-95 transition-transform duration-200 text-white px-3 py-1 rounded text-xs cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="bg-blue-600 hover:bg-blue-700 hover:scale-110 active:scale-95 transition-transform duration-200 text-white px-3 py-1 rounded text-xs cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="bg-red-600 hover:bg-red-700 hover:scale-110 active:scale-95 transition-transform duration-200 text-white px-3 py-1 rounded text-xs cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
