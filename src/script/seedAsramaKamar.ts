import mongoose from "mongoose";
import dotenv from "dotenv";
import AsramaModels from "../models/asrama.models"; // sesuaikan nama file kalau beda
import KamarModels from "../models/kamar.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

async function seedAsramaKamar() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Seed Asrama
        let asrama = await AsramaModels.findOne({ namaAsrama: "Asrama Putra 1" });
        if (!asrama) {
            asrama = await AsramaModels.create({
                namaAsrama: "Asrama Putra 1",
                keterangan: "Asrama untuk testing"
            });
            console.log("Asrama berhasil dibuat:", asrama);
        } else {
            console.log("Asrama sudah ada, pakai yang existing:", asrama);
        }

        // 2. Seed Kamar
        let kamar = await KamarModels.findOne({ namaKamar: "Kamar A1" });
        if (!kamar) {
            kamar = await KamarModels.create({
                namaKamar: "Kamar A1",
                asramaId: asrama._id,
                kapasitas: 10
            });
            console.log("Kamar berhasil dibuat:", kamar);
        } else {
            console.log("Kamar sudah ada, pakai yang existing:", kamar);
        }

        console.log("=== SELESAI ===");
        console.log("kamarId buat testing:", kamar._id.toString());

        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding:", err);
        process.exit(1);
    }
}

seedAsramaKamar();