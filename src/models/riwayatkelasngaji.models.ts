
import mongoose from "mongoose";
import { Types } from "mongoose";

export interface RiwayatKelasNgaji {
    santriId: Types.ObjectId;
    tahunAjaranId: Types.ObjectId;
    tingkatNgajiId?: Types.ObjectId | null;  
    statusLain?: string;                   
}

const Schema = mongoose.Schema;

const RiwayatKelasNgajiSchema = new Schema<RiwayatKelasNgaji>({
    santriId: {
        type: Schema.Types.ObjectId,
        ref: "Santri",
        required: true
    },
    tahunAjaranId: {
        type: Schema.Types.ObjectId,
        ref: "TahunAjaran",
        required: true
    },
    tingkatNgajiId: {
        type: Schema.Types.ObjectId,
        ref: "TingkatNgaji",
        required: false,
        default: null
    },
    statusLain: {
        type: Schema.Types.String,
        required: false
    }
}, { timestamps: true })


RiwayatKelasNgajiSchema.index({ santriId: 1, tahunAjaranId: 1 }, { unique: true });

const RiwayatKelasNgajiModel = mongoose.model('RiwayatKelasNgaji', RiwayatKelasNgajiSchema);
export default RiwayatKelasNgajiModel;