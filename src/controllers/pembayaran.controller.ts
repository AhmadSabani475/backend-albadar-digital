import { Request, Response } from "express";
import * as Yup from "yup";
import TagihanModel from "../models/tagihan.models";
import { IReqUser } from "../middleware/auth.middleware";
import PembayaranModel from "../models/pembayaran.models";

const PembayaranValidateSchema = Yup.object({
    tagihanId: Yup.string().required(),
    nominalBayar: Yup.number().required(),
    tanggalBayar: Yup.date().required()
});

export default {
    async create(req: IReqUser, res: Response) {
        try {
            const request = await PembayaranValidateSchema.validate(req.body);
            const tagihan = await TagihanModel.findById(request.tagihanId);
            if (!tagihan) {
                return res.status(404).json({
                    message: 'Tagihan Tidak Ditemukan',
                    data: null
                })
            }
            if (tagihan.status === 'lunas') {
                return res.status(400).json({
                    message: 'Tagihan sudah lunas',
                    data: null
                })
            }
            const dicatatOleh = req.user?.id;
            const result = await PembayaranModel.create({
                ...request,
                dicatatOleh: dicatatOleh,
                santriId: tagihan?.santriId,
                tanggalBayar: request.tanggalBayar ?? new Date()
            });

            const semuaPembayaran = await PembayaranModel.find({ tagihanId: request.tagihanId });
            const totalTerbayar = semuaPembayaran.reduce((sum, p) => sum + p.nominalBayar, 0);

            const statusBaru = totalTerbayar >= tagihan.nominalTagihan ? 'lunas' : 'sebagian';

            const tagihanUpdated = await TagihanModel.findByIdAndUpdate(
                request.tagihanId,
                { status: statusBaru },
                { new: true }
            )

            return res.status(201).json({
                message: 'Pembayaran Berhasil Dicatat',
                data: {
                    totalTerbayar,
                    tagihan: tagihanUpdated,
                }
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