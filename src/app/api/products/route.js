import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

// 🔹 Crear producto
export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const nombre = formData.get("nombre");
    const precio = Number(formData.get("precio"));
    const descripcion = formData.get("descripcion");
    const stock = Number(formData.get("stock"));
    const foto = formData.get("foto");

    // Generar nuevo ID
    const lastProduct = await Product.findOne().sort({ createdAt: -1 });
    let newId = "PROD001";
    if (lastProduct && lastProduct.id) {
      const lastNum = parseInt(lastProduct.id.replace("PROD", "")) || 0;
      const nextNum = (lastNum + 1).toString().padStart(3, "0");
      newId = `PROD${nextNum}`;
    }

    // Guardar imagen
    let fileName = null;
    if (foto && typeof foto === "object") {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      fileName = `${Date.now()}-${foto.name}`;
      const dir = path.join(process.cwd(), "public", "images");

      if (!fs.existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      const filePath = path.join(dir, fileName);
      await writeFile(filePath, buffer);
    }

    const newProduct = new Product({
      id: newId,
      nombre,
      precio,
      descripcion,
      stock,
      foto: fileName ? `/images/${fileName}` : null,
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Producto registrado ✅", producto: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar producto:", error);
    return NextResponse.json(
      { error: "Error al registrar producto" },
      { status: 500 }
    );
  }
}

// 🔹 Listar todos los productos
export async function GET() {
  try {
    await connectDB();
    const productos = await Product.find();
    return NextResponse.json(productos, { status: 200 });
  } catch (error) {
    console.error("Error al listar productos:", error);
    return NextResponse.json(
      { error: "Error al listar productos" },
      { status: 500 }
    );
  }
}
