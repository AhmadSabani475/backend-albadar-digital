import { Santri } from "./Santri";
import { User } from "./User";

export interface KwitansiItem {
    tipe: 'bayar_tagihan' | 'setor_rekening' | 'tarik_rekening';
    referensiId: string;
    nominal: number;
    keterangan?: string;
}

export interface SaldoSnapshot {
    jenisRekening: 'uang_jajan' | 'tabungan_ziarah';
    saldo: number;
}


export interface Kwitansi {
    nomorKwitansi: string;
    santriId: Santri;
    items: KwitansiItem[];
    saldoSnapshot: SaldoSnapshot[];
    totalNominal: number;
    diCatatOleh: User;
    createdAt: string;
}