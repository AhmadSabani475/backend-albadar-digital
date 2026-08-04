import { Request, Response } from "express";
import * as Yup from "yup";
import kamarModels from "../models/kamar.models";

const kamarValidateSchema = Yup.object({
    namaKamar: Yup.string().required("Nama kamar wajib diisi"),
    asramaId: Yup.string().required("Asrama wajib dipilih"),
    kapasitas: Yup.number().required("Kapasitas wajib diisi").min(1),
});

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['Kamar']
         #swagger.summary = 'Buat kamar baru (khusus admin)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            namaKamar: { type: "string", example: "Kamar 1" },
                            asramaId: { type: "string", example: "6a70b7... (ambil dari GET /asrama)" },
                            kapasitas: { type: "number", example: 10 }
                        }
                    }
                }
            }
         }
        */
        
        try {
            await kamarValidateSchema.validate(req.body);
            const result = await kamarModels.create(req.body);
            res.status(201).json({
                message: "Kamar berhasil dibuat",
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
         /**
         #swagger.tags = ['Kamar']
         #swagger.summary = 'Ambil semua data kamar (beserta nama asrama)'
         #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const result = await kamarModels.find().populate('asramaId');
            res.status(200).json({ message: "Berhasil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(500).json({ message: err.message, data: null });
        }
    },
}