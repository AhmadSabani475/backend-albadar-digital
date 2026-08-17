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
    // Assign kelas manual — dipake pas santri baru masuk, atau keputusan manual
    // buat santri yang lulus dari tingkat paling akhir (lanjut MA/SMK/keluar)
    async create(req: Request, res: Response) {
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

    // List, bisa difilter by tahunAjaranId / santriId / tingkatKelasId
    async findAll(req: Request, res: Response) {
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
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null });
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

    // Endpoint utama: proses "Naik Kelas" massal dari 1 tahun ajaran ke tahun ajaran berikutnya
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
                .populate('tingkatKelasId');

            const naikOtomatis: any[] = [];
            const perluKeputusanManual: any[] = [];

            for (const kelas of kelasSantriAsal) {
                const tingkatSekarang = kelas.tingkatKelasId as any;

                // Cari tingkat berikutnya DI SEKOLAH YANG SAMA
                const tingkatBerikutnya = await TingkatKelasModel.findOne({
                    sekolahId: tingkatSekarang.sekolahId,
                    urutan: tingkatSekarang.urutan + 1
                });

                if (tingkatBerikutnya) {
                    // Ada tingkat lanjutan di sekolah yang sama -> auto generate
                    try {
                        const kelasBaru = await KelasSantriModel.create({
                            santriId: kelas.santriId,
                            tahunAjaranId: tahunAjaranTujuanId,
                            tingkatKelasId: tingkatBerikutnya._id,
                            status: 'aktif'
                        });
                        naikOtomatis.push(kelasBaru);
                    } catch (e: any) {
                        // Skip kalau ternyata udah ada record (misal proses naik kelas dijalanin dobel)
                        if (e.code !== 11000) throw e;
                    }
                } else {
                    // Udah di tingkat paling akhir sekolah ini -> perlu keputusan manual pengurus
                    perluKeputusanManual.push({
                        santriId: kelas.santriId,
                        tingkatKelasSekarang: tingkatSekarang
                    });
                }
            }

            return res.status(200).json({
                message: `Proses naik kelas selesai. ${naikOtomatis.length} santri naik otomatis, ${perluKeputusanManual.length} santri butuh keputusan manual.`,
                data: {
                    naikOtomatis,
                    perluKeputusanManual
                }
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
}