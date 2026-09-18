import mongoose from "mongoose";
import dotenv from "dotenv";
import AsramaModels from "../models/asrama.models";
import KamarModels from "../models/kamar.models";
import SantriModels from "../models/santri.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

const dataSantri = [
    { namaLengkap: "Fajar Nur Ihsan", jenisKelamin: "L", tempatLahir: "Bandung", tanggalLahir: "2010-01-15", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 7", kelasNgaji: "Kelas 1", ayah: { nama: "Herman Wijaya" }, ibu: { nama: "Lina Marlina" } },
    { namaLengkap: "Ridwan Maulana Yusuf", jenisKelamin: "L", tempatLahir: "Cimahi", tanggalLahir: "2009-05-02", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 8", kelasNgaji: "Kelas 2", ayah: { nama: "Yayat Hidayat" }, ibu: { nama: "Wati Sumiati" } },
    { namaLengkap: "Siti Nur Azizah", jenisKelamin: "P", tempatLahir: "Bandung", tanggalLahir: "2010-08-21", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 7", kelasNgaji: "Kelas 1", ayah: { nama: "Iwan Ridwan" }, ibu: { nama: "Neng Fitriani" } },
    { namaLengkap: "Salsabila Putri Ramadhani", jenisKelamin: "P", tempatLahir: "Cianjur", tanggalLahir: "2009-12-03", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 8", kelasNgaji: "Kelas 2", ayah: { nama: "Deni Kurniawan" }, ibu: { nama: "Yeni Andriani" } },
    { namaLengkap: "Rangga Aditya Pratama", jenisKelamin: "L", tempatLahir: "Sumedang", tanggalLahir: "2010-04-19", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 7", kelasNgaji: "Kelas 1", ayah: { nama: "Tono Sutrisno" }, ibu: { nama: "Iis Nuraeni" } },
    { namaLengkap: "Nadia Zahra Aulia", jenisKelamin: "P", tempatLahir: "Garut", tanggalLahir: "2009-09-27", sekolah: "SMP Al-Badar", kelasFormal: "Kelas 8", kelasNgaji: "Kelas 2", ayah: { nama: "Ujang Kosasih" }, ibu: { nama: "Susi Susanti" } },
    { namaLengkap: "Farhan Maulana Ibrahim", jenisKelamin: "L", tempatLahir: "Tasikmalaya", tanggalLahir: "2010-06-11", sekolah: "SMA Al-Badar", kelasFormal: "Kelas 10", kelasNgaji: "Kelas 4", ayah: { nama: "Aep Saefudin" }, ibu: { nama: "Rohaeni" } },
    { namaLengkap: "Zahra Kamila Putri", jenisKelamin: "P", tempatLahir: "Bogor", tanggalLahir: "2009-11-08", sekolah: "SMA Al-Badar", kelasFormal: "Kelas 10", kelasNgaji: "Kelas 4", ayah: { nama: "Deden Setiawan" }, ibu: { nama: "Yanti Suryani" } },
    { namaLengkap: "Rizky Ananda Firmansyah", jenisKelamin: "L", tempatLahir: "Sukabumi", tanggalLahir: "2010-02-25", sekolah: "SMA Al-Badar", kelasFormal: "Kelas 11", kelasNgaji: "Takhassus", ayah: { nama: "Asep Kurnia" }, ibu: { nama: "Tati Hartati" } },
    { namaLengkap: "Alya Putri Anggraini", jenisKelamin: "P", tempatLahir: "Purwakarta", tanggalLahir: "2009-07-14", sekolah: "Mahasiswa", kelasFormal: "Mahasiswa", kelasNgaji: "Takhassus", ayah: { nama: "Wawan Gunawan" }, ibu: { nama: "Erna Wati" } },
    { namaLengkap: "Dimas Bagus Prasetyo", jenisKelamin: "L", tempatLahir: "Karawang", tanggalLahir: "2010-03-30", sekolah: "Tidak Sekolah", kelasFormal: "Tidak Sekolah", kelasNgaji: "Takhassus", ayah: { nama: "Endang Suherman" }, ibu: { nama: "Yani Rosita" } },
];

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

function buildSantriPayload(s: (typeof dataSantri)[number], index: number, kamarId: string) {
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
        sekolah: s.sekolah,
        kelasFormal: s.kelasFormal,
        kelasNgaji: s.kelasNgaji,
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

        let asrama = await AsramaModels.findOne({ namaAsrama: "Asrama Putra 2" });
        if (!asrama) {
            asrama = await AsramaModels.create({
                namaAsrama: "Asrama Putra 2",
                keterangan: "Asrama untuk testing batch 2",
            });
        }

        const kamarList = [];
        for (const namaKamar of ["Kamar B1", "Kamar B2"]) {
            let kamar = await KamarModels.findOne({ namaKamar });
            if (!kamar) {
                kamar = await KamarModels.create({
                    namaKamar,
                    asramaId: asrama._id,
                    kapasitas: 10,
                });
            }
            kamarList.push(kamar);
        }

        let created = 0;
        for (let i = 0; i < dataSantri.length; i++) {
            const s = dataSantri[i];

            const exists = await SantriModels.findOne({ namaLengkap: s.namaLengkap });
            if (exists) {
                continue;
            }

            const kamar = kamarList[i % kamarList.length];
            const payload = buildSantriPayload(s, i, kamar._id.toString());
            await SantriModels.create(payload);

            created++;
        }

        console.log(`=== SELESAI: ${created} santri baru dibuat ===`);
        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding:", err);
        process.exit(1);
    }
}

seedSantri();