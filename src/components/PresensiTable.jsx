import React from 'react';

const baseTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
  fontSize: '16px',
};

// Light Mode
const lightTheme = {
  th: {
    backgroundColor: '#007acc',
    color: '#fff',
    border: '1px solid #ccc',
    padding: '12px',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '10px',
    verticalAlign: 'top',
    color: '#333',
  },
  rowEven: { backgroundColor: '#f9f9f9' },
  rowOdd: { backgroundColor: '#ffffff' },
};

// Dark Mode
const darkTheme = {
  th: {
    backgroundColor: '#1e40af', // biru tua
    color: '#f1f5f9',
    border: '1px solid #334155',
    padding: '12px',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #334155',
    padding: '10px',
    verticalAlign: 'top',
    color: '#e2e8f0',
  },
  rowEven: { backgroundColor: '#1e293b' },
  rowOdd: { backgroundColor: '#0f172a' },
};

// ===== Util Fungsi =====
const formatTanggal = (value) => {
  if (!value || value === '-') return '-';

  let d;

  if (!isNaN(value)) {
    d = new Date(Number(value));
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    d = new Date(`${year}-${month}-${day}`);
  } else {
    d = new Date(value);
  }

  if (isNaN(d)) return value;

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatJam = (value) => {
  if (!value || value === '-') return '-';

  let [jam, ...alasan] = String(value).split(' ');

  jam = jam.replace(/\./g, ':');

  if (jam.includes(':')) {
    const parts = jam.split(':');
    if (parts.length >= 2) {
      jam = `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
  }

  return alasan.length > 0 ? `${jam} ${alasan.join(' ')}` : jam;
};

// ===== Table Presensi =====
const PresensiTable = ({ data, darkMode }) => {
  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <table style={baseTableStyle}>
      <thead>
        <tr>
          <th style={theme.th}>Nama</th>
          <th style={theme.th}>Tanggal</th>
          <th style={theme.th}>Datang</th>
          <th style={theme.th}>Pulang</th>
          <th style={theme.th}>Izin</th>
          <th style={theme.th}>Kembali</th>
          <th style={theme.th}>Denda</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td style={{ ...theme.td, textAlign: 'center' }} colSpan={7}>
              Tidak ada data
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr
              key={index}
              style={index % 2 === 0 ? theme.rowEven : theme.rowOdd}
            >
              <td style={theme.td}>{item.nama}</td>
              <td style={theme.td}>{formatTanggal(item.tanggal)}</td>
              <td style={theme.td}>{formatJam(item.datangGabung)}</td>
              <td style={theme.td}>{formatJam(item.pulangGabung)}</td>
              <td style={theme.td}>{formatJam(item.jamIzin)}</td>
              <td style={theme.td}>{formatJam(item.jamKembali)}</td>
              <td
                style={{
                  ...theme.td,
                  color: item.denda > 0 ? '#f87171' : theme.td.color,
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
