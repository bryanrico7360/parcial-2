import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import path from "path";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";
import Client from "@/lib/models/client";
import Sale from "@/lib/models/sale";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { items, cliente } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron productos para la venta" },
        { status: 400 }
      );
    }

    // Buscar o crear cliente
    let client = null;
    if (cliente?.trim()) {
      client = await Client.findOne({ nombre: cliente.trim() });
      if (!client) {
        client = await Client.create({ nombre: cliente.trim() });
        console.log("🟢 Cliente creado:", client.nombre);
      }
    }

    // Buscar productos en DB
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos" },
        { status: 404 }
      );
    }

    // Validar stock suficiente para todos los productos antes de descontar
    for (const item of items) {
      const producto = products.find((p) => p._id.toString() === item.productId);
      if (!producto) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.productId}` },
          { status: 404 }
        );
      }

      const cantidadVendida = parseInt(item.cantidad);
      if (isNaN(cantidadVendida) || cantidadVendida <= 0) {
        return NextResponse.json(
          { error: `Cantidad inválida para producto: ${producto.nombre}` },
          { status: 400 }
        );
      }

      if (producto.stock < cantidadVendida) {
        return NextResponse.json(
          { error: `Stock insuficiente para producto: ${producto.nombre}` },
          { status: 400 }
        );
      }
    }

    // Calcular totales y actualizar stock
    let totalGeneral = 0;
    const detalles = [];

    for (const item of items) {
      const producto = products.find((p) => p._id.toString() === item.productId);
      const cantidadVendida = parseInt(item.cantidad);
      const subtotal = producto.precio * cantidadVendida;
      totalGeneral += subtotal;

      // Actualizar stock restando la cantidad vendida
      producto.stock -= cantidadVendida;
      await producto.save();

      detalles.push({
        productId: producto._id,
        nombre: producto.nombre,
        cantidad: cantidadVendida,
        precio: producto.precio,
        subtotal,
      });
    }

    // Guardar venta en DB
    const venta = await Sale.create({
      client: client?._id,
      items: detalles,
      total: totalGeneral,
    });

    const robotoPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "ROBOTO-VARIABLEFONT_WDTH,WGHT.TTF"
    );

    if (!robotoPath) {
      throw new Error("No se encontró la fuente Roboto en /public/fonts");
    }

    const fecha = new Date();
    const fechaTexto = fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return await new Promise((resolve, reject) => {
      const chunks = [];
      const doc = new PDFDocument({ margin: 40, font: robotoPath, size: "A4" });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(
          new NextResponse(Buffer.concat(chunks), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename=factura.pdf`,
            },
          })
        );
      });

      doc.on("error", (err) => {
        console.error("Error PDF:", err);
        reject(
          NextResponse.json(
            { error: "Error generando factura" },
            { status: 500 }
          )
        );
      });

      // Encabezado PDF
      doc.fontSize(22).text("Factura de Venta", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Fecha: ${fechaTexto}`, { align: "right" });
      if (cliente) doc.text(`Cliente: ${cliente}`, { align: "right" });
      doc.moveDown(1.5);

      // Tabla productos
      doc.fontSize(14).text("Detalle de productos:", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text("Producto", 50);
      doc.text("Cant.", 270);
      doc.text("Precio", 340);
      doc.text("Subtotal", 440);
      doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();

      for (const d of detalles) {
        doc.moveDown(0.5);
        const y = doc.y + 5;
        doc.text(d.nombre, 50, y);
        doc.text(d.cantidad.toString(), 270, y);
        doc.text(`$${d.precio.toLocaleString()}`, 340, y);
        doc.text(`$${d.subtotal.toLocaleString()}`, 440, y);
      }

      doc.moveDown(1);
      doc.fontSize(14).text(`Total: $${totalGeneral.toLocaleString()}`, {
        align: "right",
      });

      doc.moveDown(2);
      doc.fontSize(10).text("Gracias por su compra", { align: "center" });

      doc.end();
    });
  } catch (error) {
    console.error("❌ Error generando factura:", error);
    return NextResponse.json(
      { error: "Error al generar factura" },
      { status: 500 }
    );
  }
}
