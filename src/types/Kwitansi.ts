import { Santri } from "./Santri";
import { User } from "./User";

export interface KwitansiItem {
    tipe: 'bayar_tagihan' | 'setor_rekening' | 'tarik_rekening';
    referensiId: string;
    nominal: number;
    label: string;
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
    metodePembayaran: 'cash' | 'transfer';
    buktiTransferUrl?: string;
    diCatatOleh: User;
    createdAt: string;
}