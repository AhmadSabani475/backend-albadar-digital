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
        // Dipake khusus buat isi/edit statusLain pasca lulus tingkat 6
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
                tingkatNgajiId: { $ne: null }  // yang statusLain (udah lulus tingkat 6) di-skip, gak ikut proses ini
            }).populate('tingkatNgajiId');

            const naikOtomatis: any[] = [];
            const lulusNgaji: any[] = [];

            for (const riwayat of riwayatAsal) {
                const tingkatSekarang = riwayat.tingkatNgajiId as any;
                const tingkatBerikutnya = await TingkatNgajiModel.findOne({ urutan: tingkatSekarang.urutan + 1 });

                try {
                    if (tingkatBerikutnya) {
                        // Masih ada tingkat lanjutan (1-6) -> auto naik
                        const baru = await RiwayatKelasNgajiModel.create({
                            santriId: riwayat.santriId,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatNgajiId: tingkatBerikutnya._id,
                        });
                        naikOtomatis.push(baru);
                    } else {
                        // Udah di tingkat 6 -> lulus ngaji, tingkatNgajiId jadi null
                        // statusLain SENGAJA dikosongin dulu, nunggu pengurus isi manual
                        const baru = await RiwayatKelasNgajiModel.create({
                            santriId: riwayat.santriId,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatNgajiId: null,
                        });
                        lulusNgaji.push(baru);
                    }
                } catch (e: any) {
                    if (e.code !== 11000) throw e;
                }
            }

            return res.status(200).json({
                message: `Proses naik kelas ngaji selesai. ${naikOtomatis.length} santri naik tingkat, ${lulusNgaji.length} santri lulus ngaji (perlu isi status manual).`,
                data: { naikOtomatis, lulusNgaji }
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
}