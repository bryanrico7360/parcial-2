"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function ReportePage() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/pdf");
      if (!res.ok) throw new Error("Error generando PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte_inventario.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("❌ Error al generar reporte");
    } finally {
      setLoading(false);
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
          Reporte de Inventario
        </h1>

        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
          } transition-transform`}
        >
          {loading ? "Generando..." : "📄 Generar PDF"}
        </motion.button>
      </motion.div>
    </main>
  );
}
