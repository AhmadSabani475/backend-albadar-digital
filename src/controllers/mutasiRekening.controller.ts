import * as Yup from "yup";
import { Request, Response } from "express";
import { IReqUser } from "../middleware/auth.middleware";
import MutasiRekeningModel from "../models/mutasi.models";
import RekeningModel from "../models/rekening.models";
import { Types } from "mongoose";
import { prosesMutasi } from "../services/mutasiRekening.service";

const MutasiRekeningValidateSchema = Yup.object({
    rekeningId: Yup.string().required(),
    jenis: Yup.string().oneOf(['setor', 'tarik']).required(),
    kategori: Yup.string().oneOf(['harian', 'manual']).required(),
    nominal: Yup.number().required().positive(),
    keterangan: Yup.string().optional()
});

export default {
    async create(req: IReqUser, res: Response) {
        try {
            const request = await MutasiRekeningValidateSchema.validate(req.body);
            const dicatatOleh = req.user?.id ? new Types.ObjectId(req.user.id) : undefined;

            const hasil = await prosesMutasi({ ...request, dicatatOleh });

            return res.status(201).json({
                message: 'Data berhasil ditambahkan',
                data: hasil
            });
        } catch (error) {
            const err = error as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findMutasiById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }

            const rekening = await RekeningModel.findById(id);
            if (!rekening) {
                return res.status(404).json({
                    message: 'Rekening Tidak Ditemukan',
                    data: null
                })
            }

            const mutasi = await MutasiRekeningModel.find({ rekeningId: id })
                .populate('dicatatOleh')
                .sort({ tanggal: -1 });

            return res.status(200).json({
                message: 'Riwayat Mutasi Berhasil diambil',
                data: mutasi
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    }
}