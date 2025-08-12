import React from 'react';

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
  fontSize: '16px',
};

const thStyle = {
  backgroundColor: '#007acc',
  color: '#fff',
  border: '1px solid #ccc',
  padding: '12px',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #ddd',
  padding: '10px',
  verticalAlign: 'top',
};

const rowEvenStyle = {
  backgroundColor: '#f9f9f9',
};

const rowOddStyle = {
  backgroundColor: '#ffffff',
};

// Fungsi format jam agar tanpa detik
const formatJam = (value) => {
  if (!value || value === '-') return '-';

  // Pisahkan jam dan alasan
  let [jam, ...alasan] = String(value).split(' ');

  // Ganti titik dengan titik dua
  jam = jam.replace(/\./g, ':');

  // Ambil hanya jam dan menit
  if (jam.includes(':')) {
    const parts = jam.split(':');
    if (parts.length >= 2) {
      jam = `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
  }

  // Gabungkan kembali dengan alasan kalau ada
  return alasan.length > 0 ? `${jam} ${alasan.join(' ')}` : jam;
};

const PresensiTable = ({ data }) => {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Nama</th>
          <th style={thStyle}>Tanggal</th>
          <th style={thStyle}>Datang</th>
          <th style={thStyle}>Pulang</th>
          <th style={thStyle}>Izin</th>
          <th style={thStyle}>Kembali</th>
          <th style={thStyle}>Denda</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td style={{ ...tdStyle, textAlign: 'center' }} colSpan={7}>
              Tidak ada data
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={index} style={index % 2 === 0 ? rowEvenStyle : rowOddStyle}>
              <td style={tdStyle}>{item.nama}</td>
              <td style={tdStyle}>{item.tanggal}</td>
              <td style={tdStyle}>{formatJam(item.datangGabung)}</td>
              <td style={tdStyle}>{formatJam(item.pulangGabung)}</td>
              <td style={tdStyle}>{formatJam(item.jamIzin)}</td>
              <td style={tdStyle}>{formatJam(item.jamKembali)}</td>
              <td
                style={{
                  ...tdStyle,
                  color: item.denda > 0 ? 'red' : '#333',
                  fontWeight: item.denda > 0 ? 'bold' : 'normal',
                }}
              >
                {item.denda > 0
                  ? `Rp${item.denda.toLocaleString('id-ID')}`
                  : '-'}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PresensiTable;
