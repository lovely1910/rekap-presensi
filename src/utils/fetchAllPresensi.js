// fetchAllPresensi.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchAllPresensiData = async () => {
  const hasilAkhir = [];

  const formatTanggal = (input) => {
    if (input instanceof Date) {
      return input.toISOString().split('T')[0];
    } else if (input?.toDate) {
      return input.toDate().toISOString().split('T')[0];
    } else if (typeof input === 'string') {
      return input;
    }
    return null;
  };

  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    const izinSnapshot = await getDocs(collection(db, 'izin'));
    const izinTerlambatSnapshot = await getDocs(collection(db, 'izinTerlambat'));

    for (const userDoc of userSnapshot.docs) {
      const uid = userDoc.id;
      const nama = userDoc.data().nama || 'Tanpa Nama';
      const hasilUser = {};

      // === PRESENSI ===
      const presensiSnapshot = await getDocs(collection(db, `users/${uid}/presensi`));

      for (const presensiDoc of presensiSnapshot.docs) {
        const tanggal = presensiDoc.id;
        const logsSnapshot = await getDocs(
          collection(db, `users/${uid}/presensi/${tanggal}/logs`)
        );

        hasilUser[tanggal] = {
          nama,
          tanggal,
          jamDatang: null,
          alasanTerlambat: null,
          jamPulang: null,
          alasanPulang: null,
          jamIzin: null,
          jamKembali: null,
          alasanIzin: null,
          denda: 0,
        };

        logsSnapshot.forEach((doc) => {
          const data = doc.data();
          const waktu = data.timestamp?.toDate?.();
          if (!waktu) return;

          if (data.jenis === 'Masuk') {
            hasilUser[tanggal].jamDatang = waktu.toLocaleTimeString('id-ID');
          } else if (data.jenis === 'Pulang') {
            hasilUser[tanggal].jamPulang = waktu.toLocaleTimeString('id-ID');
          }
        });

        // Hitung denda
        const batas = new Date(tanggal);
        batas.setHours(8, 5, 0, 0);
        const jamDatangDate = logsSnapshot.docs.find(
          (d) => d.data().jenis === 'Masuk'
        )?.data().timestamp?.toDate?.();

        if (jamDatangDate && jamDatangDate > batas) {
          hasilUser[tanggal].denda = 25000;
        }
      }

      // === IZIN (PULANG & KELUAR) ===
      izinSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;

        const tanggalIzin = formatTanggal(data.tanggal);
        if (!tanggalIzin) return;

        if (!hasilUser[tanggalIzin]) {
          hasilUser[tanggalIzin] = {
            nama,
            tanggal: tanggalIzin,
            jamDatang: null,
            alasanTerlambat: null,
            jamPulang: null,
            alasanPulang: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            denda: 0,
          };
        }

        if (data.jenis === 'pulang') {
          if (data.waktuPulang?.toDate) {
            hasilUser[tanggalIzin].jamPulang = data.waktuPulang
              .toDate()
              .toLocaleTimeString('id-ID');
          } else if (data.mulai?.toDate) {
            hasilUser[tanggalIzin].jamPulang = data.mulai
              .toDate()
              .toLocaleTimeString('id-ID');
          }
          hasilUser[tanggalIzin].alasanPulang = data.alasan || '-';
        } else {
          if (data.mulai?.toDate) {
            hasilUser[tanggalIzin].jamIzin = data.mulai
              .toDate()
              .toLocaleTimeString('id-ID');
          }
          if (data.kembali?.toDate) {
            hasilUser[tanggalIzin].jamKembali = data.kembali
              .toDate()
              .toLocaleTimeString('id-ID');
          }
          hasilUser[tanggalIzin].alasanIzin = data.alasan || '-';
        }
      });

      // === IZIN TERLAMBAT ===
      izinTerlambatSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;

        const tanggalTerlambat = formatTanggal(data.timestamp);
        if (!tanggalTerlambat) return;

        if (!hasilUser[tanggalTerlambat]) {
          hasilUser[tanggalTerlambat] = {
            nama,
            tanggal: tanggalTerlambat,
            jamDatang: null,
            alasanTerlambat: null,
            jamPulang: null,
            alasanPulang: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            denda: 0,
          };
        }

        hasilUser[tanggalTerlambat].alasanTerlambat = data.alasan || '-';
      });

      // === GABUNG FIELD TAMPILAN ===
      Object.values(hasilUser).forEach((item) => {
        // Gabung datang + izin terlambat
        if (item.jamDatang || item.alasanTerlambat) {
          item.datangGabung = `${item.jamDatang || '-'}${
            item.alasanTerlambat ? ` (${item.alasanTerlambat})` : ''
          }`;
        } else {
          item.datangGabung = '-';
        }

        // Gabung pulang + izin pulang
        if (item.jamPulang || item.alasanPulang) {
          item.pulangGabung = `${item.jamPulang || '-'}${
            item.alasanPulang ? ` (${item.alasanPulang})` : ''
          }`;
        } else {
          item.pulangGabung = '-';
        }
      });

      hasilAkhir.push(...Object.values(hasilUser));
    }

    return hasilAkhir.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (error) {
    console.error('❌ Gagal ambil data:', error);
    return [];
  }
};
