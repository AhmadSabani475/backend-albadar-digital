import { Santri } from "../types/Santri";
import * as Yup from "yup";

export type TCompleteProfile = {
    password: string;
    santri: Omit<Santri, 'status' | 'tanggalTerdaftar'>;
}

const orangtuaValidateSchema = Yup.object({
    nama: Yup.string().required("Nama wajib diisi"),
    pendidikan: Yup.string().optional(),
    pekerjaan: Yup.string().optional(),
});

const alamatValidateSchema = Yup.object({
    jalan: Yup.string().required("Jalan wajib diisi"),
    rtRw: Yup.string().optional(),
    desaKelurahan: Yup.string().required("Desa/Kelurahan wajib diisi"),
    kecamatan: Yup.string().required("Kecamatan wajib diisi"),
    kabupatenKota: Yup.string().required("Kabupaten/Kota wajib diisi"),
    provinsi: Yup.string().required("Provinsi wajib diisi"),
    noTelepon: Yup.string().optional(),
});

const santriValidateSchema = Yup.object({
    nis: Yup.string().optional(),
    namaLengkap: Yup.string().required("Nama lengkap wajib diisi"),
    tempatLahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggalLahir: Yup.date().required("Tanggal lahir wajib diisi"),
    anakKe: Yup.number().optional(),
    jumlahSaudara: Yup.number().optional(),
    asalPesantren: Yup.string().optional(),
    pendidikanTerakhir: Yup.string().required("Pendidikan terakhir wajib diisi"),
    ayah: orangtuaValidateSchema.required("Data ayah wajib diisi"),
    ibu: orangtuaValidateSchema.required("Data ibu wajib diisi"),
    alamat: alamatValidateSchema.required("Alamat wajib diisi"),
    sekolah: Yup.string().required("Sekolah wajib diisi"),
    kamarId: Yup.string().required("Kamar wajib dipilih"),
})

const completeProfileValidateSchema = Yup.object({
    password: Yup.string().required("Password wajib diisi")
        .min(6, "Password minimal 6 karakter"),
    santri: santriValidateSchema.required("Data Santri Wajib Diisi")
})

export { completeProfileValidateSchema }