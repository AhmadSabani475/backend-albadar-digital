import mongoose, { Types } from "mongoose";

export interface TingkatKelas {
    nama: string;               // "Kelas 7", "Kelas 8", "Kelas 9", dst
    sekolahId: Types.ObjectId;  // ref ke Sekolah (MTs/SMP/MA/SMK/SMA)
    urutan: number;             // urutan DALAM sekolah itu sendiri (1, 2, 3)
}

const Schema = mongoose.Schema;

const TingkatKelasSchema = new Schema<TingkatKelas>({
    nama: {
        type: Schema.Types.String,
        required: true
    },
    sekolahId: {
        type: Schema.Types.ObjectId,
        ref: "Sekolah",
        required: true
    },
    urutan: {
        type: Schema.Types.Number,
        required: true
    }
}, { timestamps: true })

TingkatKelasSchema.index({ sekolahId: 1, urutan: 1 }, { unique: true });

const TingkatKelasModel = mongoose.model('TingkatKelas', TingkatKelasSchema);

export default TingkatKelasModel;