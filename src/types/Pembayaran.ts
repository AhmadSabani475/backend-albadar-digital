import { Types } from "mongoose";


export interface Pembayaran{
    santriId: Types.ObjectId,
    tagihanId: Types.ObjectId,
    dicatatOleh: Types.ObjectId,
    tanggalBayar: Date,
    nominalBayar: number,
}