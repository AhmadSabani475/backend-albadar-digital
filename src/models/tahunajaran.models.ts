import mongoose from "mongoose";
import { TahunAjaran } from "../types/TahunAjaran";


const Schema = mongoose.Schema;

const TahunAjaranSchema = new Schema<TahunAjaran>({
    nama: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    tanggalMulai: {
        type: Schema.Types.Date,
        required: true
    },
    tanggalSelesai: {
        type: Schema.Types.Date,
        required: false
    },
    is_active: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true })

const TahunAjaranModel = mongoose.model('TahunAjaran', TahunAjaranSchema);

export default TahunAjaranModel;