import mongoose from "mongoose";
import dotenv from "dotenv";
import AsramaModels from "../models/asrama.models";
import KamarModels from "../models/kamar.models";
import SantriModels from "../models/santri.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

const dataSantri = [
    { namaLengkap: "Ahmad Fadillah", tempatLahir: "Bandung", tanggalLahir: "2010-03-12", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Suherman" }, ibu: { nama: "Yanti" } },
    { namaLengkap: "Muhammad Rizki", tempatLahir: "Cirebon", tanggalLahir: "2009-07-25", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Dedi Supriadi" }, ibu: { nama: "Nurhayati" } },
    { namaLengkap: "Fauzan Al Ghifari", tempatLahir: "Garut", tanggalLahir: "2010-01-05", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Asep Saepudin" }, ibu: { nama: "Rina Marlina" } },
    { namaLengkap: "Zaki Hidayatullah", tempatLahir: "Tasikmalaya", tanggalLahir: "2009-11-18", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Ujang Hidayat" }, ibu: { nama: "Siti Aminah" } },
    { namaLengkap: "Ilham Maulana", tempatLahir: "Sumedang", tanggalLahir: "2010-05-30", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Wawan Setiawan" }, ibu: { nama: "Euis Kartika" } },
    { namaLengkap: "Rafi Ramadhan", tempatLahir: "Bandung", tanggalLahir: "2009-09-09", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Iyan Sopian" }, ibu: { nama: "Dewi Lestari" } },
    { namaLengkap: "Alfarizi Nugraha", tempatLahir: "Subang", tanggalLahir: "2010-02-14", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Dadang Suryana" }, ibu: { nama: "Yayah Rokayah" } },
    { namaLengkap: "Faiz Abdurrahman", tempatLahir: "Majalengka", tanggalLahir: "2009-12-20", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Endang Sudrajat" }, ibu: { nama: "Titin Suryani" } },
    { namaLengkap: "Naufal Aziz", tempatLahir: "Kuningan", tanggalLahir: "2010-04-08", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Ade Ruhiat" }, ibu: { nama: "Popon Sopiah" } },
    { namaLengkap: "Daffa Pratama", tempatLahir: "Indramayu", tanggalLahir: "2009-08-17", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Cecep Rahmat" }, ibu: { nama: "Lilis Suryani" } },
    { namaLengkap: "Haikal Firmansyah", tempatLahir: "Ciamis", tanggalLahir: "2010-06-22", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Firman Hidayat" }, ibu: { nama: "Sri Wahyuni" } },
    { namaLengkap: "Bilal Setiawan", tempatLahir: "Bogor", tanggalLahir: "2009-10-11", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Agus Setiawan" }, ibu: { nama: "Neneng Hasanah" } },
    { namaLengkap: "Rayhan Saputra", tempatLahir: "Sukabumi", tanggalLahir: "2010-03-27", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Yusuf Saputra" }, ibu: { nama: "Ratna Sari" } },
    { namaLengkap: "Fikri Ramadhani", tempatLahir: "Purwakarta", tanggalLahir: "2009-06-03", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Ridwan Kamil" }, ibu: { nama: "Ani Rohaeni" } },
    { namaLengkap: "Yusuf Al Farisi", tempatLahir: "Karawang", tanggalLahir: "2010-07-19", pendidikanTerakhir: "SD", sekolah: "SMP Al-Badar", ayah: { nama: "Farid Amin" }, ibu: { nama: "Mimin Sumarni" } },
];

const alamatDefault = {
    jalan: "Jl. Merdeka No. 10",
    rtRw: "01/02",
    desaKelurahan: "Sukamaju",
    kecamatan: "Cibiru",
    kabupatenKota: "Bandung",
    provinsi: "Jawa Barat",
    noTelepon: "081234567890",
};

async function seedSantri() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Pastikan ada asrama
        let asrama = await AsramaModels.findOne({ namaAsrama: "Asrama Putra 1" });
        if (!asrama) {
            asrama = await AsramaModels.create({
                namaAsrama: "Asrama Putra 1",
                keterangan: "Asrama untuk testing"
            });
        }

        // 2. Pastikan ada 2 kamar dengan kapasitas cukup buat nampung 15 santri
        const kamarList = [];
        for (const namaKamar of ["Kamar A1", "Kamar A2"]) {
            let kamar = await KamarModels.findOne({ namaKamar });
            if (!kamar) {
                kamar = await KamarModels.create({
                    namaKamar,
                    asramaId: asrama._id,
                    kapasitas: 10
                });
                console.log(`Kamar ${namaKamar} berhasil dibuat`);
            } else {
                console.log(`Kamar ${namaKamar} sudah ada, pakai yang existing`);
            }
            kamarList.push(kamar);
        }

        // 3. Seed santri, disebar bergantian ke 2 kamar
        let created = 0;
        for (let i = 0; i < dataSantri.length; i++) {
            const s = dataSantri[i];

            const exists = await SantriModels.findOne({ namaLengkap: s.namaLengkap });
            if (exists) {
                console.log(`Santri "${s.namaLengkap}" sudah ada, skip`);
                continue;
            }

            const kamar = kamarList[i % kamarList.length]; // gantian A1, A2

            await SantriModels.create({
                ...s,
                tanggalLahir: new Date(s.tanggalLahir),
                anakKe: (i % 4) + 1,
                jumlahSaudara: (i % 3) + 1,
                asalPesantren: "-",
                alamat: alamatDefault,
                kamarId: kamar._id,
                tanggalTerdaftar: new Date(),
                status: 'aktif'
            });

            created++;
        }

        console.log(`=== SELESAI: ${created} santri baru dibuat (${dataSantri.length - created} sudah ada sebelumnya) ===`);
        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding:", err);
        process.exit(1);
    }
}

seedSantri();