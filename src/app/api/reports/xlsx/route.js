import mongoose from "mongoose";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "@/lib/db";
import Sale from "@/lib/models/sale";
import Product from "@/lib/models/product";
import Client from "@/lib/models/client";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo");
    const clienteNombre = searchParams.get("clienteNombre") || "";

    if (!tipo) {
      return NextResponse.json({ error: "Tipo de reporte no especificado" }, { status: 400 });
    }

    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (tipo === "ventas") {
      worksheet = workbook.addWorksheet("Ventas Totales");

      const ventas = await Sale.find()
        .populate("client", "nombre email")
        .populate("items.productId", "id nombre precio")
        .lean();

      if (!ventas.length) {
        return NextResponse.json({ error: "No hay ventas registradas" }, { status: 404 });
      }

      worksheet.mergeCells("A1", "G1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Ventas Totales";
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.addRow([]);

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
          fgColor: { argb: "FF007ACC" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let totalGlobal = 0;
      ventas.forEach((venta) => {
        venta.items.forEach((item) => {
          const producto = item.productId;

          worksheet.addRow([
            new Date(venta.date).toLocaleString(),
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

      worksheet.addRow([]);
      const totalRow = worksheet.addRow(["", "", "", "", "", "TOTAL GENERAL", totalGlobal]);
      totalRow.font = { bold: true };
      totalRow.alignment = { horizontal: "right" };
      totalRow.getCell(7).numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';

      worksheet.columns = [
        { width: 14 },
        { width: 25 },
        { width: 30 },
        { width: 18 },
        { width: 15 },
        { width: 12 },
        { width: 15 },
      ];

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

    } else if (tipo === "productos") {
      worksheet = workbook.addWorksheet("Productos en Stock");

      const productos = await Product.find({ stock: { $gt: 0 } }).lean();

      if (!productos.length) {
        return NextResponse.json({ error: "No hay productos en stock" }, { status: 404 });
      }

      worksheet.mergeCells("A1", "E1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Productos en Stock";
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.addRow([]);

      worksheet.addRow([
        "Código Producto",
        "Nombre",
        "Precio",
        "Stock",
        "Descripción",
      ]);

      const headerRow = worksheet.getRow(3);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF007ACC" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      productos.forEach((prod) => {
        worksheet.addRow([
          prod.id || prod._id.toString(),
          prod.nombre,
          prod.precio,
          prod.stock,
          prod.descripcion || "",
        ]);
      });

      worksheet.columns = [
        { width: 18 },
        { width: 30 },
        { width: 15 },
        { width: 12 },
        { width: 40 },
      ];

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

    } else if (tipo === "cliente") {
      worksheet = workbook.addWorksheet("Ventas por Cliente");

      if (!clienteNombre.trim()) {
        return NextResponse.json({ error: "Debe especificar el nombre del cliente" }, { status: 400 });
      }

      const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

      // Buscar cliente por nombre o id (solo si id válido)
      const clienteDB = await Client.findOne({
        $or: [
          { nombre: { $regex: clienteNombre, $options: "i" } },
          ...(isValidObjectId(clienteNombre) ? [{ _id: clienteNombre }] : []),
        ],
      });

      if (!clienteDB) {
        return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
      }

      // Buscar ventas del cliente
      const ventasCliente = await Sale.find({ client: clienteDB._id })
        .populate("items.productId", "id nombre precio")
        .lean();

      if (!ventasCliente.length) {
        return NextResponse.json({ error: "No hay ventas para este cliente" }, { status: 404 });
      }

      worksheet.mergeCells("A1", "G1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = `Reporte de Ventas - Cliente: ${clienteDB.nombre} (ID: ${clienteDB._id.toString()})`;
      titleCell.font = { size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      worksheet.addRow([]);

      worksheet.addRow([
        "Fecha",
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
          fgColor: { argb: "FF007ACC" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      ventasCliente.forEach((venta) => {
        venta.items.forEach((item) => {
          const producto = item.productId;
          worksheet.addRow([
            new Date(venta.date).toLocaleString(),
            producto?.nombre || item.nombre || "Producto desconocido",
            producto?.id || "N/A",
            producto?.precio || item.precio || 0,
            item.cantidad,
            item.subtotal,
          ]);
        });
      });

      worksheet.columns = [
        { width: 14 },
        { width: 30 },
        { width: 18 },
        { width: 15 },
        { width: 12 },
        { width: 15 },
      ];

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

    } else {
      return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="reporte_${tipo}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error) {
    console.error("❌ Error generando reporte:", error);
    return NextResponse.json(
      { error: "Error al generar el reporte" },
      { status: 500 }
    );
  }
}
