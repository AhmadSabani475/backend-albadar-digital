import Mongoose from "mongoose";
import { Alamat, Orangtua, Santri } from "../types/Santri";

const Schema = Mongoose.Schema;

const OrangtuaSchema = new Schema<Orangtua>({
    nama: {
        type: Schema.Types.String,
        required: true
    },
    pendidikan: {
        type: Schema.Types.String,
        required: false
    },
    pekerjaan: {
        type: Schema.Types.String,
        required: false
    }
}, { _id: false })
const AlamatSchema = new Schema<Alamat>({
    jalan: { type: Schema.Types.String, required: true },
    rtRw: { type: Schema.Types.String, required: false },
    desaKelurahan: { type: Schema.Types.String, required: true },
    kecamatan: { type: Schema.Types.String, required: true },
    kabupatenKota: { type: Schema.Types.String, required: true },
    provinsi: { type: Schema.Types.String, required: true },
    noTelepon: { type: Schema.Types.String, required: false },
}, { _id: false });

const SantriSchema = new Schema<Santri>({
    nis: {
        type: Schema.Types.String,
        unique: true,
        sparse: true,
        required: false
    },
    namaLengkap: {
        type: Schema.Types.String,
        required: true
    },
    tempatLahir: {
        type: Schema.Types.String,
        required: true
    },
    tanggalLahir: {
        type: Schema.Types.Date,
        required: true
    },
    anakKe: {
        type: Schema.Types.Number,
        required: false
    },
    jumlahSaudara: {
        type: Schema.Types.Number,
        required: false
    },
    asalPesantren: {
        type: Schema.Types.String,
        required: false
    },
    pendidikanTerakhir: {
        type: Schema.Types.String,
        required: true
    },
    ayah: {
        type: OrangtuaSchema,
        required: true
    },
    ibu: {
        type: OrangtuaSchema,
        required: true
    },
    alamat: {
        type: AlamatSchema,
        required: true
    },
    sekolah: {
        type: Schema.Types.String,
        required: true
    },
    kamarId: {
        type: Schema.Types.ObjectId,
        ref: "Kamar",
        required: true
    },
    tanggalTerdaftar: {
        type: Schema.Types.Date,
        required: true
    },
    status: {
        type: Schema.Types.String,
        enum: ['aktif', 'alumni'],
        required: true
    }
}, { timestamps: true })

const SantriModels = Mongoose.model("Santri", SantriSchema);

export default SantriModels;