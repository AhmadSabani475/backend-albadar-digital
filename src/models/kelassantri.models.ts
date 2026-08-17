import mongoose, { Types } from "mongoose";

export interface KelasSantri {
    santriId: Types.ObjectId;
    tahunAjaranId: Types.ObjectId;
    tingkatKelasId: Types.ObjectId;
    status: 'aktif' | 'tinggal_kelas';
}

const Schema = mongoose.Schema;

const KelasSantriSchema = new Schema<KelasSantri>({
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
    tingkatKelasId: {
        type: Schema.Types.ObjectId,
        ref: "TingkatKelas",
        required: true
    },
    status: {
        type: Schema.Types.String,
        enum: ['aktif', 'tinggal_kelas'],
        default: 'aktif'
    }
}, { timestamps: true })

KelasSantriSchema.index({ santriId: 1, tahunAjaranId: 1 }, { unique: true });

const KelasSantriModel = mongoose.model('KelasSantri', KelasSantriSchema);
export default KelasSantriModel;