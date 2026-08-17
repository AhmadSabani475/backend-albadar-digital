import { Request, Response } from "express";
import * as Yup from "yup";
import TahunAjaranModel from "../models/tahunajaran.models";
import { TahunAjaran } from "../types/TahunAjaran";
import { Types } from "mongoose";

const tahunAjaranValidateSchema = Yup.object({
    nama: Yup.string().required("Nama tahun ajaran wajib diisi"),
    tanggalMulai: Yup.date().required("Tanggal mulai wajib diisi"),
    tanggalSelesai: Yup.date().optional(),
    is_active: Yup.boolean().optional()
})

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['TahunAjaran']
         #swagger.summary = 'Tambah tahun ajaran baru (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const data = req.body as unknown as TahunAjaran;
            await tahunAjaranValidateSchema.validate(data);

            // Kalau tahun ajaran baru ini di-set aktif, matiin dulu semua yang lain
            if (data.is_active) {
                await TahunAjaranModel.updateMany({}, { is_active: false });
            }

            const tahunAjaranBaru = await TahunAjaranModel.create(data);

            return res.status(201).json({
                message: "Tahun Ajaran Berhasil Ditambahkan",
                data: tahunAjaranBaru
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['TahunAjaran']
         #swagger.summary = 'Ambil semua data tahun ajaran'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const result = await TahunAjaranModel.find().sort({ tanggalMulai: -1 });
            return res.status(200).json({
                message: "Data Tahun Ajaran Berhasil Diambil",
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
         #swagger.tags = ['TahunAjaran']
         #swagger.summary = 'Ambil tahun ajaran berdasarkan ID'
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
            const tahunAjaran = await TahunAjaranModel.findById(id);
            if (!tahunAjaran) {
                return res.status(404).json({
                    message: "Tahun Ajaran Tidak Ditemukan",
                    data: null
                })
            }
            return res.status(200).json({
                message: "Data Tahun Ajaran Berhasil Diambil",
                data: tahunAjaran
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
         #swagger.tags = ['TahunAjaran']
         #swagger.summary = 'Edit tahun ajaran berdasarkan ID (khusus admin)'
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

            const tahunAjaranExist = await TahunAjaranModel.findById(id);
            if (!tahunAjaranExist) {
                return res.status(404).json({
                    message: "Tahun Ajaran Tidak Ditemukan",
                    data: null
                })
            }

            const data = req.body as unknown as TahunAjaran;
            await tahunAjaranValidateSchema.validate(data);

            // Sama kayak create: kalau di-set aktif, matiin yang lain dulu (kecuali dirinya sendiri)
            if (data.is_active) {
                await TahunAjaranModel.updateMany(
                    { _id: { $ne: id } },
                    { is_active: false }
                );
            }

            const tahunAjaranUpdated = await TahunAjaranModel.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                message: "Tahun Ajaran Berhasil Diupdate",
                data: tahunAjaranUpdated
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },

    async delete(req: Request, res: Response) {
        /**
         #swagger.tags = ['TahunAjaran']
         #swagger.summary = 'Hapus tahun ajaran berdasarkan ID (khusus admin)'
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

            const deleted = await TahunAjaranModel.findByIdAndDelete(id);
            if (!deleted) {
                return res.status(404).json({
                    message: "Tahun Ajaran Tidak Ditemukan",
                    data: null
                })
            }

            return res.status(200).json({
                message: "Tahun Ajaran Berhasil Dihapus",
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