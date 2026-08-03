import Mongoose from "mongoose";

export interface Kamar {
    namaKamar: string;
    asramaId: Mongoose.Types.ObjectId;
    kapasitas: number;
}

const Schema = Mongoose.Schema;

const KamarSchema = new Schema<Kamar>({
    namaKamar: {
        type: Schema.Types.String,
        required: true
    },
    asramaId: {
        type: Schema.Types.ObjectId,
        ref: "Asrama",
        required: true,
    },
    kapasitas: {
        type: Schema.Types.Number,
        required: true
    }
}, { timestamps: true })

const KamarModels = Mongoose.model("Kamar", KamarSchema);

export default KamarModels;