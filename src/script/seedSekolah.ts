import mongoose from "mongoose";
import dotenv from "dotenv";
import SekolahModel from "../models/sekolah.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

const dataSekolah = [
    { nama: "SMP Al-Badar", jenjang: "SMP/MTs" },
    { nama: "Mts Yppa", jenjang: "SMP/MTs" },
    { nama: "SMA Al-Badar", jenjang: "SMA/MA" },
    { nama: "MA Yppa", jenjang: "SMA/MA" },
];

async function seedSekolah() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        let created = 0;
        for (const s of dataSekolah) {
            const exists = await SekolahModel.findOne({ nama: s.nama });
            if (exists) {
                console.log(`Sekolah "${s.nama}" sudah ada, skip`);
                continue;
            }

            await SekolahModel.create(s);
            created++;
        }

        console.log(`=== SELESAI: ${created} sekolah baru dibuat (${dataSekolah.length - created} sudah ada sebelumnya) ===`);
        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding:", err);
        process.exit(1);
    }
}

seedSekolah();