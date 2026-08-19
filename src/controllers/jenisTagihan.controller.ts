import { Request, Response } from "express";
import * as Yup from "yup";
import JenisTagihanModel, { JenisTagihan } from "../models/jenisTagihan.models";
import { Types } from "mongoose";

const JenisTagihanValidateSchema = Yup.object({
    nama: Yup.string().required("Nama jenis tagihan wajib diisi"),
    tipePeriode: Yup.string()
        .oneOf(['tahunan', 'bulanan', 'sekali'], "Tipe periode harus tahunan, bulanan, atau sekali")
        .required("Tipe periode wajib diisi"),
    nominalDefault: Yup.number().required("Nominal default wajib diisi").min(0, "Nominal tidak boleh negatif"),
    wajib: Yup.boolean().optional().default(false)
});

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags=['JenisTagihan']
         #swagger.summary = 'Buat Tagihan baru (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            nama: { type: "string", example: "SPP" },
                            tipePeriode: { type: "string", example: "Bulanan" },
                            nominalDefault: { type: "number", example: 570000 },
                            wajib: {type: boolean, example: true}
                        }
                    }
                }
            }
         }
         */
        try {
            await JenisTagihanValidateSchema.validate(req.body as JenisTagihan);
            const result = await JenisTagihanModel.create(req.body);
            res.status(201).json({
                message: 'Tagihan Berhasil dibuat',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        /**
        #swagger.tags = ['JenisTagihan']
        #swagger.summary = 'Ambil semua data Tagihan '
        #swagger.security = [{ "bearerAuth": [] }]
       */
        try {
            const result = await JenisTagihanModel.find();
            res.status(200).json({
                message: 'Data Tagihan Berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findById(req: Request, res: Response) {
        /**
        #swagger.tags = ['JenisTagihan']
        #swagger.summary = 'Ambil data tagihan berdasarkan ID'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.parameters['id'] = {
            in: 'path',
            required: true,
            type: 'string'
        }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }
            const tagihan = await JenisTagihanModel.findById(id);
            if (!tagihan) {
                return res.status(404).json({
                    message: "ID Tagihan Tidak ditemukan",
                    data: null
                });
            }
            res.status(200).json({
                message: 'Tagihan Berhasil diambil',
                data: tagihan
            })
        } catch (error) {
            return res.status(500).json({
                data: null,
                message: "Internal server error",
            });
        }
    },
    async editById(req: Request, res: Response) {
        /**
         #swagger.tags=['JenisTagihan']
         #swagger.summary = 'Edit Tagihan (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['id'] = {
            in: 'path',
            required: true,
            type: 'string'
          }
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            nama: { type: "string", example: "SPP" },
                            tipePeriode: { type: "string", example: "Bulanan" },
                            nominalDefault: { type: "number", example: 570000 },
                            wajib: {type: boolean, example: true}
                        }
                    }
                }
            }
         }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }

            const tagihanExist = await JenisTagihanModel.findById(id);
            if (!tagihanExist) {
                return res.status(404).json({
                    message: "ID Tagihan Tidak ditemukan",
                    data: null
                });
            }
            const tagihan = req.body as unknown as JenisTagihan
            await JenisTagihanValidateSchema.validate(tagihan);
            const tagihanUpdated = await JenisTagihanModel.findByIdAndUpdate(id,
                { ...tagihan },
                { new: true, runValidators: true }
            );
            return res.status(200).json({
                message: "Tagihan Success Updated",
                data: tagihanUpdated
            });
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
            #swagger.tags = ['JenisTagihan']
            #swagger.security = [{ "bearerAuth": [] }]
            #swagger.parameters['id'] = {
                in: 'path',
                required: true,
                type: 'string',
            }
        */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }
            const deleteTagihan = await JenisTagihanModel.findByIdAndDelete(id);
            if (!deleteTagihan) {
                return res.status(404).json({
                    message: "Tagihan Tidak Ditemukan",
                    data: null
                })
            }
            return res.status(200).json({
                message: "Data Tagihan Berhasil dihapus",
                success: true
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