import { Request, Response } from "express";
import * as Yup from "yup";
import TarifKhususModel from "../models/tarifKhusus.models";
import { TarifKhusus } from "../types/TarifKhusus";
import { Types } from "mongoose";
import SantriModels from "../models/santri.models";
import JenisTagihanModel from "../models/jenisTagihan.models";

const TarifKhususValidateSchema = Yup.object({
    santriId: Yup.string().required(),
    jenisTagihanId: Yup.string().required(),
    nominalKhusus: Yup.number().required(),
    keterangan: Yup.string().optional()
});

export default {
    async findAll(req: Request, res: Response) {
        try {
            const { santriId, jenisTagihanId } = req.query;
            const filter: Record<string, unknown> = {};
            if (santriId) filter.santriId = santriId;
            if (jenisTagihanId) filter.jenisTagihanId = jenisTagihanId;

            const result = await TarifKhususModel.find(filter).populate(['santriId', 'jenisTagihanId']);
            return res.status(200).json({
                message: "Data Tarif Khusus Berhasil Diambil",
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async create(req: Request, res: Response) {
        try {
            const request = req.body as unknown as TarifKhusus;
            await TarifKhususValidateSchema.validate(request);
            const [santri, jenisTagihan] = await Promise.all([
                SantriModels.findById(request.santriId),
                JenisTagihanModel.findById(request.jenisTagihanId),
            ]);
            if (!santri) return res.status(404).json({ message: "Santri Tidak Ditemukan", data: null });
            if (!jenisTagihan) return res.status(404).json({ message: "Jenis Tagihan Tidak Ditemukan", data: null });

            const result = await TarifKhususModel.create(request);
            return res.status(201).json({
                message: 'Tarif Khusus Berhasil Ditambahkan',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async deleteById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null })
            }
            const result = await TarifKhususModel.findByIdAndDelete(id)
            if (!result) {
                return res.status(404).json({
                    message: "Tarif Khusus tidak ditemukan",
                    data: null
                })
            }

            return res.status(200).json({
                message: 'Tarif Berhasil dihapus',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    }
}