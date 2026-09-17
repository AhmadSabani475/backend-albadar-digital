import mongoose from "mongoose";
import { Kwitansi } from "../types/Kwitansi";


const Schema = mongoose.Schema;

const KwitansiItemSchema = new Schema({
    tipe: {
        type: String,
        enum: ['bayar_tagihan', 'setor_rekening', 'tarik_rekening'],
        required: true
    },
    referensiId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    nominal: {
        type: Number,
        required: true
    },
    label: { type: String, required: true },
    keterangan: {
        type: String
    }
}, { _id: false });

const SaldoSnapshotSchema = new Schema({
    jenisRekening: {
        type: String,
        enum: ['uang_jajan', 'tabungan_ziarah'],
        required: true
    },
    saldo: {
        type: Number,
        required: true
    }
}, { _id: false });

const KwitansiValidateSchema = new Schema<Kwitansi>({
    nomorKwitansi: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    santriId: {
        type: Schema.Types.ObjectId,
        ref: 'Santri',
        required: true
    },
    metodePembayaran: {
        type: Schema.Types.String,
        enum: ['cash', 'transfer'],
        required: true,
        default: 'cash'
    },
    buktiTransferUrl: {
        type: Schema.Types.String
    },
    items: {
        type: [KwitansiItemSchema],
        required: true
    },
    saldoSnapshot: {
        type: [SaldoSnapshotSchema],
        required: true
    },
    totalNominal: {
        type: Schema.Types.Number,
        required: true
    },
    diCatatOleh: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true })

const KwitansiModel = mongoose.model('Kwitansi', KwitansiValidateSchema);
export default KwitansiModel;