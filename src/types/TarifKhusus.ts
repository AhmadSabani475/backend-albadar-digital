import { Types } from "mongoose";

export interface TarifKhusus {
    santriId: Types.ObjectId;
    jenisTagihanId: Types.ObjectId;
    nominalKhusus: number;
    keterangan?: string;
}