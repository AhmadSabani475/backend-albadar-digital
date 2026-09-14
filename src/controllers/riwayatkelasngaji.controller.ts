// controllers/riwayatKelasNgaji.controllers.ts
import { Request, Response } from "express";
import * as Yup from "yup";
import { Types } from "mongoose";
import SantriModel from "../models/santri.models";
import RiwayatKelasNgajiModel, { RiwayatKelasNgaji } from "../models/riwayatkelasngaji.models";
import TahunAjaranModel from "../models/tahunajaran.models";
import TingkatNgajiModel from "../models/tingkatngaji.models";


const riwayatKelasNgajiValidateSchema = Yup.object({
    santriId: Yup.string().required("Santri wajib dipilih"),
    tahunAjaranId: Yup.string().required("Tahun ajaran wajib dipilih"),
    tingkatNgajiId: Yup.string().nullable().optional(),
    statusLain: Yup.string().optional(),
})

export default {
    // Assign manual — dipake pas santri baru masuk, atau isi statusLain
    // buat santri yang udah lulus tingkat 6
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['RiwayatKelasNgaji']
         #swagger.summary = 'Penempatan / assign kelas ngaji santri secara manual'
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
                            tingkatNgajiId: { type: "string", example: "60d5ecb8b3b3a12345678903" },
                            statusLain: { type: "string", example: "Khatam Al-Quran" }
                        }
                    }
                }
            }
         }
         */
        try {
            const data = req.body as unknown as RiwayatKelasNgaji;
            await riwayatKelasNgajiValidateSchema.validate(data);

            const [santri, tahunAjaran] = await Promise.all([
                SantriModel.findById(data.santriId),
                TahunAjaranModel.findById(data.tahunAjaranId),
            ]);
            if (!santri) return res.status(404).json({ message: "Santri Tidak Ditemukan", data: null });
            if (!tahunAjaran) return res.status(404).json({ message: "Tahun Ajaran Tidak Ditemukan", data: null });

            if (data.tingkatNgajiId) {
                const tingkatNgaji = await TingkatNgajiModel.findById(data.tingkatNgajiId);
                if (!tingkatNgaji) return res.status(404).json({ message: "Tingkat Ngaji Tidak Ditemukan", data: null });
            }

            const result = await RiwayatKelasNgajiModel.create(data);
            return res.status(201).json({ message: "Riwayat Kelas Ngaji Berhasil Ditambahkan", data: result });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Santri ini sudah punya kelas ngaji di tahun ajaran tersebut", data: null });
            }
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['RiwayatKelasNgaji']
         #swagger.summary = 'Ambil daftar riwayat kelas ngaji santri'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['tahunAjaranId'] = { in: 'query', type: 'string', description: 'Filter Tahun Ajaran' }
         #swagger.parameters['santriId'] = { in: 'query', type: 'string', description: 'Filter Santri' }
         */
        try {
            const { tahunAjaranId, santriId } = req.query;
            const filter: Record<string, unknown> = {};
            if (tahunAjaranId) filter.tahunAjaranId = tahunAjaranId;
            if (santriId) filter.santriId = santriId;

            const result = await RiwayatKelasNgajiModel.find(filter)
                .populate('santriId')
                .populate('tahunAjaranId')
                .populate('tingkatNgajiId');

            return res.status(200).json({ message: "Data Berhasil Diambil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async update(req: Request, res: Response) {
        /**
         #swagger.tags = ['RiwayatKelasNgaji']
         #swagger.summary = 'Update statusLain riwayat kelas ngaji (pasca lulus)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            statusLain: { type: "string", example: "Tadarus Al-Quran" }
                        }
                    }
                }
            }
         }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null });
            }
            const existing = await RiwayatKelasNgajiModel.findById(id);
            if (!existing) {
                return res.status(404).json({ message: "Riwayat Kelas Ngaji Tidak Ditemukan", data: null });
            }

            const { statusLain } = req.body;
            const result = await RiwayatKelasNgajiModel.findByIdAndUpdate(
                id,
                { statusLain },
                { new: true, runValidators: true }
            );

            return res.status(200).json({ message: "Riwayat Kelas Ngaji Berhasil Diupdate", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async delete(req: Request, res: Response) {
        /**
         #swagger.tags = ['RiwayatKelasNgaji']
         #swagger.summary = 'Hapus riwayat kelas ngaji'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null });
            }
            const result = await RiwayatKelasNgajiModel.findByIdAndDelete(id);
            if (!result) {
                return res.status(404).json({ message: "Riwayat Kelas Ngaji Tidak Ditemukan", data: null });
            }
            return res.status(200).json({ message: "Riwayat Kelas Ngaji Berhasil Dihapus", data: null });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    // Proses "Naik Kelas Ngaji" massal
    async naikKelasNgaji(req: Request, res: Response) {
        try {
            const { tahunAjaranAsalId, tahunAjaranTujuanId } = req.body;
            if (!tahunAjaranAsalId || !tahunAjaranTujuanId) {
                return res.status(400).json({
                    message: "tahunAjaranAsalId dan tahunAjaranTujuanId wajib diisi",
                    data: null
                });
            }

            const riwayatAsal = await RiwayatKelasNgajiModel.find({
                tahunAjaranId: tahunAjaranAsalId,
                tingkatNgajiId: { $ne: null }
            }).populate('tingkatNgajiId').populate('santriId', 'namaLengkap nis');

            const naikOtomatis: any[] = [];
            const perluKeputusanManual: any[] = [];

            for (const riwayat of riwayatAsal) {
                const tingkatSekarang = riwayat.tingkatNgajiId as any;
                const santri = riwayat.santriId as any;   // ← sekarang objek, bukan ID mentah

                // Cek checkpoint DULU, sebelum nyari tingkat berikutnya
                if (tingkatSekarang.isCheckpoint) {
                    perluKeputusanManual.push({
                        santriId: santri._id,
                        namaSantri: santri.namaLengkap,   // ← ditambahin
                        nis: santri.nis,                    // ← ditambahin
                        tingkatNgajiSekarang: tingkatSekarang
                    });
                    continue;
                }

                const tingkatBerikutnya = await TingkatNgajiModel.findOne({ urutan: tingkatSekarang.urutan + 1 });

                try {
                    if (tingkatBerikutnya) {
                        const baru = await RiwayatKelasNgajiModel.create({
                            santriId: santri._id,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatNgajiId: tingkatBerikutnya._id,
                        });
                        naikOtomatis.push(baru);
                    } else {
                        perluKeputusanManual.push({
                            santriId: santri._id,
                            namaSantri: santri.namaLengkap,   // ← ditambahin
                            nis: santri.nis,                    // ← ditambahin
                            tingkatNgajiSekarang: tingkatSekarang
                        });
                    }
                } catch (e: any) {
                    if (e.code !== 11000) throw e;
                }
            }

            return res.status(200).json({
                message: `Proses naik kelas ngaji selesai. ${naikOtomatis.length} santri naik tingkat, ${perluKeputusanManual.length} santri butuh keputusan manual.`,
                data: { naikOtomatis, perluKeputusanManual }
            });
        } catch (error) {
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async keputusanManual(req: Request, res: Response) {
        /**
         #swagger.tags = ['RiwayatKelasNgaji']
         #swagger.summary = 'Submit keputusan manual untuk santri di checkpoint kelas ngaji'
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
                            aksi: { type: "string", enum: ["lanjut", "kelas_terbang", "pengurus", "alumni"] },
                            tingkatNgajiId: { type: "string", description: "wajib diisi kalau aksi = lanjut" }
                        }
                    }
                }
            }
         }
         */
        try {
            const { santriId, tahunAjaranId, aksi, tingkatNgajiId } = req.body;

            if (!santriId || !tahunAjaranId || !aksi) {
                return res.status(400).json({
                    message: "santriId, tahunAjaranId, dan aksi wajib diisi",
                    data: null
                });
            }

            if (aksi === 'lanjut') {
                if (!tingkatNgajiId) {
                    return res.status(400).json({
                        message: "tingkatNgajiId wajib diisi untuk aksi 'lanjut'",
                        data: null
                    });
                }

                const tingkatNgaji = await TingkatNgajiModel.findById(tingkatNgajiId);
                if (!tingkatNgaji) {
                    return res.status(404).json({ message: "Tingkat Ngaji Tidak Ditemukan", data: null });
                }

                const result = await RiwayatKelasNgajiModel.create({
                    santriId,
                    tahunAjaranId,
                    tingkatNgajiId,
                });

                return res.status(201).json({
                    message: "Santri berhasil dilanjutkan ke tingkat ngaji berikutnya",
                    data: result
                });
            }

            const statusLainMap: Record<string, string> = {
                kelas_terbang: 'Kelas Terbang',
                pengurus: 'Pengurus',
                alumni: 'Alumni',
            };

            if (aksi in statusLainMap) {
                const result = await RiwayatKelasNgajiModel.create({
                    santriId,
                    tahunAjaranId,
                    tingkatNgajiId: null,
                    statusLain: statusLainMap[aksi],
                });

                return res.status(201).json({
                    message: `Santri berhasil ditandai sebagai ${statusLainMap[aksi]}`,
                    data: result
                });
            }

            return res.status(400).json({ message: "Aksi tidak valid", data: null });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Santri ini sudah punya kelas ngaji di tahun ajaran tersebut",
                    data: null
                });
            }
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
}