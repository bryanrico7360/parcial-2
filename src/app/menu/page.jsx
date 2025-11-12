"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, FileText, ShoppingCart, RefreshCcw } from "lucide-react";
import Header from "@/components/Header"; // ✅ importación correcta

export default function MenuPage() {
  const router = useRouter();

  const options = [
    {
      label: "Registrar Producto",
      route: "/productos/add",
      icon: <Package className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Venta de Productos (Factura)",
      route: "/productos/ventas",
      icon: <ShoppingCart className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Actualizar Inventario",
      route: "/productos/actualizar",
      icon: <RefreshCcw className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Reporte Inventario (PDF)",
      route: "/productos/reporte",
      icon: <FileText className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <Header />

      <motion.div
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-8 border border-gray-100 mt-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Menú Principal
        </h1>

        <div className="grid grid-cols-1 gap-4">
          {options.map((opt, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(opt.route)}
              className={`cursor-pointer flex items-center justify-between px-6 py-5 rounded-xl text-white font-semibold text-lg shadow-md bg-gradient-to-r ${opt.color} hover:brightness-110 transition`}
            >
              <span>{opt.label}</span>
              {opt.icon}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}
