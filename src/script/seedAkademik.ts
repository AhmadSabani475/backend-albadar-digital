// seedAkademik.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import SekolahModel from "../models/sekolah.models";
import TahunAjaranModel from "../models/tahunajaran.models";
import TingkatNgajiModel from "../models/tingkatngaji.models";
import TingkatKelasModel from "../models/tingkatkelas.models";


dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

// Mapping jenjang sekolah -> nama kelas yang dipakai (urutan 1,2,3)
// Sesuaikan kalau nama jenjang di data Sekolah lo beda dari ini
function getNamaKelasByJenjang(jenjang: string): string[] {
    const normalized = jenjang.toLowerCase();
    if (normalized.includes("smp") || normalized.includes("mts") || normalized.includes("tsanawiyah")) {
        return ["Kelas 7", "Kelas 8", "Kelas 9"];
    }
    if (normalized.includes("sma") || normalized.includes("ma") || normalized.includes("aliyah") || normalized.includes("smk")) {
        return ["Kelas 10", "Kelas 11", "Kelas 12"];
    }
    // fallback generic kalau jenjangnya nggak kekenal
    return ["Kelas 1", "Kelas 2", "Kelas 3"];
}

async function seedAkademik() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // ================= TAHUN AJARAN =================
        const namaTahunAjaran = "2026/2027";
        let tahunAjaran = await TahunAjaranModel.findOne({ nama: namaTahunAjaran });
        if (!tahunAjaran) {
            // pastikan cuma 1 yang aktif
            await TahunAjaranModel.updateMany({}, { is_active: false });
            tahunAjaran = await TahunAjaranModel.create({
                nama: namaTahunAjaran,
                tanggalMulai: new Date("2026-07-01"),
                tanggalSelesai: new Date("2027-06-30"),
                is_active: true,
            });
            console.log(`Tahun Ajaran ${namaTahunAjaran} berhasil dibuat`);
        } else {
            console.log(`Tahun Ajaran ${namaTahunAjaran} sudah ada, skip`);
        }

        // ================= TINGKAT NGAJI (1-6, fix) =================
        let tingkatNgajiCreated = 0;
        for (let urutan = 1; urutan <= 6; urutan++) {
            const exists = await TingkatNgajiModel.findOne({ urutan });
            if (!exists) {
                await TingkatNgajiModel.create({
                    urutan,
                    nama: `Kelas ${urutan} Ngaji`,
                });
                tingkatNgajiCreated++;
            }
        }
        console.log(`Tingkat Ngaji: ${tingkatNgajiCreated} baru dibuat (sisanya sudah ada)`);

        // ================= TINGKAT KELAS (dinamis dari Sekolah yang sudah ada) =================
        const semuaSekolah = await SekolahModel.find();
        if (semuaSekolah.length === 0) {
            console.warn("Belum ada data Sekolah di DB — jalankan seeder Sekolah dulu sebelum ini");
        }

        let tingkatKelasCreated = 0;
        for (const sekolah of semuaSekolah) {
            const namaKelasList = getNamaKelasByJenjang(sekolah.jenjang || "");

            for (let i = 0; i < namaKelasList.length; i++) {
                const urutan = i + 1;
                const exists = await TingkatKelasModel.findOne({
                    sekolahId: sekolah._id,
                    urutan,
                });
                if (!exists) {
                    await TingkatKelasModel.create({
                        nama: namaKelasList[i],
                        sekolahId: sekolah._id,
                        urutan,
                    });
                    tingkatKelasCreated++;
                }
            }
        }
        console.log(`Tingkat Kelas: ${tingkatKelasCreated} baru dibuat (sisanya sudah ada)`);

        console.log("=== SEEDING AKADEMIK SELESAI ===");
        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding akademik:", err);
        process.exit(1);
    }
}

seedAkademik();