import { Request, Response } from "express";
import * as Yup from "yup";
import asramaModels from "../models/asrama.models";

const asramaValidateSchema = Yup.object({
    namaAsrama: Yup.string().required("Nama asrama wajib diisi"),
    keterangan: Yup.string().optional(),
});

export default {
    async create(req: Request, res: Response) {
        /**
            #swagger.tags = ['Asrama']
            #swagger.summary = 'Buat asrama baru (khusus admin)'
            #swagger.security = [{ "bearerAuth": [] }]
            #swagger.requestBody = {
               required: true,
               content: {
                   "application/json": {
                       schema: {
                           type: "object",
                           properties: {
                               namaAsrama: { type: "string", example: "Putra" },
                               keterangan: { type: "string", example: "Asrama santri putra" }
                           }
                       }
                   }
               }
            }
           */
        try {
            await asramaValidateSchema.validate(req.body);
            const result = await asramaModels.create(req.body);
            res.status(201).json({
                message: "Asrama berhasil dibuat",
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        /**
        #swagger.tags = ['Asrama']
        #swagger.summary = 'Ambil semua data asrama'
        #swagger.security = [{ "bearerAuth": [] }]
       */
        try {
            const result = await asramaModels.find();
            res.status(200).json({ message: "Berhasil", data: result });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(500).json({ message: err.message, data: null });
        }
    },
}