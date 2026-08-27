import mongoose from "mongoose";
import { Rekening } from "../types/Rekening";

const Schema = mongoose.Schema;

const RekeningSchema = new Schema<Rekening>({
    santriId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Santri'
    },
    jenisRekening: {
        type: Schema.Types.String,
        enum: ['uang_jajan', 'tabungan_ziarah'],
        required: true
    },
    saldo: {
        type: Schema.Types.Number,
        default: 0,
        required: true
    },
    nominalHarian: {
        type: Schema.Types.Number,
        required: false
    }
}, { timestamps: true })
RekeningSchema.index({ santriId: 1, jenisRekening: 1 }, { unique: true })
const RekeningModel = mongoose.model('Rekening', RekeningSchema);

export default RekeningModel;