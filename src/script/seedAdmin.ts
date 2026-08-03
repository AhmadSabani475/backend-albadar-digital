import mongoose from "mongoose";
import dotenv from "dotenv";
import userModels from "../models/user.model";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

async function seedAdmin() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const existing = await userModels.findOne({ username: "admin" });
        if (existing) {
            console.log("Username 'admin' sudah ada, batal seeding.");
            process.exit(0);
        }

        const admin = await userModels.create({
            username: "admin",
            password: "password123",
            role: "admin",
            is_active: true
        });

        console.log("Admin berhasil dibuat:", admin);
        process.exit(0);
    } catch (err) {
        console.error("Gagal seeding admin:", err);
        process.exit(1);
    }
}

seedAdmin();