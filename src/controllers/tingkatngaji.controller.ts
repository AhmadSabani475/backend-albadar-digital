
import { Request, Response } from "express";
import * as Yup from "yup";
import { Types } from "mongoose";
import TingkatNgajiModel, { TingkatNgaji } from "../models/tingkatngaji.models";

const tingkatNgajiValidateSchema = Yup.object({
    urutan: Yup.number().required("Urutan wajib diisi").min(1).max(6, "Tingkat ngaji maksimal 6"),
    nama: Yup.string().required("Nama tingkat ngaji wajib diisi"),
})

export default {
    async create(req: Request, res: Response) {
        try {
            const data = req.body as unknown as TingkatNgaji;
            await tingkatNgajiValidateSchema.validate(data);
            const result = await TingkatNgajiModel.create(data);
            return res.status(201).json({ message: "Tingkat Ngaji Berhasil Ditambahkan", data: result });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Urutan ini sudah dipakai", data: null });
            }
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async findAll(req: Request, res: Response) {
        try {
            const result = await TingkatNgajiModel.find().sort({ urutan: 1 });
            return res.status(200).json({ message: "Data Berhasil Diambil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null });
            }
            const result = await TingkatNgajiModel.findById(id);
            if (!result) {
                return res.status(404).json({ message: "Tingkat Ngaji Tidak Ditemukan", data: null });
            }
            return res.status(200).json({ message: "Data Berhasil Diambil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID Not Valid", data: null });
            }
            const data = req.body as unknown as TingkatNgaji;
            await tingkatNgajiValidateSchema.validate(data);
            const result = await TingkatNgajiModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
            if (!result) {
                return res.status(404).json({ message: "Tingkat Ngaji Tidak Ditemukan", data: null });
            }
            return res.status(200).json({ message: "Tingkat Ngaji Berhasil Diupdate", data: result });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Urutan ini sudah dipakai", data: null });
            }
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
            const result = await TingkatNgajiModel.findByIdAndDelete(id);
            if (!result) {
                return res.status(404).json({ message: "Tingkat Ngaji Tidak Ditemukan", data: null });
            }
            return res.status(200).json({ message: "Tingkat Ngaji Berhasil Dihapus", data: null });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
}