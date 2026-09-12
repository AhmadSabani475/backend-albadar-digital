import mongoose from "mongoose";

export interface TingkatNgaji {
    urutan: number;
    nama: string;
    isCheckpoint: boolean;
}

const Schema = mongoose.Schema;

const TingkatNgajiSchema = new Schema<TingkatNgaji>({
    urutan: {
        type: Schema.Types.Number,
        required: true,
        unique: true
    },
    nama: {
        type: Schema.Types.String,
        required: true
    },
    isCheckpoint: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })

const TingkatNgajiModel = mongoose.model('TingkatNgaji', TingkatNgajiSchema);
export default TingkatNgajiModel;