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
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fff'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#fff',
          padding: '30px 40px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '320px',
          border: '1px solid #eee'
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: 20,
          color: '#333'
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
            backgroundColor: '#2196F3',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}



// ===== Halaman Rekap Presensi =====
function RekapPresensi() {
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Rekap Presensi</h2>

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
      <div style={styles.fullRow}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Rentang Tanggal:</label>
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
      <div style={styles.bottomActions}>
        <label style={styles.checkbox}>
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
            style={styles.downloadButton}
            disabled={loading}
          >
            📥 Download Excel
          </button>
          <button onClick={handleRefresh} style={styles.refreshButton} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderWrapper}>
          <div style={styles.loader}></div>
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

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <RekapPresensi />;
}

// ===== Styles =====
const styles = {
  container: {
    maxWidth: 900,
    margin: '0 auto',
    padding: 30,
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fullRow: {
    display: 'flex',
    gap: 20,
    marginBottom: 15,
  },
  label: {
    display: 'block',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 5,
  },
  bottomActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  checkbox: {
    fontSize: 14,
  },
  downloadButton: {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loaderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 40,
  },
  loader: {
    width: 40,
    height: 40,
    border: '4px solid #ccc',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Inject animasi spin
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);
