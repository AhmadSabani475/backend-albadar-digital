import { Types } from "mongoose";

export interface Orangtua {
    nama: string;
    pendidikan?: string;
    pekerjaan?: string;
}

export interface Alamat {
    jalan: string;
    rtRw?: string;
    desaKelurahan: string;
    kecamatan: string;
    kabupatenKota: string;
    provinsi: string;
    noTelepon?: string;
}

export interface Santri {
    nis?: string;
    namaLengkap: string;
    tempatLahir: string;
    tanggalLahir: Date;
    anakKe?: number;
    jumlahSaudara?: number;
    asalPesantren?: string;
    pendidikanTerakhir: string;
    ayah: Orangtua;
    ibu: Orangtua;
    alamat: Alamat;
    sekolah: string;
    kamarId?: Types.ObjectId;
    tanggalTerdaftar: Date;
    status: 'aktif' | 'alumni'
}