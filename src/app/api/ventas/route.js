import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { items, cliente } = body; 
    // items = [{ productId, cantidad }]

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No se enviaron productos para la venta" },
        { status: 400 }
      );
    }

    // 🔹 Buscar productos en la BD
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos" },
        { status: 404 }
      );
    }

    // 🔹 Actualizar stock y calcular totales
    let totalGeneral = 0;
    const detalles = [];

    for (const item of items) {
      const producto = products.find((p) => p._id.toString() === item.productId);
      if (!producto) continue;

      const cantidadVendida = parseInt(item.cantidad);
      const subtotal = producto.precio * cantidadVendida;
      totalGeneral += subtotal;

      // actualizar stock
      producto.stock = Math.max(producto.stock - cantidadVendida, 0);
      await producto.save();

      detalles.push({
        nombre: producto.nombre,
        cantidad: cantidadVendida,
        precio: producto.precio,
        subtotal,
      });
    }

    // 📂 Carpeta donde se guardan las facturas
    const facturasDir = path.join(process.cwd(), "facturas");
    if (!fs.existsSync(facturasDir)) {
      fs.mkdirSync(facturasDir);
    }

    // 🧾 Buscar número de factura siguiente
    const files = fs.readdirSync(facturasDir);
    const count = files.filter(f => f.startsWith("factura")).length + 1;
    const facturaName = `factura${String(count).padStart(3, "0")}.pdf`;
    const facturaPath = path.join(facturasDir, facturaName);

    // 🔹 Fuente
    const robotoPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "ROBOTO-VARIABLEFONT_WDTH,WGHT.TTF"
    );

    if (!fs.existsSync(robotoPath)) {
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
      const doc = new PDFDocument({
        margin: 40,
        font: robotoPath,
        size: "A4",
      });

      // Guardar también en archivo local (opcional)
      const stream = fs.createWriteStream(facturaPath);
      doc.pipe(stream);

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(
          new NextResponse(Buffer.concat(chunks), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename=${facturaName}`,
            },
          })
        );
      });

      doc.on("error", (err) => {
        console.error("Error PDF:", err);
        reject(
          NextResponse.json({ error: "Error generando factura" }, { status: 500 })
        );
      });

      // 🧾 Encabezado
      doc.fontSize(22).text("Factura de Venta", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Fecha: ${fechaTexto}`, { align: "right" });
      if (cliente) doc.text(`Cliente: ${cliente}`, { align: "right" });
      doc.moveDown(1.5);

      // 🛍️ Tabla de productos
      doc.fontSize(14).text("Detalle de productos:", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const columnWidths = { nombre: 200, cantidad: 80, precio: 100, subtotal: 100 };

      // encabezado
      doc.fontSize(12).text("Producto", 50, tableTop);
      doc.text("Cant.", 270, tableTop);
      doc.text("Precio", 340, tableTop);
      doc.text("Subtotal", 440, tableTop);
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      for (const d of detalles) {
        const y = doc.y + 5;
        doc.text(d.nombre, 50, y, { width: columnWidths.nombre });
        doc.text(d.cantidad.toString(), 270, y);
        doc.text(`$${d.precio.toLocaleString()}`, 340, y);
        doc.text(`$${d.subtotal.toLocaleString()}`, 440, y);
        doc.moveDown(0.5);
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
