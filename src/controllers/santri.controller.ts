import KamarModels from "../models/kamar.models";
import SantriModels from "../models/santri.models";
import { Santri } from "../types/Santri";
import * as Yup from "yup";
import { Request, Response } from "express";
import { Types } from "mongoose";
import SekolahModel from "../models/sekolah.models";



const orangtuaValidateSchema = Yup.object({
    nik: Yup.string().optional(),
    statusHidup: Yup.string().oneOf(['Hidup', 'Meninggal']).optional(),
    nama: Yup.string().required("Nama wajib diisi"),
    pendidikan: Yup.string().optional(),
    pekerjaan: Yup.string().optional(),
    noHp: Yup.string().optional(),
});

const alamatValidateSchema = Yup.object({
    jalan: Yup.string().required("Jalan wajib diisi"),
    rtRw: Yup.string().optional(),
    kodeDesaKelurahan: Yup.string().required("Kode desa/kelurahan wajib diisi"),
    desaKelurahan: Yup.string().required("Desa/Kelurahan wajib diisi"),
    kodeKecamatan: Yup.string().required("Kode kecamatan wajib diisi"),
    kecamatan: Yup.string().required("Kecamatan wajib diisi"),
    kodeKabupatenKota: Yup.string().required("Kode kabupaten/kota wajib diisi"),
    kabupatenKota: Yup.string().required("Kabupaten/Kota wajib diisi"),
    kodeProvinsi: Yup.string().required("Kode provinsi wajib diisi"),
    provinsi: Yup.string().required("Provinsi wajib diisi"),
    kodePos: Yup.string().optional(),
});

const pendidikanSebelumnyaValidateSchema = Yup.object({
    jenjangTerakhir: Yup.string().required("Jenjang pendidikan terakhir wajib diisi"),
    namaSekolah: Yup.string().required("Nama sekolah terakhir wajib diisi"),
    tahunMasuk: Yup.string().required("Tahun masuk wajib diisi"),
    tahunLulus: Yup.string().required("Tahun lulus wajib diisi"),
});

const santriValidateSchema = Yup.object({
    nik: Yup.string().optional(),
    nis: Yup.string().optional(),
    namaLengkap: Yup.string().required("Nama lengkap wajib diisi"),
    jenisKelamin: Yup.string().oneOf(['L', 'P'], "Jenis kelamin harus L atau P").required("Jenis kelamin wajib diisi"),
    tempatLahir: Yup.string().required("Tempat lahir wajib diisi"),
    tanggalLahir: Yup.date().required("Tanggal lahir wajib diisi"),
    fotoUrl: Yup.string().optional(),
    anakKe: Yup.number().optional(),
    jumlahSaudara: Yup.number().optional(),
    noHp: Yup.string().optional(),
    noKk: Yup.string().optional(),
    namaKepalaKeluarga: Yup.string().optional(),
    pendidikanTerakhir: pendidikanSebelumnyaValidateSchema.required("Data pendidikan sebelumnya wajib diisi"),
    ayah: orangtuaValidateSchema.required("Data ayah wajib diisi"),
    ibu: orangtuaValidateSchema.required("Data ibu wajib diisi"),
    alamat: alamatValidateSchema.required("Alamat wajib diisi"),
    sekolahId: Yup.string().required("Sekolah wajib dipilih"),
    kamarId: Yup.string().required("Kamar wajib dipilih"),
    laundry: Yup.boolean().optional(),
})


export default {
    async create(req: Request, res: Response) {
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
            const sekolah = await SekolahModel.findById(santri.sekolahId);
            if (!sekolah) {
                return res.status(404).json({
                    message: "Sekolah tidak ditemukan",
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
                laundry: santri.laundry ?? false,
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
    async findAll(req: Request, res: Response) {
        /**
#swagger.tags = ['Santri']
#swagger.summary = 'Ambil semua data Santri (khusus admin)'
#swagger.security = [{ "bearerAuth": [] }]
*/
        try {
            const result = await SantriModels.find().populate({
                path: 'kamarId',
                populate: 'asramaId'
            }).populate('sekolahId');
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
    },
    async findById(req: Request, res: Response) {
        /**
         #swagger.tags = ['Santri']
         #swagger.summary = 'Ambil data santri berdasarkan ID'
         #swagger.security = [{ "bearerAuth": [] }]
          #swagger.parameters['id'] = {
     in: 'path',
     required: true,
     type: 'string',
     description: 'ID santri (MongoDB ObjectId)'
 }

         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    success: false
                })
            }
            const santri = await SantriModels.findById(id).populate({
                path: 'kamarId',
                populate: 'asramaId'
            }).populate('sekolahId');

            if (!santri) {
                return res.status(404).json({
                    message: "ID Santri Tidak ditemukan",
                    success: false
                });
            };
            return res.status(200).json({
                message: "Success Get Santri By Id",
                data: santri
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },
    async editById(req: Request, res: Response) {
        /**
    #swagger.tags = ['Santri']
    #swagger.summary = 'Edit data santri berdasarkan ID (khusus admin)'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'ID santri (MongoDB ObjectId)'
    }
    #swagger.requestBody = {
       required: true,
       content: {
           "application/json": {
               schema: { $ref: "#/components/schemas/CreateSantriRequest" }
           }
       }
    }
    */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    success: false
                })
            }
            const santriExist = await SantriModels.findById(id);
            if (!santriExist) {
                return res.status(404).json({
                    message: "ID Santri Tidak ditemukan",
                    success: false
                });
            };

            const santri = req.body as unknown as Omit<Santri, 'status' | 'tanggalTerdaftar'>
            await santriValidateSchema.validate(santri);

            if (santri.kamarId && santri.kamarId.toString() !== santriExist.kamarId?.toString()) {
                const kamar = await KamarModels.findById(santri.kamarId);
                if (!kamar) {
                    return res.status(404).json({
                        message: "Kamar tidak ditemukan",
                        data: null
                    });
                }
                const jumlahSantriDiKamar = await SantriModels.countDocuments({ kamarId: santri.kamarId });
                if (jumlahSantriDiKamar >= kamar.kapasitas) {
                    return res.status(400).json({
                        message: "kamar sudah penuh",
                        data: null
                    })
                }
            }
            if (santri.sekolahId && santri.sekolahId.toString() !== santriExist.sekolahId?.toString()) {
                const sekolah = await SekolahModel.findById(santri.sekolahId);
                if (!sekolah) {
                    return res.status(404).json({
                        message: "Sekolah tidak ditemukan",
                        data: null
                    });
                }
            }

            const santriUpdated = await SantriModels.findByIdAndUpdate(
                id,
                { ...santri },
                { new: true, runValidators: true }
            )

            return res.status(200).json({
                message: "Santri Success Updated",
                data: santriUpdated
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async deleteById(req: Request, res: Response) {
        /**
   #swagger.tags = ['Santri']
   #swagger.summary = 'Hapus data santri berdasarkan ID (khusus admin)'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.parameters['id'] = {
       in: 'path',
       required: true,
       type: 'string',
       description: 'ID santri (MongoDB ObjectId)'
   }
   #swagger.responses[200] = {
       description: 'Santri berhasil dihapus'
   }
   #swagger.responses[400] = {
       description: 'ID tidak valid'
   }
   #swagger.responses[404] = {
       description: 'Santri tidak ditemukan'
   }
   */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    success: false
                })
            }
            const deleteSantri = await SantriModels.findByIdAndDelete(id);
            if (!deleteSantri) {
                return res.status(404).json({
                    message: "Santri Tidak Ditemukan",
                    success: false
                })
            }
            return res.status(200).json({
                message: "Data Santri Berhasil dihapus",
                success: true
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

}
