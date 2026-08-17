import { Request, Response } from "express";
import * as Yup from "yup";
import { Types } from "mongoose";
import TingkatKelasModel from "../models/tingkatkelas.models";
import { TingkatKelas } from "../models/tingkatkelas.models"; 
import SekolahModel from "../models/sekolah.models";

const tingkatKelasValidateSchema = Yup.object({
    nama: Yup.string().required("Nama tingkat kelas wajib diisi"),
    sekolahId: Yup.string().required("Sekolah wajib dipilih"),
    urutan: Yup.number().required("Urutan wajib diisi").min(1, "Urutan minimal 1"),
})

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['TingkatKelas']
         #swagger.summary = 'Tambah tingkat kelas baru (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const data = req.body as unknown as TingkatKelas;
            await tingkatKelasValidateSchema.validate(data);

            const sekolah = await SekolahModel.findById(data.sekolahId);
            if (!sekolah) {
                return res.status(404).json({
                    message: "Sekolah Tidak Ditemukan",
                    data: null
                })
            }

            const tingkatKelasBaru = await TingkatKelasModel.create(data);

            return res.status(201).json({
                message: "Tingkat Kelas Berhasil Ditambahkan",
                data: tingkatKelasBaru
            });
        } catch (error: any) {
            // Kode 11000 = duplicate key error dari compound index sekolahId+urutan
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Urutan tingkat kelas ini sudah dipakai di sekolah tersebut",
                    data: null
                })
            }
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['TingkatKelas']
         #swagger.summary = 'Ambil semua tingkat kelas, bisa difilter per sekolah'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const { sekolahId } = req.query;
            const filter = sekolahId ? { sekolahId } : {};

            const result = await TingkatKelasModel.find(filter)
                .populate('sekolahId')
                .sort({ sekolahId: 1, urutan: 1 });

            return res.status(200).json({
                message: "Data Tingkat Kelas Berhasil Diambil",
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async findById(req: Request, res: Response) {
        /**
         #swagger.tags = ['TingkatKelas']
         #swagger.summary = 'Ambil tingkat kelas berdasarkan ID'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }

            const tingkatKelas = await TingkatKelasModel.findById(id).populate('sekolahId');
            if (!tingkatKelas) {
                return res.status(404).json({
                    message: "Tingkat Kelas Tidak Ditemukan",
                    data: null
                })
            }

            return res.status(200).json({
                message: "Data Tingkat Kelas Berhasil Diambil",
                data: tingkatKelas
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async update(req: Request, res: Response) {
        /**
         #swagger.tags = ['TingkatKelas']
         #swagger.summary = 'Edit tingkat kelas berdasarkan ID (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }

            const tingkatKelasExist = await TingkatKelasModel.findById(id);
            if (!tingkatKelasExist) {
                return res.status(404).json({
                    message: "Tingkat Kelas Tidak Ditemukan",
                    data: null
                })
            }

            const data = req.body as unknown as TingkatKelas;
            await tingkatKelasValidateSchema.validate(data);

            if (data.sekolahId && data.sekolahId.toString() !== tingkatKelasExist.sekolahId?.toString()) {
                const sekolah = await SekolahModel.findById(data.sekolahId);
                if (!sekolah) {
                    return res.status(404).json({
                        message: "Sekolah Tidak Ditemukan",
                        data: null
                    })
                }
            }

            const tingkatKelasUpdated = await TingkatKelasModel.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                message: "Tingkat Kelas Berhasil Diupdate",
                data: tingkatKelasUpdated
            })
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Urutan tingkat kelas ini sudah dipakai di sekolah tersebut",
                    data: null
                })
            }
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async delete(req: Request, res: Response) {
        /**
         #swagger.tags = ['TingkatKelas']
         #swagger.summary = 'Hapus tingkat kelas berdasarkan ID (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }

            const deleted = await TingkatKelasModel.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({
                    message: "Tingkat Kelas Tidak Ditemukan",
                    data: null
                })
            }

            return res.status(200).json({
                message: "Tingkat Kelas Berhasil Dihapus",
                data: null
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
}