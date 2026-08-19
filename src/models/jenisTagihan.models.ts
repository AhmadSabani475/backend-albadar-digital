import mongoose from "mongoose";

export interface JenisTagihan {
    nama: string;
    tipePeriode: string;
    nominalDefault: number;
    wajib: boolean;
}

const Schema = mongoose.Schema;

const JenisTagihanValidateSchema = new Schema<JenisTagihan>({
    nama: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    nominalDefault: {
        type: Schema.Types.Number,
        required: true,
    },
    tipePeriode: {
        type: Schema.Types.String,
        required: true,
        enum: ['tahunan', 'bulanan', 'sekali']
    },
    wajib: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    }
}, { timestamps: true })

const JenisTagihanModel = mongoose.model('JenisTagihan', JenisTagihanValidateSchema);

export default JenisTagihanModel;