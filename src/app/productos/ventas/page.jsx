"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function VentaProductosPage() {
  const [productos, setProductos] = useState([]);
  const [seleccion, setSeleccion] = useState({});
  const [message, setMessage] = useState("");
  const [cliente, setCliente] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (res.ok) setProductos(data);
        else setMessage("❌ Error cargando productos");
      } catch (error) {
        console.error(error);
        setMessage("❌ Error de conexión");
      }
    };
    fetchProductos();
  }, []);

  const handleCantidadChange = (id, cantidad) => {
    setSeleccion((prev) => ({
      ...prev,
      [id]: cantidad,
    }));
  };

  const handleVenta = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!cliente.trim()) {
      setMessage("⚠️ Ingresa el nombre del cliente");
      return;
    }

    const items = Object.entries(seleccion)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([productId, cantidad]) => ({
        productId,
        cantidad: parseInt(cantidad),
      }));

    if (items.length === 0) {
      setMessage("⚠️ Selecciona al menos un producto");
      return;
    }

    try {
      const res = await fetch("/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, cliente }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url);
        setMessage("✅ Venta realizada y factura generada");
        setSeleccion({});
        setCliente("");
      } else {
        const result = await res.json();
        setMessage(result.error || "❌ Error al generar la venta");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error de conexión con el servidor");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-100 to-gray-200 p-6 pt-28">
      <Header />

      <motion.form
        onSubmit={handleVenta}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-4xl space-y-6 border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-center text-black">
          Venta de Productos
        </h1>

        {message && (
          <p className="text-center text-blue-600 font-medium">{message}</p>
        )}

        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          required
          className="border text-black p-2 w-full rounded"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-black">Imagen</th>
                <th className="p-2 text-black">Producto</th>
                <th className="p-2 text-black">Precio</th>
                <th className="p-2 text-black">Stock</th>
                <th className="p-2 text-black">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    {p.foto ? (
                      <img
                        src={p.foto}
                        alt={p.nombre}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-gray-500">
                        Sin foto
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-black">{p.nombre}</td>
                  <td className="p-2 text-black">${p.precio}</td>
                  <td className="p-2 text-black">{p.stock}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max={p.stock}
                      value={seleccion[p._id] || ""}
                      onChange={(e) =>
                        handleCantidadChange(p._id, e.target.value)
                      }
                      className="w-20 p-1 border rounded text-black"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-green-600 text-white py-3 rounded-lg
                     hover:bg-green-700 transform transition-transform 
                     duration-200 shadow-md font-semibold cursor-pointer"
        >
          Generar Venta y Factura PDF
        </motion.button>
      </motion.form>
    </main>
  );
}
