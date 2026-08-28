import { Santri } from "./Santri";

export interface Rekening {
    santriId: Santri;
    jenisRekening: 'uang_jajan' | 'tabungan_ziarah';
    saldo: number;
    nominalHarian?: number;
}