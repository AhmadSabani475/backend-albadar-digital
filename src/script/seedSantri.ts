import mongoose from "mongoose";
import dotenv from "dotenv";
import AsramaModels from "../models/asrama.models";
import KamarModels from "../models/kamar.models";
import SekolahModel from "../models/sekolah.models";
import SantriModels from "../models/santri.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

/**
 * Data mentah santri batch 2 (nama-nama baru, beda dari seeder batch 1).
 * Field `sekolah` di sini cuma dipakai sebagai key lookup ke koleksi Sekolah,
 * bukan field asli di schema Santri — lihat langkah 3 & buildSantriPayload().
 */
const dataSantri = [
    { namaLengkap: "Fajar Nur Ihsan", jenisKelamin: "L", tempatLahir: "Bandung", tanggalLahir: "2010-01-15", sekolah: "SMP Al-Badar", ayah: { nama: "Herman Wijaya" }, ibu: { nama: "Lina Marlina" } },
    { namaLengkap: "Ridwan Maulana Yusuf", jenisKelamin: "L", tempatLahir: "Cimahi", tanggalLahir: "2009-05-02", sekolah: "SMP Al-Badar", ayah: { nama: "Yayat Hidayat" }, ibu: { nama: "Wati Sumiati" } },
    { namaLengkap: "Siti Nur Azizah", jenisKelamin: "P", tempatLahir: "Bandung", tanggalLahir: "2010-08-21", sekolah: "SMP Al-Badar", ayah: { nama: "Iwan Ridwan" }, ibu: { nama: "Neng Fitriani" } },
    { namaLengkap: "Salsabila Putri Ramadhani", jenisKelamin: "P", tempatLahir: "Cianjur", tanggalLahir: "2009-12-03", sekolah: "SMP Al-Badar", ayah: { nama: "Deni Kurniawan" }, ibu: { nama: "Yeni Andriani" } },
    { namaLengkap: "Rangga Aditya Pratama", jenisKelamin: "L", tempatLahir: "Sumedang", tanggalLahir: "2010-04-19", sekolah: "SMP Al-Badar", ayah: { nama: "Tono Sutrisno" }, ibu: { nama: "Iis Nuraeni" } },
    { namaLengkap: "Nadia Zahra Aulia", jenisKelamin: "P", tempatLahir: "Garut", tanggalLahir: "2009-09-27", sekolah: "SMP Al-Badar", ayah: { nama: "Ujang Kosasih" }, ibu: { nama: "Susi Susanti" } },
    { namaLengkap: "Farhan Maulana Ibrahim", jenisKelamin: "L", tempatLahir: "Tasikmalaya", tanggalLahir: "2010-06-11", sekolah: "SMP Al-Badar", ayah: { nama: "Aep Saefudin" }, ibu: { nama: "Rohaeni" } },
    { namaLengkap: "Zahra Kamila Putri", jenisKelamin: "P", tempatLahir: "Bogor", tanggalLahir: "2009-11-08", sekolah: "SMP Al-Badar", ayah: { nama: "Deden Setiawan" }, ibu: { nama: "Yanti Suryani" } },
    { namaLengkap: "Rizky Ananda Firmansyah", jenisKelamin: "L", tempatLahir: "Sukabumi", tanggalLahir: "2010-02-25", sekolah: "SMP Al-Badar", ayah: { nama: "Asep Kurnia" }, ibu: { nama: "Tati Hartati" } },
    { namaLengkap: "Alya Putri Anggraini", jenisKelamin: "P", tempatLahir: "Purwakarta", tanggalLahir: "2009-07-14", sekolah: "SMP Al-Badar", ayah: { nama: "Wawan Gunawan" }, ibu: { nama: "Erna Wati" } },
    { namaLengkap: "Dimas Bagus Prasetyo", jenisKelamin: "L", tempatLahir: "Karawang", tanggalLahir: "2010-03-30", sekolah: "SMP Al-Badar", ayah: { nama: "Endang Suherman" }, ibu: { nama: "Yani Rosita" } },
    { namaLengkap: "Keisya Ramadhani Putri", jenisKelamin: "P", tempatLahir: "Subang", tanggalLahir: "2009-10-05", sekolah: "SMP Al-Badar", ayah: { nama: "Dadan Ramdan" }, ibu: { nama: "Popon Suryani" } },
    { namaLengkap: "Reza Fahlevi Nugraha", jenisKelamin: "L", tempatLahir: "Indramayu", tanggalLahir: "2010-05-17", sekolah: "SMP Al-Badar", ayah: { nama: "Cecep Hidayat" }, ibu: { nama: "Lilis Karlina" } },
    { namaLengkap: "Putri Ayu Lestari", jenisKelamin: "P", tempatLahir: "Ciamis", tanggalLahir: "2009-08-09", sekolah: "SMP Al-Badar", ayah: { nama: "Firman Nugraha" }, ibu: { nama: "Sri Rahayu" } },
    { namaLengkap: "Gilang Ramadhan Saputra", jenisKelamin: "L", tempatLahir: "Majalengka", tanggalLahir: "2010-07-23", sekolah: "SMP Al-Badar", ayah: { nama: "Endang Sudrajat" }, ibu: { nama: "Titin Kartini" } },
];

// Default alamat lengkap, ikut format alamatValidateSchema di controller (kode-kode wajib diisi)
const alamatDefault = {
    jalan: "Jl. Pesantren No. 5",
    rtRw: "03/04",
    kodeDesaKelurahan: "3273010002",
    desaKelurahan: "Sukapura",
    kodeKecamatan: "327302",
    kecamatan: "Cinambo",
    kodeKabupatenKota: "3273",
    kabupatenKota: "Bandung",
    kodeProvinsi: "32",
    provinsi: "Jawa Barat",
    kodePos: "40295",
};

/**
 * Lengkapi 1 data mentah dari dataSantri menjadi payload penuh
 * sesuai santriValidateSchema (pendidikanTerakhir, ayah, ibu, alamat, dst).
 */
function buildSantriPayload(s: (typeof dataSantri)[number], index: number, kamarId: string, sekolahId: string) {
    const tahunLahir = new Date(s.tanggalLahir).getFullYear();
    const tahunMasukSd = tahunLahir + 6;
    const tahunLulusSd = tahunMasukSd + 6;

    return {
        namaLengkap: s.namaLengkap,
        jenisKelamin: s.jenisKelamin as "L" | "P",
        tempatLahir: s.tempatLahir,
        tanggalLahir: new Date(s.tanggalLahir),
        anakKe: (index % 4) + 1,
        jumlahSaudara: (index % 3) + 1,
        pendidikanTerakhir: {
            jenjangTerakhir: "SD",
            namaSekolah: `SDN 1 ${s.tempatLahir}`,
            tahunMasuk: String(tahunMasukSd),
            tahunLulus: String(tahunLulusSd),
        },
        ayah: {
            nama: s.ayah.nama,
            statusHidup: "Hidup",
        },
        ibu: {
            nama: s.ibu.nama,
            statusHidup: "Hidup",
        },
        alamat: alamatDefault,
        sekolahId,
        kamarId,
        laundry: false,
        tanggalTerdaftar: new Date(),
        status: "aktif",
    };
}

async function seedSantri() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Pastikan ada asrama (pakai Asrama Putri karena batch ini campur L/P,
        //    ganti sesuai kebutuhan kalau di project-mu asrama dipisah per gender)
        let asrama = await AsramaModels.findOne({ namaAsrama: "Asrama Putra 2" });
        if (!asrama) {
            asrama = await AsramaModels.create({
                namaAsrama: "Asrama Putra 2",
                keterangan: "Asrama untuk testing batch 2",
            });
            console.log("Asrama Putra 2 berhasil dibuat");
        }

        // 2. Pastikan ada 2 kamar baru (beda dari batch 1: Kamar A1/A2) dengan kapasitas cukup
        const kamarList = [];
        for (const namaKamar of ["Kamar B1", "Kamar B2"]) {
            let kamar = await KamarModels.findOne({ namaKamar });
            if (!kamar) {
                kamar = await KamarModels.create({
                    namaKamar,
                    asramaId: asrama._id,
                    kapasitas: 10,
                });
                console.log(`Kamar ${namaKamar} berhasil dibuat`);
            } else {
                console.log(`Kamar ${namaKamar} sudah ada, pakai yang existing`);
            }
            kamarList.push(kamar);
        }

        // 3. Pastikan sekolah tujuan ada (sekolahId wajib diisi di schema baru)
        const namaSekolahSet = [...new Set(dataSantri.map((s) => s.sekolah))];
        const sekolahMap = new Map<string, mongoose.Types.ObjectId>();
        for (const nama of namaSekolahSet) {
            let sekolah = await SekolahModel.findOne({ nama });
            if (!sekolah) {
                sekolah = await SekolahModel.create({
                    nama,
                    jenjang: "SMP/MTs",
                });
                console.log(`Sekolah ${nama} berhasil dibuat`);
            } else {
                console.log(`Sekolah ${nama} sudah ada, pakai yang existing`);
            }
            sekolahMap.set(nama, sekolah._id as mongoose.Types.ObjectId);
        }

        // 4. Seed santri, disebar bergantian ke 2 kamar
        let created = 0;
        for (let i = 0; i < dataSantri.length; i++) {
            const s = dataSantri[i];

            const exists = await SantriModels.findOne({ namaLengkap: s.namaLengkap });
            if (exists) {
                console.log(`Santri "${s.namaLengkap}" sudah ada, skip`);
                continue;
            }

            const kamar = kamarList[i % kamarList.length]; // gantian B1, B2
            const sekolahId = sekolahMap.get(s.sekolah)!.toString();

            const payload = buildSantriPayload(s, i, kamar._id.toString(), sekolahId);
            await SantriModels.create(payload);

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