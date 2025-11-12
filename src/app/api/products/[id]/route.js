import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";
import cloudinary from "@/lib/cloudinary";

// 🔹 Obtener producto por ID
export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const producto = await Product.findById(id);
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
export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const form = await req.formData();
    const mantenerFoto = form.get("mantenerFoto") === "true";

    const updateData = {
      nombre: form.get("nombre") || undefined,
      precio: form.get("precio") || undefined,
      descripcion: form.get("descripcion") || undefined,
      stock: form.get("stock") || undefined,
    };

    const producto = await Product.findById(id);
    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (mantenerFoto) {
      updateData.foto = producto.foto;
      updateData.fotoPublicId = producto.fotoPublicId;
    } else {
      const file = form.get("foto");

      if (file && file.name) {
        if (producto.fotoPublicId) {
          await cloudinary.uploader.destroy(producto.fotoPublicId);
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        const upload = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "productos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(bytes);
        });

        updateData.foto = upload.secure_url;
        updateData.fotoPublicId = upload.public_id;
      } else {
        updateData.foto = null;
        updateData.fotoPublicId = null;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

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
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    if (deletedProduct.fotoPublicId) {
      await cloudinary.uploader.destroy(deletedProduct.fotoPublicId);
    }

    return NextResponse.json({ message: "Producto eliminado ✅" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
