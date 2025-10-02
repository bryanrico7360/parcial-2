import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

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
    const body = await req.json();

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      body,
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Producto actualizado ✅", producto: updatedProduct });
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

    return NextResponse.json({ message: "Producto eliminado ✅" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
