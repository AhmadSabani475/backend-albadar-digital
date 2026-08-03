import Mongoose from "mongoose";

export interface Asrama {
    namaAsrama: string;
    keterangan?: string;
}

const Schema = Mongoose.Schema;

const AsramaSchema = new Schema<Asrama>({
    namaAsrama: {
        type: Schema.Types.String,
        required: true
    },
    keterangan: {
        type: Schema.Types.String,
        required: false
    }
}, { timestamps: true })

const AsramaModels = Mongoose.model("Asrama", AsramaSchema);

export default AsramaModels;