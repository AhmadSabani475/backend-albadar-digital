import mongoose from "mongoose";
import { TarifKhusus } from "../types/TarifKhusus";

const Schema = mongoose.Schema;

const TarifKhususSchema = new Schema<TarifKhusus>({
    santriId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Santri"
    },
    jenisTagihanId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'JenisTagihan'
    },
    nominalKhusus: {
        type: Schema.Types.Number,
        required: true,
    },
    keterangan: {
        type: Schema.Types.String,
        required: false
    }
}, { timestamps: true })
TarifKhususSchema.index({ santriId: 1, jenisTagihanId: 1 }, { unique: true });
const TarifKhususModel = mongoose.model('TarifKhusus', TarifKhususSchema);

export default TarifKhususModel;