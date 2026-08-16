import Mongoose from "mongoose";
import { Alamat, Orangtua, PendidikanSebelumnya, Santri } from "../types/Santri";
import { Sekolah } from "../types/Sekolah";

const Schema = Mongoose.Schema;

const OrangtuaSchema = new Schema<Orangtua>({
    nik: {
        type: Schema.Types.String,
        required: false
    },
    statusHidup: {
        type: Schema.Types.String,
        required: false
    },
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
    },
    noHp: {
        type: Schema.Types.String,
        required: false
    }
}, { _id: false })
const AlamatSchema = new Schema<Alamat>({
    jalan: { type: Schema.Types.String, required: true },
    rtRw: { type: Schema.Types.String, required: false },
    kodeDesaKelurahan: { type: Schema.Types.String, required: true },
    desaKelurahan: { type: Schema.Types.String, required: true },
    kodeKecamatan: { type: Schema.Types.String, required: true },
    kecamatan: { type: Schema.Types.String, required: true },
    kodeKabupatenKota: { type: Schema.Types.String, required: true },
    kabupatenKota: { type: Schema.Types.String, required: true },
    kodeProvinsi: { type: Schema.Types.String, required: true },
    provinsi: { type: Schema.Types.String, required: true },
    kodePos: { type: Schema.Types.String, required: false }
}, { _id: false });


const PendidikanSebelumnyaSchema = new Schema<PendidikanSebelumnya>({
    namaSekolah: {
        type: Schema.Types.String,
        required: true,
    },
    jenjangTerakhir: {
        type: Schema.Types.String,
        required: true
    },
    tahunMasuk: {
        type: Schema.Types.String,
        required: true
    },
    tahunLulus: {
        type: Schema.Types.String,
        required: true
    }
})

const SantriSchema = new Schema<Santri>({
    nik: {
        type: Schema.Types.String,
        unique: true,
        sparse: true,
        required: false
    },
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
    jenisKelamin: {
        type: Schema.Types.String,
        enum: ['L', 'P'],
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
    fotoUrl: {
        type: Schema.Types.String,
        required: false
    },
    anakKe: {
        type: Schema.Types.Number,
        required: false
    },
    jumlahSaudara: {
        type: Schema.Types.Number,
        required: false
    },
    noHp: {
        type: Schema.Types.String,
        required: false
    },
    noKk: {
        type: Schema.Types.String,
        required: false
    },
    namaKepalaKeluarga: {
        type: Schema.Types.String,
        required: false
    },
    pendidikanTerakhir: {
        type: PendidikanSebelumnyaSchema,
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
    sekolahId: {
        type: Schema.Types.ObjectId,
        ref: 'Sekolah',
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
        enum: ['aktif', 'alumni', 'dikeluarkan'],
        required: true
    },
    laundry: {
        type: Schema.Types.Boolean,
        required: true
    }
}, { timestamps: true })

const SantriModels = Mongoose.model("Santri", SantriSchema);

export default SantriModels;