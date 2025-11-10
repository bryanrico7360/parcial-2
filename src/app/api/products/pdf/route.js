import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find();

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
        size: "A4",
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
        console.error("Error PDF:", err);
        reject(
          NextResponse.json({ error: "Error generando PDF" }, { status: 500 })
        );
      });

      // 🔹 Encabezado
      doc.fontSize(20).text("Reporte de Inventario", { align: "center" });
      doc.moveDown(1.5);

      if (products.length === 0) {
        doc.text("No hay productos en la base de datos 😅", { align: "center" });
        doc.end();
        return;
      }

      (async () => {
        for (const p of products) {
          // 🔹 Si el cursor está muy abajo, crear nueva página
          if (doc.y > 650) {
            doc.addPage();
          }

          const cardX = 50;
          const cardY = doc.y;
          const cardWidth = 500;
          const cardHeight = 150;
          const imageSize = 120;

          // 🔹 Borde de la tarjeta
          doc.rect(cardX, cardY, cardWidth, cardHeight).stroke();

          // 🔹 Imagen (ajustada sin deformar)
          if (p.foto) {
            try {
              let imageUrl = p.foto;
              if (imageUrl.includes("cloudinary.com")) {
                imageUrl = imageUrl.replace("/upload/", "/upload/f_jpg/");
              }

              const response = await axios.get(imageUrl, {
                responseType: "arraybuffer",
              });
              const imgBuffer = Buffer.from(response.data, "binary");

              doc.image(imgBuffer, cardX + 10, cardY + 10, {
                fit: [imageSize, imageSize],
                align: "center",
                valign: "center",
              });
            } catch (err) {
              console.error("Error cargando imagen:", err);
              doc.fontSize(10).text("⚠️ Error al cargar imagen", cardX + 10, cardY + 60);
            }
          }

          // 🔹 Texto
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

          // 🔹 Espacio entre tarjetas
          doc.y = cardY + cardHeight + 20;
        }

        doc.end();
      })();
    });
  } catch (error) {
    console.error("❌ Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error al generar reporte" },
      { status: 500 }
    );
  }
}
