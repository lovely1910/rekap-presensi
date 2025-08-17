import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import PresensiTable from './components/PresensiTable';
import { fetchAllPresensiData } from './utils/fetchAllPresensi';
import { exportToExcel } from './utils/excelExport';

// ===== Komponen Login =====
function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'donanovita' && password === '123456') {
      onLogin();
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
      background: 'linear-gradient(135deg, #f9fafc, #eef3f8)'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#fff',
          padding: '30px 40px',
          borderRadius: '12px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          minWidth: '320px',
          transition: 'all 0.3s ease'
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: 20,
          color: '#1a73e8'
        }}>Login</h2>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 500, fontSize: 14 }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              marginTop: 4,
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14
            }}
            placeholder="Masukkan username"
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontWeight: 500, fontSize: 14 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 10,
              marginTop: 4,
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 14
            }}
            placeholder="Masukkan password"
          />
        </div>

        {error && (
          <div style={{
            color: '#d9534f',
            fontSize: 13,
            marginBottom: 10,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            backgroundColor: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer',
            transition: '0.3s ease'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}



// ===== Halaman Rekap Presensi =====
function RekapPresensi({ darkMode, setDarkMode }) {
  const [data, setData] = useState([]);
  const [selectedNama, setSelectedNama] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [hanyaDenda, setHanyaDenda] = useState(false);
  const [loading, setLoading] = useState(false);

  const ambilData = async () => {
    setLoading(true);
    const result = await fetchAllPresensiData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    ambilData();
  }, []);

  const handleRefresh = () => {
    setSelectedNama(null);
    setDateRange([null, null]);
    setHanyaDenda(false);
    ambilData();
  };

  const namaOptions = [...new Set(data.map(item => item.nama))].map(nama => ({
    value: nama,
    label: nama,
  }));

  const filteredData = data
    .filter(item => (selectedNama ? item.nama === selectedNama.value : true))
    .filter(item => {
      const [year, month, day] = item.tanggal.split('-').map(Number);
      const tanggalItem = new Date(year, month - 1, day);
      if (startDate && tanggalItem < startDate) return false;
      if (endDate && tanggalItem > endDate) return false;
      return true;
    })
    .filter(item => (hanyaDenda ? item.denda > 0 : true));

  const activeStyles = darkMode ? darkStyles : lightStyles;

  return (
    <div style={activeStyles.container}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20,
        alignItems: "center"
      }}>
        <h2 style={activeStyles.title}>Rekap Presensi</h2>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={activeStyles.toggleButton}
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Picker Nama */}
      <div style={{ marginBottom: 15 }}>
        <Select
          options={namaOptions}
          value={selectedNama}
          onChange={setSelectedNama}
          isClearable
          placeholder="Pilih nama karyawan..."
          isDisabled={loading}
        />
      </div>

      {/* Rentang Tanggal */}
      <div style={activeStyles.fullRow}>
        <div style={{ flex: 1 }}>
          <label style={activeStyles.label}>Rentang Tanggal:</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            dateFormat="yyyy-MM-dd"
            placeholderText="Pilih rentang tanggal"
            disabled={loading}
          />
        </div>
      </div>

      {/* Checkbox & Aksi */}
      <div style={activeStyles.bottomActions}>
        <label style={activeStyles.checkbox}>
          <input
            type="checkbox"
            checked={hanyaDenda}
            onChange={e => setHanyaDenda(e.target.checked)}
            style={{ marginRight: 6 }}
            disabled={loading}
          />
          Tampilkan hanya yang kena denda
        </label>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => exportToExcel(filteredData)}
            style={activeStyles.downloadButton}
            disabled={loading}
          >
            📥 Download Excel
          </button>
          <button onClick={handleRefresh} style={activeStyles.refreshButton} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={activeStyles.loaderWrapper}>
          <div style={activeStyles.loader}></div>
          <div style={{ marginTop: 8 }}>Memuat data...</div>
        </div>
      ) : (
        <PresensiTable data={filteredData} />
      )}
    </div>
  );
}



// ===== App Utama =====
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <RekapPresensi darkMode={darkMode} setDarkMode={setDarkMode} />;
}



// ===== Styles =====

// Light Mode
const lightStyles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 30,
    fontFamily: 'Segoe UI, sans-serif',
    background: 'linear-gradient(135deg, #f9fafc 0%, #eef3f8 100%)',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transition: 'all 0.4s ease',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#1a73e8' },
  toggleButton: {
    padding: "8px 14px",
    background: "#1a73e8",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  fullRow: { display: 'flex', gap: 20, marginBottom: 15 },
  label: { fontWeight: '600', fontSize: 14, marginBottom: 6, color: '#333' },
  bottomActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  checkbox: { fontSize: 14, color: '#444', display: 'flex', alignItems: 'center' },
  downloadButton: { padding: '10px 18px', background: 'linear-gradient(135deg, #43cea2, #185a9d)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', transition: '0.3s ease' },
  refreshButton: { padding: '10px 18px', background: 'linear-gradient(135deg, #36d1dc, #5b86e5)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', transition: '0.3s ease' },
  loaderWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 },
  loader: { width: 50, height: 50, border: '5px solid #eee', borderTop: '5px solid #1a73e8', borderRadius: '50%', animation: 'spin 1s linear infinite' },
};

// Dark Mode
const darkStyles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 30,
    fontFamily: 'Segoe UI, sans-serif',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: 12,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    color: '#e2e8f0',
    transition: 'all 0.4s ease',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#60a5fa' },
  toggleButton: {
    padding: "8px 14px",
    background: "#334155",
    border: "1px solid #475569",
    borderRadius: 8,
    color: "#e2e8f0",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s ease",
  },
  fullRow: { display: 'flex', gap: 20, marginBottom: 15 },
  label: { fontWeight: '600', fontSize: 14, marginBottom: 6, color: '#cbd5e1' },
  bottomActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  checkbox: { fontSize: 14, color: '#e2e8f0', display: 'flex', alignItems: 'center' },
  downloadButton: { padding: '10px 18px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', transition: '0.3s ease' },
  refreshButton: { padding: '10px 18px', background: 'linear-gradient(135deg, #9333ea, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: '600', cursor: 'pointer', transition: '0.3s ease' },
  loaderWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 },
  loader: { width: 50, height: 50, border: '5px solid #475569', borderTop: '5px solid #60a5fa', borderRadius: '50%', animation: 'spin 1s linear infinite' },
};

// Animasi tambahan
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  button:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);
