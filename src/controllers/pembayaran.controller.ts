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