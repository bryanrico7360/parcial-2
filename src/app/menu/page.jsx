"use client";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // vuelve al login
  };

  const options = [
    { label: "Registrar Producto", route: "/productos/add" },
    { label: "Venta De Productos (Factura)", route: "/productos/ventas" },
    { label: "Actualizar Inventario", route: "/productos/actualizar" },
    { label: "Reporte Inventario (PDF)", route: "/productos/reporte" },
    { label: "Cerrar Sesión", action: handleLogout },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-6">
        <h1 className="text-black text-2xl font-bold text-center">Menú Principal</h1>

        <div className="flex flex-col gap-4">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => (opt.action ? opt.action() : router.push(opt.route))}
              className="cursor-pointer bg-blue-600 text-white py-6 rounded-lg text-center font-semibold text-lg transition transform hover:scale-105 hover:bg-blue-700"
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
