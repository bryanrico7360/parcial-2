import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const products = await product.find();
    console.log("PRODUCTS:", products);

    // 👉 Ruta a tu fuente Roboto (nombre largo)
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
        font: robotoPath, // ✅ Fuente larga
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
        for (const product of products) {
          doc.fontSize(14).text(`Código: ${product.codigo || product.id}`);
          doc.fontSize(14).text(`Producto: ${product.nombre}`);
          doc.fontSize(12).text(`Precio: $${product.precio}`);
          doc.text(`Stock: ${product.stock}`);
          doc.text(`Descripción: ${product.descripcion || "N/A"}`);
          doc.moveDown(0.5);

          if (product.foto) {
            try {
              const imagePath = path.join(
                process.cwd(),
                "public",
                product.foto.replace(/^\//, "")
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
