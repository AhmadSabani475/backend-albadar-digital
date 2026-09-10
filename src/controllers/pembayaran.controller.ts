import { Request, Response } from "express";
import * as Yup from "yup";
import TagihanModel from "../models/tagihan.models";
import { IReqUser } from "../middleware/auth.middleware";
import PembayaranModel from "../models/pembayaran.models";
import { prosesPembayaran } from "../services/pembayaran.service";

const PembayaranValidateSchema = Yup.object({
    tagihanId: Yup.string().required(),
    nominalBayar: Yup.number().required(),
    tanggalBayar: Yup.date().required()
});

export default {
    async create(req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['Pembayaran']
         #swagger.summary = 'Catat pembayaran tagihan (dari halaman detail tagihan)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            tagihanId: { type: "string", example: "60f7a..." },
                            nominalBayar: { type: "number", example: 500000 },
                            tanggalBayar: { type: "string", format: "date", example: "2026-09-01" }
                        }
                    }
                }
            }
         }
         */
        try {
            const request = await PembayaranValidateSchema.validate(req.body);
            const dicatatOleh = req.user?.id;
            const hasil = await prosesPembayaran({ ...request, dicatatOleh });
            return res.status(201).json({
                message: 'Pembayaran Berhasil Dicatat',
                data: hasil
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['Pembayaran']
         #swagger.summary = 'Ambil semua riwayat pembayaran (bisa filter by tagihanId / santriId)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['tagihanId'] = { in: 'query', type: 'string', required: false }
         #swagger.parameters['santriId'] = { in: 'query', type: 'string', required: false }
         */
        try {
            const { tagihanId, santriId } = req.query;

            const filter: Record<string, unknown> = {};
            if (tagihanId) {
                filter.tagihanId = tagihanId
            }
            if (santriId) {
                filter.santriId = santriId
            }

            const result = await PembayaranModel.find(filter)
                .populate('dicatatOleh')
                .populate('tagihanId')
                .sort({ tanggalBayar: -1 });

            return res.status(200).json({
                message: 'Data Berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    }
}