import { Types } from "mongoose";
import { Rekening } from "./Rekening";

export interface MutasiRekening {
    rekeningId: Rekening;
    jenis: 'setor' | 'tarik';
    kategori: 'harian' | 'manual';
    nominal: number;
    keterangan?: string;
    dicatatOleh: Types.ObjectId;
}