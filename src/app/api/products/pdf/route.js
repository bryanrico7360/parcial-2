import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find();
    console.log("PRODUCTS:", products);

    const robotoPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "ROBOTO-VARIABLEFONT_WDTH,WGHT.TTF"
    );

    if (!fs.existsSync(robotoPath)) {
      throw new Error("No se encontró la fuente Roboto en /public/fonts");
    }

    return await new Promise((resolve, reject) => {
      const chunks = [];
      const doc = new PDFDocument({
        margin: 30,
        font: robotoPath,
      });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(
          new NextResponse(Buffer.concat(chunks), {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "inline; filename=reporte.pdf",
            },
          })
        );
      });

      doc.on("error", (err) => {
        reject(
          NextResponse.json({ error: "Error generando PDF" }, { status: 500 })
        );
      });

      // Contenido del PDF
      doc.fontSize(18).text("Reporte de Inventario", { align: "center" });
      doc.moveDown();

      if (products.length === 0) {
        doc.text("No hay productos en la base de datos 😅", { align: "center" });
      } else {
        for (const p of products) {
          doc.fontSize(14).text(`Código: ${p.codigo || p.id}`);
          doc.fontSize(14).text(`Producto: ${p.nombre}`);
          doc.fontSize(12).text(`Precio: $${p.precio}`);
          doc.text(`Stock: ${p.stock}`);
          doc.text(`Descripción: ${p.descripcion || "N/A"}`);
          doc.moveDown(0.5);

          if (p.foto) {
            try {
              const imagePath = path.join(
                process.cwd(),
                "public",
                p.foto.replace(/^\//, "")
              );
              if (fs.existsSync(imagePath)) {
                doc.image(imagePath, { width: 120, height: 120 });
              } else {
                doc.text("⚠️ Imagen no encontrada");
              }
            } catch {
              doc.text("⚠️ Error al cargar imagen");
            }
          }

          doc.moveDown(2);
        }
      }

      doc.end();
    });
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
