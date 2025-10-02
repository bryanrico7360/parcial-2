import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";

// 🔹 Obtener producto por ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const producto = await Product.findOne({ id });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(producto, { status: 200 });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// 🔹 Actualizar producto
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const form = await req.formData();
    const mantenerFoto = form.get("mantenerFoto") === "true";

    const updateData = {
      nombre: form.get("nombre") || undefined,
      precio: form.get("precio") || undefined,
      descripcion: form.get("descripcion") || undefined,
      stock: form.get("stock") || undefined,
    };

    // Buscamos el producto original
    const producto = await Product.findOne({ id });
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // 📌 Manejo de la foto
    if (mantenerFoto) {
      updateData.foto = producto.foto;
    } else {
      const file = form.get("foto"); // 👈 mismo nombre que frontend

      if (file && file.name) {
        // Borrar foto anterior si existía
        if (producto.foto) {
          const oldPath = path.join(
            process.cwd(),
            "public",
            producto.foto.replace(/^\/+/, "")
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        // Guardar nueva
        const bytes = Buffer.from(await file.arrayBuffer());
        const fileName = Date.now() + "-" + file.name;
        const filePath = path.join(process.cwd(), "public/images", fileName);

        await writeFile(filePath, bytes);

        updateData.foto = "/images/" + fileName;
      } else {
        updateData.foto = null;
      }
    }

    const updatedProduct = await Product.findOneAndUpdate({ id }, updateData, {
      new: true,
    });

    return NextResponse.json({
      message: "Producto actualizado ✅",
      producto: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

// 🔹 Eliminar producto
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deletedProduct = await Product.findOneAndDelete({ id });

    if (!deletedProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // borrar imagen asociada si existía
    if (deletedProduct.foto) {
      const imgPath = path.join(
        process.cwd(),
        "public",
        deletedProduct.foto.replace(/^\/+/, "")
      );
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    return NextResponse.json({ message: "Producto eliminado ✅" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
