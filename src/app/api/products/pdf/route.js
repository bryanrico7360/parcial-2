import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find();

    return await new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="reporte_ventas.pdf"',
            },
          })
        );
      });

      doc.on("error", (err) => {
        reject(
          NextResponse.json({ error: "Error generando PDF" }, { status: 500 })
        );
      });

      // Aquí defines el contenido del PDF
      doc.fontSize(20).text("Reporte de Ventas", { align: "center" });
      doc.moveDown();

      if (products.length === 0) {
        doc.text("No hay productos para mostrar", { align: "center" });
      } else {
        products.forEach((p, i) => {
          doc.text(`${i + 1}. ${p.nombre} - Stock: ${p.stock} - Precio: $${p.precio}`);
        });
      }

      doc.end();
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 });
  }
}
