import { Types } from "mongoose"

export interface Rekening {
    santriId: Types.ObjectId;
    jenisRekening: 'uang_jajan' | 'tabungan_ziarah';
    saldo: number;
    nominalHarian?: number;
}