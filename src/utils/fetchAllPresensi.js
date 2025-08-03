import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchAllPresensiData = async () => {
  const hasilAkhir = [];

  try {
    const userSnapshot = await getDocs(collection(db, 'users'));

    for (const userDoc of userSnapshot.docs) {
      const uid = userDoc.id;
      const nama = userDoc.data().nama || 'Tanpa Nama';

      const presensiSnapshot = await getDocs(collection(db, `users/${uid}/presensi`));
      const izinSnapshot = await getDocs(collection(db, 'izin'));

      const hasilUser = {};

      for (const presensiDoc of presensiSnapshot.docs) {
        const tanggal = presensiDoc.id;
        const logsSnapshot = await getDocs(collection(db, `users/${uid}/presensi/${tanggal}/logs`));
        const item = { nama, tanggal, jamDatang: null, jamPulang: null, denda: 0 };

        logsSnapshot.forEach(doc => {
          const data = doc.data();
          const waktu = data.timestamp?.toDate();
          if (!waktu) return;

          if (data.jenis === 'Masuk') {
            item.jamDatang = waktu.toLocaleTimeString('id-ID');
          } else if (data.jenis === 'Pulang') {
            item.jamPulang = waktu.toLocaleTimeString('id-ID');
          }
        });

        const batas = new Date(tanggal);
        batas.setHours(8, 5, 0, 0);

        const jamDatangDate = logsSnapshot.docs.find(d => d.data().jenis === 'Masuk')?.data().timestamp?.toDate();
        if (jamDatangDate && jamDatangDate > batas) {
          item.denda = 25000;
        }

        hasilUser[tanggal] = item;
      }

      izinSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uid !== uid) return;

        const tanggalIzin = data.tanggal?.toDate()?.toISOString().split('T')[0];
        if (!tanggalIzin) return;

        if (!hasilUser[tanggalIzin]) {
          hasilUser[tanggalIzin] = { nama, tanggal: tanggalIzin };
        }

        hasilUser[tanggalIzin].jamIzin = data.mulai?.toDate()?.toLocaleTimeString('id-ID');
        hasilUser[tanggalIzin].jamKembali = data.kembali?.toDate()?.toLocaleTimeString('id-ID');
      });

      hasilAkhir.push(...Object.values(hasilUser));
    }

    return hasilAkhir.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (error) {
    console.error('❌ Gagal ambil data:', error);
    return [];
  }
};
