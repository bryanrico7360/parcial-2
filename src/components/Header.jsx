"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("nombreUsuario");
    if (storedName) setNombreUsuario(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nombreUsuario");
    router.push("/login");
  };

  const handleBack = () => {
    if (pathname === "/menu") return;
    router.back();
  };

  const goHome = () => {
    router.push("/menu");
  };

  const isMenu = pathname === "/menu" || pathname === "/";

  return (
    <motion.header
      className="w-full flex items-center justify-between p-4 bg-white shadow-md fixed top-0 left-0 z-50 border-b border-gray-100"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
    >
      {/* 🔙 Volver atrás */}
      <div className="flex items-center gap-3 w-1/4">
        {!isMenu && (
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition"
            title="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
        )}
      </div>

      {/* 👤 Saludo centrado con animación */}
      <motion.div
        className="flex justify-center flex-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
          Hola,{" "}
          <motion.span
            className="text-blue-600"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {nombreUsuario || "Usuario"}
          </motion.span>{" "}
          👋
        </h2>
      </motion.div>

      {/* 🏠 Ir al menú y salir */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <motion.button
          onClick={handleLogout}
          whileHover={{ y: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex items-center gap-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold "
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </motion.button>
      </div>
    </motion.header>
  );
}
