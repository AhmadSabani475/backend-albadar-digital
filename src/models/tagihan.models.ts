import mongoose from "mongoose";
import { Tagihan } from "../types/TarifKhusus";


const Schema = mongoose.Schema;

const TagihanValidateSchema = new Schema<Tagihan>({
    santriId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Santri'
    },
    jenisTagihanId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'JenisTagihan'
    },
    nominalTagihan: {
        type: Schema.Types.Number,
        required: true
    },
    jatuhTempo: {
        type: Schema.Types.Date,
        required: true
    },
    periode: {
        type: Schema.Types.String,
        required: true
    },
    status: {
        type: Schema.Types.String,
        enum: ['belum_bayar', 'lunas', 'sebagian'],
        default: 'belum_bayar',
        required: true
    },
    sumberNominal: {
        type: Schema.Types.String,
        enum: ['default', 'tarif_khusus'],
        default: 'default'
    }
}, { timestamps: true })
TagihanValidateSchema.index({ santriId: 1, jenisTagihanId: 1, periode: 1 }, { unique: true });
const TagihanModel = mongoose.model('Tagihan', TagihanValidateSchema);
export default TagihanModel;