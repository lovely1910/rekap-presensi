// utils/excelExport.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcel = async (data) => {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Presensi");

  // ==== Header ====
  const header = [
    "Nama",
    "Tanggal",
    "Datang",
    "Pulang",
    "Izin",
    "Kembali",
    "Denda",
  ];
  worksheet.addRow(header);

  // Style Header
  worksheet.getRow(1).eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "007ACC" }, // biru
    };
    cell.font = { bold: true, color: { argb: "FFFFFF" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // ==== Isi Data ====
  data.forEach((item, index) => {
    const row = worksheet.addRow([
      item.nama,
      item.tanggal,
      item.datangGabung || "-",
      item.pulangGabung || "-",
      item.jamIzin || "-",
      item.jamKembali || "-",
      item.denda > 0
        ? `Rp${item.denda.toLocaleString("id-ID")}`
        : "-",
    ]);

    // Zebra row (selang-seling warna)
    if (index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F9F9F9" }, // abu muda
        };
      });
    }

    // Style kolom denda
    const dendaCell = row.getCell(7);
    if (item.denda > 0) {
      dendaCell.font = { color: { argb: "FF0000" }, bold: true }; // merah bold
    } else {
      dendaCell.font = { color: { argb: "228B22" }, bold: true }; // hijau
    }

    // Border setiap cell
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // ==== Auto-fit column width ====
  worksheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = maxLength < 15 ? 15 : maxLength + 2;
  });

  // ==== Export ====
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Presensi.xlsx");
};
