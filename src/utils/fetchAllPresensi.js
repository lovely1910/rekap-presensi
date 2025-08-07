import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchAllPresensiData = async () => {
  const hasilAkhir = [];

  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    const izinSnapshot = await getDocs(collection(db, 'izin'));

    for (const userDoc of userSnapshot.docs) {
      const uid = userDoc.id;
      const nama = userDoc.data().nama || 'Tanpa Nama';
      const hasilUser = {};

      const presensiSnapshot = await getDocs(collection(db, `users/${uid}/presensi`));

      for (const presensiDoc of presensiSnapshot.docs) {
        const tanggal = presensiDoc.id;
        const logsSnapshot = await getDocs(collection(db, `users/${uid}/presensi/${tanggal}/logs`));

        const item = {
          nama,
          tanggal,
          jamDatang: null,
          jamPulang: null,
          denda: 0,
        };

        logsSnapshot.forEach((doc) => {
          const data = doc.data();
          const waktu = data.timestamp?.toDate?.(); // check if toDate exists
          if (!waktu) return;

          if (data.jenis === 'Masuk') {
            item.jamDatang = waktu.toLocaleTimeString('id-ID');
          } else if (data.jenis === 'Pulang') {
            item.jamPulang = waktu.toLocaleTimeString('id-ID');
          }
        });

        // Hitung denda jika jam datang lebih dari jam 08:05
        const batas = new Date(tanggal);
        batas.setHours(8, 5, 0, 0);

        const jamDatangDate = logsSnapshot.docs.find(
          (d) => d.data().jenis === 'Masuk'
        )?.data().timestamp?.toDate?.();

        if (jamDatangDate && jamDatangDate > batas) {
          item.denda = 25000;
        }

        hasilUser[tanggal] = item;
      }

      // Proses izin
      izinSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;

        let tanggalIzin = null;

        // Coba deteksi jenis tanggal
        if (data.tanggal instanceof Date) {
          tanggalIzin = data.tanggal.toISOString().split('T')[0];
        } else if (data.tanggal?.toDate) {
          tanggalIzin = data.tanggal.toDate().toISOString().split('T')[0];
        } else if (typeof data.tanggal === 'string') {
          tanggalIzin = data.tanggal;
        }

        if (!tanggalIzin) return;

        if (!hasilUser[tanggalIzin]) {
          hasilUser[tanggalIzin] = { nama, tanggal: tanggalIzin };
        }

        if (data.mulai?.toDate) {
          hasilUser[tanggalIzin].jamIzin = data.mulai.toDate().toLocaleTimeString('id-ID');
        }

        if (data.kembali?.toDate) {
          hasilUser[tanggalIzin].jamKembali = data.kembali.toDate().toLocaleTimeString('id-ID');
        }
      });

      hasilAkhir.push(...Object.values(hasilUser));
    }

    // Urutkan dari tanggal terbaru
    return hasilAkhir.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (error) {
    console.error('❌ Gagal ambil data:', error);
    return [];
  }
};
