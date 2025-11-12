import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import Sale from "@/lib/models/sale";
import Product from "@/lib/models/product";
import Client from "@/lib/models/client";

export async function GET() {
  try {
    await connectDB();

    // 🔹 Obtener las ventas con cliente y productos
    const ventas = await Sale.find()
      .populate("client", "nombre email")
      .populate("items.productId", "id nombre precio")
      .lean();

    if (!ventas.length) {
      return NextResponse.json({ error: "No hay ventas registradas" }, { status: 404 });
    }

    // Crear libro y hoja
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ventas Totales");

    // 🔹 Título principal
    worksheet.mergeCells("A1", "G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Reporte de Ventas Totales";
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.addRow([]);

    // 🔹 Encabezados
    worksheet.addRow([
      "Fecha",
      "Cliente",
      "Producto",
      "Código Producto",
      "Precio Unitario",
      "Cantidad",
      "Subtotal",
    ]);

    const headerRow = worksheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007ACC" }, // azul
      };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 🔹 Agregar filas con las ventas
    let totalGlobal = 0;
    ventas.forEach((venta) => {
      venta.items.forEach((item) => {
        const producto = item.productId;

        worksheet.addRow([
          new Date(venta.date).toLocaleDateString(),
          venta.client?.nombre || "Cliente desconocido",
          producto?.nombre || item.nombre || "Producto desconocido",
          producto?.id || "N/A",
          producto?.precio || item.precio || 0,
          item.cantidad,
          item.subtotal,
        ]);
      });
      totalGlobal += venta.total;
    });

    // 🔹 Espacio y total general
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(["", "", "", "", "", "TOTAL GENERAL", totalGlobal]);
    totalRow.font = { bold: true };
    totalRow.alignment = { horizontal: "right" };
    totalRow.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';

    // 🔹 Ajustar columnas
    worksheet.columns = [
      { width: 14 }, // Fecha
      { width: 25 }, // Cliente
      { width: 30 }, // Producto
      { width: 18 }, // Código
      { width: 15 }, // Precio Unitario
      { width: 12 }, // Cantidad
      { width: 15 }, // Subtotal
    ];

    // 🔹 Aplicar bordes y formato de números a las filas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        });
      }
    });

    // Exportar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="reporte_ventas.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("❌ Error generando reporte de ventas:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}
