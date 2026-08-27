import mongoose from "mongoose";
import { MutasiRekening } from "../types/Mutasi";


const Schema = mongoose.Schema;

const MutasiRekeningSchema = new Schema<MutasiRekening>({
    rekeningId: {
        type: Schema.Types.ObjectId,
        ref: 'Rekening',
        required: true
    },
    jenis: {
        type: Schema.Types.String,
        enum: ['setor', 'tarik'],
        required: true
    },
    kategori: {
        type: Schema.Types.String,
        enum: ['harian', 'manual'],
        required: true
    },
    nominal: {
        type: Schema.Types.Number,
        required: true
    },
    dicatatOleh: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keterangan: {
        type: Schema.Types.String,
        required: false
    }
}, { timestamps: true })

const MutasiRekeningModel = mongoose.model('MutasiRekening', MutasiRekeningSchema);
export default MutasiRekeningModel;