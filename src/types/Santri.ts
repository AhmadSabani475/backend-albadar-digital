import { Types } from "mongoose";

export interface Orangtua {
    nik: string;
    statusHidup: 'Hidup' | 'Meninggal';
    nama: string;
    pendidikan?: string;
    pekerjaan?: string;
    noHp?: string;
}

export interface Alamat {
    jalan: string;
    rtRw?: string;
    kodeDesaKelurahan: string;
    desaKelurahan: string;
    kodeKecamatan: string;
    kecamatan: string;
    kodeKabupatenKota: string;
    kabupatenKota: string;
    kodeProvinsi: string;
    provinsi: string;
    kodePos?: string;
}

export interface SekolahSaatIni {
    namaSekolah: string;
    jenjangSekolah: 'SD/MI' | 'MTs/SMP' | 'SMA/SMK/MA';
}

export interface PendidikanSebelumnya {
    jenjangTerakhir: 'SD/MI' | 'MTs/SMP' | 'SMA/SMK/MA';
    namaSekolah: string;
    tahunMasuk: string;
    tahunLulus: string;
}

export interface Santri {
    nik?: string;
    nis?: string;
    namaLengkap: string;
    jenisKelamin: 'L' | 'P';
    tempatLahir: string;
    tanggalLahir: Date;
    fotoUrl?: string;
    anakKe?: number;
    jumlahSaudara?: number;
    noHp?: string;
    noKk?: string;
    namaKepalaKeluarga?: string;
    ayah: Orangtua;
    ibu: Orangtua;
    pendidikanTerakhir: PendidikanSebelumnya;
    alamat: Alamat;
    sekolahId?: Types.ObjectId;
    kamarId?: Types.ObjectId;
    tanggalTerdaftar: Date;
    status: 'aktif' | 'alumni' | 'dikeluarkan'
    laundry: boolean;
}