"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("nombreUsuario");
    if (storedName) {
      setNombreUsuario(storedName);
    }
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
    <header className="w-full flex items-center justify-between p-4 bg-white shadow-md fixed top-0 left-0 z-50 border-b border-gray-100">
      {/* 🔙 Volver atrás */}
      <div className="flex items-center gap-3">
        {!isMenu && (
          <button
            onClick={handleBack}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            title="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* 👤 Saludo */}
      <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center flex-1">
        Hola, <span className="text-blue-600">{nombreUsuario || "Usuario"}</span> 👋
      </h2>

      {/* 🏠 Ir al menú y salir */}
      <div className="flex items-center gap-2">
        {!isMenu && (
          <button
            onClick={goHome}
            className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition"
            title="Ir al menú"
          >
            <Home className="w-5 h-5 text-white" />
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </header>
  );
}
