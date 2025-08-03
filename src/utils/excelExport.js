import * as XLSX from 'xlsx';

export function exportToExcel(data) {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const worksheetData = data.map(row => ({
    Nama: row.nama,
    Tanggal: row.tanggal,
    'Jam Datang': row.jamDatang || '-',
    'Jam Pulang': row.jamPulang || '-',
    'Jam Izin': row.jamIzin || '-',
    'Jam Kembali': row.jamKembali || '-',
    Denda: row.denda > 0 ? `Rp${row.denda.toLocaleString('id-ID')}` : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi');

  XLSX.writeFile(workbook, 'rekap-presensi.xlsx');
}
