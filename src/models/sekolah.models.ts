import Mongoose from "mongoose"
import { Sekolah } from "../types/Sekolah";
import mongoose from "mongoose";

const Schema = Mongoose.Schema;

const SekolahSchema = new Schema<Sekolah>({
    nama: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    jenjang: {
        type: Schema.Types.String,
        required: true
    }
}, { timestamps: true })

const SekolahModel = mongoose.model('Sekolah', SekolahSchema);

export default SekolahModel;