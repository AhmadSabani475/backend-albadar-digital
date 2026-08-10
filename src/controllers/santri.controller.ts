import KamarModels from "../models/kamar.models";
import SantriModels from "../models/santri.models";
import { Santri } from "../types/Santri";
import * as Yup from "yup";
import { Request, Response } from "express";

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

export default {
    async createSantri(req: Request, res: Response) {
        /**
      #swagger.tags = ['Santri']
      #swagger.summary = 'Tambah santri manual (khusus admin)'
      #swagger.description = 'Admin menambahkan data santri secara langsung, tanpa membuat akun login. Digunakan untuk santri yang bukan pengurus.'
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.requestBody = {
         required: true,
         content: {
             "application/json": {
                 schema: { $ref: "#/components/schemas/CreateSantriRequest" }
             }
         }
      }
     */
        const santri = req.body as unknown as Omit<Santri, 'status' | 'tanggalTerdaftar'>;
        try {
            await santriValidateSchema.validate(santri);
            const kamar = await KamarModels.findById(santri.kamarId);
            if (!kamar) {
                return res.status(404).json({
                    message: "Kamar tidak ditemukan",
                    data: null
                })
            }

            const jumlahSantriDiKamar = await SantriModels.countDocuments({ kamarId: santri.kamarId });
            if (jumlahSantriDiKamar >= kamar.kapasitas) {
                return res.status(400).json({
                    message: "Kamar Sudah Penuh",
                    data: null
                })
            }
            const santriBaru = await SantriModels.create({
                ...santri,
                tanggalTerdaftar: new Date(),
                status: 'aktif'
            })
            res.status(201).json({
                message: "Santri Berhasil Di Tambahkan",
                data: santriBaru
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async santriFindAll(req: Request, res: Response) {
        /**
#swagger.tags = ['Santri']
#swagger.summary = 'Ambil semua data Santri (khusus admin)'
#swagger.security = [{ "bearerAuth": [] }]
*/
        try {
            const result = await SantriModels.find().populate({
                path: 'kamarId',
                populate: 'asramaId'
            });
            res.status(200).json({
                message: 'Data Santri Berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    }
}

export { completeProfileValidateSchema }