// fetchAllPresensi.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const fetchAllPresensiData = async () => {
  const hasilAkhir = [];

  const getDateKey = (date) => {
    const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
    if (isNaN(d)) return null;
    return d.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const formatJam = (val) => {
    if (!val) return null;
    if (val instanceof Date)
      return val.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (val?.toDate)
      return val.toDate().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (typeof val === "string") return val; // asumsinya string HH:mm
    return null;
  };

  try {
    const userSnapshot = await getDocs(collection(db, 'users'));
    const izinSnapshot = await getDocs(collection(db, 'izin'));
    const izinTerlambatSnapshot = await getDocs(collection(db, 'izinTerlambat'));
    const globalPulangSnapshot = await getDocs(collection(db, 'presensi'));

    for (const userDoc of userSnapshot.docs) {
      const uid = userDoc.id;
      const nama = userDoc.data().nama || 'Tanpa Nama';
      const hasilUser = {};

      // =============== PRESENSI (subkoleksi) ===============
      const presensiSnapshot = await getDocs(
        collection(db, `users/${uid}/presensi`)
      );

      for (const presensiDoc of presensiSnapshot.docs) {
        const rawTanggal = presensiDoc.id;
        const tanggalObj = new Date(rawTanggal);
        const key = getDateKey(tanggalObj);
        if (!key) continue;

        if (!hasilUser[key]) {
          hasilUser[key] = {
            uid,
            nama,
            tanggal: tanggalObj,
            jamDatang: null,
            jamPulang: null,
            alasanTerlambat: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            alasanIzinPulang: null,
            denda: 0,
          };
        }

        const logsSnapshot = await getDocs(
          collection(db, `users/${uid}/presensi/${rawTanggal}/logs`)
        );

        logsSnapshot.forEach((doc) => {
          const data = doc.data();
          const waktu = data.timestamp?.toDate?.();
          if (!waktu) return;

          if (data.jenis === "Masuk") {
            hasilUser[key].jamDatang = waktu;
          } else if (data.jenis === "Pulang") {
            hasilUser[key].jamPulang = waktu;
          }
        });

        // Hitung denda
        const batas = new Date(tanggalObj);
        batas.setHours(8, 5, 0, 0);
        if (hasilUser[key].jamDatang && hasilUser[key].jamDatang > batas) {
          hasilUser[key].denda = 25000;
        }
      }

      // =============== GLOBAL PRESENSI (tombol Pulang) ===============
      globalPulangSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;
        if (data.jenis !== "pulang") return;

        const tanggalObj = data.tanggal?.toDate?.() || new Date(data.tanggal);
        const key = getDateKey(tanggalObj);
        if (!key) return;

        if (!hasilUser[key]) {
          hasilUser[key] = {
            uid,
            nama,
            tanggal: tanggalObj,
            jamDatang: null,
            jamPulang: null,
            alasanTerlambat: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            alasanIzinPulang: null,
            denda: 0,
          };
        }

        if (!hasilUser[key].jamPulang) {
          hasilUser[key].jamPulang = data.timestamp?.toDate?.() || null;
        }
      });

      // =============== IZIN ===============
      izinSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;

        const tanggalIzin = getDateKey(data.tanggal);
        if (!tanggalIzin) return;

        if (!hasilUser[tanggalIzin]) {
          hasilUser[tanggalIzin] = {
            uid,
            nama,
            tanggal: data.tanggal?.toDate?.() || new Date(data.tanggal),
            jamDatang: null,
            jamPulang: null,
            alasanTerlambat: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            alasanIzinPulang: null,
            denda: 0,
          };
        }

        if (data.jenis === "pulang") {
          let jamIzinPulang =
            data.jam ||
            data.jam?.toDate?.()?.toLocaleTimeString("id-ID") ||
            data.timestamp?.toDate?.()?.toLocaleTimeString("id-ID") ||
            null;

          if (!hasilUser[tanggalIzin].jamPulang) {
            hasilUser[tanggalIzin].jamPulang = jamIzinPulang;
          }
          hasilUser[tanggalIzin].alasanIzinPulang = data.alasan || "-";
        } else {
          hasilUser[tanggalIzin].jamIzin = formatJam(data.mulai);
          hasilUser[tanggalIzin].jamKembali = formatJam(data.kembali);
          hasilUser[tanggalIzin].alasanIzin = data.alasan || "-";
        }
      });

      // =============== IZIN TERLAMBAT ===============
      izinTerlambatSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid !== uid) return;

        const key = getDateKey(data.timestamp);
        if (!key) return;

        if (!hasilUser[key]) {
          hasilUser[key] = {
            uid,
            nama,
            tanggal: data.timestamp?.toDate?.() || new Date(),
            jamDatang: null,
            jamPulang: null,
            alasanTerlambat: null,
            jamIzin: null,
            jamKembali: null,
            alasanIzin: null,
            alasanIzinPulang: null,
            denda: 0,
          };
        }

        hasilUser[key].alasanTerlambat = data.alasan || "-";
      });

      // =============== FORMAT UNTUK TABEL ADMIN ===============
      Object.values(hasilUser).forEach((item) => {
        item.jamDatang = formatJam(item.jamDatang);
        item.jamPulang = formatJam(item.jamPulang);

        // Gabung datang + izin terlambat
        if (item.jamDatang || item.alasanTerlambat) {
          item.datangGabung = `${item.jamDatang || "-"}${
            item.alasanTerlambat ? ` (${item.alasanTerlambat})` : ""
          }`;
        } else {
          item.datangGabung = "-";
        }

        // Gabung pulang + izin pulang
        if (item.jamPulang || item.alasanIzinPulang) {
          item.pulangGabung = `${item.jamPulang || "-"}${
            item.alasanIzinPulang ? ` (${item.alasanIzinPulang})` : ""
          }`;
        } else {
          item.pulangGabung = "-";
        }
      });

      hasilAkhir.push(...Object.values(hasilUser));
    }

    return hasilAkhir.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    return [];
  }
};
