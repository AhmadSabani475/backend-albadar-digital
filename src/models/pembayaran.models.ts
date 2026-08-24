import mongoose from "mongoose";
import { Pembayaran } from "../types/Pembayaran";


const Schema = mongoose.Schema;

const PembayaranValidateSchema = new Schema<Pembayaran>({
    santriId: {
        type: Schema.Types.ObjectId,
        ref: 'Santri',
        required: true
    },
    tagihanId: {
        type: Schema.Types.ObjectId,
        ref: 'Tagihan',
        required: true
    },
    dicatatOleh: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nominalBayar: {
        type: Schema.Types.Number,
        required: true
    },
    tanggalBayar: {
        type: Schema.Types.Date,
        required: true
    }
}, { timestamps: true })

const PembayaranModel = mongoose.model('Pembayaran', PembayaranValidateSchema);

export default PembayaranModel;