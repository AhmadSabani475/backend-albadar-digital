import { Request, Response } from "express";
import * as Yup from "yup";
import SekolahModel from "../models/sekolah.models";

const sekolahValidateSchema = Yup.object({
    nama: Yup.string().required(),
    jenjang: Yup.string().required()
});

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['Sekolah']
            #swagger.summary = 'Buat Sekolah baru '
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            nama: { type: "string", example: "Mts Yppa" },
                            jenjang: {type: "string", example: 'SMP/MTs'}
                        }
                    }
                }
            }
         }
         */
        try {
            await sekolahValidateSchema.validate(req.body);
            const result = await SekolahModel.create(req.body);
            return res.status(201).json({
                message: 'Sekolah Berhasil ditambahkan',
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['Sekolah']
          #swagger.summary = 'Ambil semua sekolah'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const result = await SekolahModel.find();
            return res.status(200).json({
                message: 'data berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    }
}