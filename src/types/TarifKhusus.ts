import { Types } from "mongoose";

export interface TarifKhusus {
    santriId: Types.ObjectId;
    jenisTagihanId: Types.ObjectId;
    nominalKhusus: number;
    keterangan?: string;
}

export interface Tagihan {
    santriId: Types.ObjectId;
    jenisTagihanId: Types.ObjectId;
    periode: string;
    nominalTagihan: number;
    jatuhTempo: Date;
    status: string;
    sumberNominal: string;
}