import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios"; // 👈 para descargar imágenes desde Cloudinary
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
        (async () => {
          for (const p of products) {
            const cardX = 50;
            const cardY = doc.y; // empieza donde va el cursor
            const cardWidth = 500;
            const cardHeight = 150;

            // 🔹 Dibujar card (borde)
            doc.rect(cardX, cardY, cardWidth, cardHeight).stroke();

            // 🔹 Imagen a la izquierda
            const imageSize = 120;
            if (p.foto) {
              try {
                if (p.foto.startsWith("http")) {
                  // Si la foto está en Cloudinary
                  const response = await axios.get(p.foto, {
                    responseType: "arraybuffer",
                  });
                  const imgBuffer = Buffer.from(response.data, "binary");
                  doc.image(imgBuffer, cardX + 10, cardY + 10, {
                    width: imageSize,
                    height: imageSize,
                  });
                } else {
                  // Si es una ruta local (public/)
                  const imagePath = path.join(
                    process.cwd(),
                    "public",
                    p.foto.replace(/^\//, "")
                  );
                  if (fs.existsSync(imagePath)) {
                    doc.image(imagePath, cardX + 10, cardY + 10, {
                      width: imageSize,
                      height: imageSize,
                    });
                  } else {
                    doc
                      .fontSize(10)
                      .text("⚠️ Imagen no encontrada", cardX + 10, cardY + 60);
                  }
                }
              } catch (err) {
                console.error("❌ Error cargando imagen:", err);
                doc
                  .fontSize(10)
                  .text("⚠️ Error al cargar imagen", cardX + 10, cardY + 60);
              }
            }

            // 🔹 Texto a la derecha de la imagen
            const textX = cardX + imageSize + 30;
            let textY = cardY + 20;

            doc.fontSize(14).text(`Código: ${p.codigo || p.id}`, textX, textY);
            textY += 20;
            doc.fontSize(14).text(`Producto: ${p.nombre}`, textX, textY);
            textY += 20;
            doc.fontSize(12).text(`Precio: $${p.precio}`, textX, textY);
            textY += 20;
            doc.text(`Stock: ${p.stock}`, textX, textY);
            textY += 20;
            doc.text(`Descripción: ${p.descripcion || "N/A"}`, textX, textY, {
              width: cardWidth - imageSize - 60,
            });

            // 🔹 Mueve el cursor debajo de la card
            doc.moveDown();
            doc.y = cardY + cardHeight + 20;
          }

          doc.end(); // 👈 muy importante, cerrar después del bucle
        })();
      }
    });
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
