"use client";
import { useState } from "react";

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
      alert("Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96 text-center space-y-4">
        <h1 className="text-2xl font-bold text-black">
          Reporte de Inventario
        </h1>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transform hover:scale-105 transition-transform"
        >
          {loading ? "Generando..." : "📄 Generar PDF"}
        </button>
      </div>
    </main>
  );
}
