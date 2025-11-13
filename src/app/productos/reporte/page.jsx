"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function ReportePage() {
  const [loading, setLoading] = useState({
    ventas: false,
    productos: false,
    cliente: false,
  });
  const [cliente, setCliente] = useState("");

  const generarReporte = async (tipo) => {
    setLoading((prev) => ({ ...prev, [tipo]: true }));
    try {
      let url = `/api/reports/xlsx?tipo=${tipo}`;
      if (tipo === "cliente" && cliente.trim()) {
        url += `&clienteNombre=${encodeURIComponent(cliente.trim())}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error generando XLS");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `reporte_${tipo}.xlsx`;
      a.click();
    } catch (err) {
      alert("❌ Error al generar reporte");
    } finally {
      setLoading((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Header />

      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 border border-gray-100 mt-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-black text-center">
          📊 Reportes del Sistema
        </h1>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading.ventas}
          onClick={() => generarReporte("ventas")}
          className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
        >
          {loading.ventas ? "Generando..." : "Reporte de Ventas Totales"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading.productos}
          onClick={() => generarReporte("productos")}
          className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white py-2 rounded-lg"
        >
          {loading.productos ? "Generando..." : "Reporte de Productos en Stock"}
        </motion.button>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre o ID del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading.cliente}
            onClick={() => generarReporte("cliente")}
            className="w-full bg-purple-600 cursor-pointer hover:bg-purple-700 text-white py-2 rounded-lg"
          >
            {loading.cliente ? "Generando..." : "Reporte por Cliente"}
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}
