// controllers/kelasSantri.controllers.ts
import { Request, Response } from "express";
import * as Yup from "yup";
import { Types } from "mongoose";
import SantriModel from "../models/santri.models";
import KelasSantriModel, { KelasSantri } from "../models/kelassantri.models";
import TahunAjaranModel from "../models/tahunajaran.models";
import TingkatKelasModel from "../models/tingkatkelas.models";

const kelasSantriValidateSchema = Yup.object({
    santriId: Yup.string().required("Santri wajib dipilih"),
    tahunAjaranId: Yup.string().required("Tahun ajaran wajib dipilih"),
    tingkatKelasId: Yup.string().required("Tingkat kelas wajib dipilih"),
})

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['KelasSantri']
         #swagger.summary = 'Penempatan / assign kelas santri secara manual'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            santriId: { type: "string", example: "60d5ecb8b3b3a12345678901" },
                            tahunAjaranId: { type: "string", example: "60d5ecb8b3b3a12345678902" },
                            tingkatKelasId: { type: "string", example: "60d5ecb8b3b3a12345678903" }
                        }
                    }
                }
            }
         }
         */
        try {
            const data = req.body as unknown as KelasSantri;
            await kelasSantriValidateSchema.validate(data);

            const [santri, tahunAjaran, tingkatKelas] = await Promise.all([
                SantriModel.findById(data.santriId),
                TahunAjaranModel.findById(data.tahunAjaranId),
                TingkatKelasModel.findById(data.tingkatKelasId),
            ]);

            if (!santri) return res.status(404).json({ message: "Santri Tidak Ditemukan", data: null });
            if (!tahunAjaran) return res.status(404).json({ message: "Tahun Ajaran Tidak Ditemukan", data: null });
            if (!tingkatKelas) return res.status(404).json({ message: "Tingkat Kelas Tidak Ditemukan", data: null });

            const result = await KelasSantriModel.create(data);
            return res.status(201).json({ message: "Kelas Santri Berhasil Ditambahkan", data: result });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Santri ini sudah punya kelas di tahun ajaran tersebut", data: null });
            }
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['KelasSantri']
         #swagger.summary = 'Ambil daftar penempatan kelas santri (dapat difilter)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['tahunAjaranId'] = { in: 'query', type: 'string', description: 'Filter Tahun Ajaran' }
         #swagger.parameters['santriId'] = { in: 'query', type: 'string', description: 'Filter Santri' }
         #swagger.parameters['tingkatKelasId'] = { in: 'query', type: 'string', description: 'Filter Tingkat Kelas' }
         */
        try {
            const { tahunAjaranId, santriId, tingkatKelasId } = req.query;
            const filter: Record<string, unknown> = {};
            if (tahunAjaranId) filter.tahunAjaranId = tahunAjaranId;
            if (santriId) filter.santriId = santriId;
            if (tingkatKelasId) filter.tingkatKelasId = tingkatKelasId;

            const result = await KelasSantriModel.find(filter)
                .populate('santriId')
                .populate('tahunAjaranId')
                .populate({ path: 'tingkatKelasId', populate: 'sekolahId' });

            return res.status(200).json({ message: "Data Berhasil Diambil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async delete(req: Request, res: Response) {
        /**
         #swagger.tags = ['KelasSantri']
         #swagger.summary = 'Hapus penempatan kelas santri'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['id'] = { in: 'path', required: true, type: 'string', description: 'ID KelasSantri' }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID tidak valid", data: null });
            }
            const result = await KelasSantriModel.findByIdAndDelete(id);
            if (!result) {
                return res.status(404).json({ message: "Kelas Santri Tidak Ditemukan", data: null });
            }
            return res.status(200).json({ message: "Kelas Santri Berhasil Dihapus", data: null });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async naikKelas(req: Request, res: Response) {
        try {
            const { tahunAjaranAsalId, tahunAjaranTujuanId } = req.body;

            if (!tahunAjaranAsalId || !tahunAjaranTujuanId) {
                return res.status(400).json({
                    message: "tahunAjaranAsalId dan tahunAjaranTujuanId wajib diisi",
                    data: null
                });
            }

            const kelasSantriAsal = await KelasSantriModel.find({ tahunAjaranId: tahunAjaranAsalId })
                .populate('tingkatKelasId')
                .populate('santriId', 'namaLengkap nis');

            const naikOtomatis: any[] = [];
            const mengulang: any[] = [];
            const perluKeputusanManual: any[] = [];

            for (const kelas of kelasSantriAsal) {
                const tingkatSekarang = kelas.tingkatKelasId as any;
                const santri = kelas.santriId as any;

                if (kelas.status === 'tinggal_kelas') {
                    try {
                        const kelasBaru = await KelasSantriModel.create({
                            santriId: santri._id,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatKelasId: tingkatSekarang._id,
                            status: 'aktif'
                        });
                        mengulang.push(kelasBaru);
                    } catch (e: any) {
                        if (e.code !== 11000) throw e;
                    }
                    continue;
                }

                const tingkatBerikutnya = await TingkatKelasModel.findOne({
                    sekolahId: tingkatSekarang.sekolahId,
                    urutan: tingkatSekarang.urutan + 1
                });

                if (tingkatBerikutnya) {
                    try {
                        const kelasBaru = await KelasSantriModel.create({
                            santriId: santri._id,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatKelasId: tingkatBerikutnya._id,
                            status: 'aktif'
                        });
                        naikOtomatis.push(kelasBaru);
                    } catch (e: any) {
                        if (e.code !== 11000) throw e;
                    }
                } else {
                    perluKeputusanManual.push({
                        santriId: santri._id,
                        namaSantri: santri.namaLengkap,
                        nis: santri.nis,
                        tingkatKelasSekarang: tingkatSekarang
                    });
                }
            }

            return res.status(200).json({
                message: `Proses naik kelas selesai. ${naikOtomatis.length} santri naik otomatis, ${mengulang.length} santri mengulang, ${perluKeputusanManual.length} santri butuh keputusan manual.`,
                data: {
                    naikOtomatis,
                    mengulang,
                    perluKeputusanManual
                }
            });
        } catch (error) {
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async keputusanManual(req: Request, res: Response) {
        /**
         #swagger.tags = ['KelasSantri']
         #swagger.summary = 'Submit keputusan manual untuk santri di tingkat akhir sekolah (lanjut sekolah lain / alumni)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            santriId: { type: "string" },
                            tahunAjaranId: { type: "string" },
                            aksi: { type: "string", enum: ["lanjut", "alumni"] },
                            tingkatKelasId: { type: "string", description: "wajib diisi kalau aksi = lanjut" }
                        }
                    }
                }
            }
         }
         */
        try {
            const { santriId, tahunAjaranId, aksi, tingkatKelasId } = req.body;

            if (!santriId || !tahunAjaranId || !aksi) {
                return res.status(400).json({
                    message: "santriId, tahunAjaranId, dan aksi wajib diisi",
                    data: null
                });
            }

            if (aksi === 'lanjut') {
                if (!tingkatKelasId) {
                    return res.status(400).json({
                        message: "tingkatKelasId wajib diisi untuk aksi 'lanjut'",
                        data: null
                    });
                }

                const tingkatKelas = await TingkatKelasModel.findById(tingkatKelasId);
                if (!tingkatKelas) {
                    return res.status(404).json({ message: "Tingkat Kelas Tidak Ditemukan", data: null });
                }

                const result = await KelasSantriModel.create({
                    santriId,
                    tahunAjaranId,
                    tingkatKelasId,
                    status: 'aktif'
                });

                return res.status(201).json({
                    message: "Santri berhasil dilanjutkan ke tingkat/sekolah baru",
                    data: result
                });
            }

            if (aksi === 'alumni') {
                await SantriModel.findByIdAndUpdate(santriId, { status: 'alumni' });

                return res.status(200).json({
                    message: "Santri berhasil ditandai sebagai alumni",
                    data: null
                });
            }

            return res.status(400).json({ message: "Aksi tidak valid", data: null });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Santri ini sudah punya kelas di tahun ajaran tersebut",
                    data: null
                });
            }
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
}