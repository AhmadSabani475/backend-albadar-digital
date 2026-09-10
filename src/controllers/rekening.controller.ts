import * as Yup from "yup";
import { Request, Response } from "express";
import RekeningModel from "../models/rekening.models";
import { Types } from "mongoose";

const rekeningValidateSchema = Yup.object({
    santriId: Yup.string().required(),
    jenisRekening: Yup.string().oneOf(['uang_jajan', 'tabungan_ziarah']).required(),
    nominalHarian: Yup.number().when('jenisRekening', {
        is: 'uang_jajan',
        then: (schema) => schema.required('Nominal harian wajib diisi untuk rekening uang jajan'),
        otherwise: (schema) => schema.optional()
    })
})

export default {
    async create(req: Request, res: Response) {
        /**
         #swagger.tags = ['Rekening']
         #swagger.summary = 'Buat rekening baru untuk santri'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            santriId: { type: "string", example: "60f7a..." },
                            jenisRekening: { type: "string", enum: ["uang_jajan", "tabungan_ziarah"] },
                            nominalHarian: { type: "number", example: 10000 }
                        }
                    }
                }
            }
         }
         */
        try {
            const request = await rekeningValidateSchema.validate(req.body);
            const nominalHarian = request.jenisRekening === 'uang_jajan' ? request.nominalHarian : undefined;
            const result = await RekeningModel.create({
                ...request,
                nominalHarian: nominalHarian,
                saldo: 0
            })
            return res.status(201).json({
                message: 'Rekening berhasil dibuat',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        /**
         #swagger.tags = ['Rekening']
         #swagger.summary = 'Ambil semua rekening (bisa filter by jenisRekening / santriId)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['jenisRekening'] = { in: 'query', type: 'string', required: false, description: 'uang_jajan atau tabungan_ziarah' }
         #swagger.parameters['santriId'] = { in: 'query', type: 'string', required: false }
         */
        try {
            const { jenisRekening, santriId } = req.query;
            const validJenis = ['uang_jajan', 'tabungan_ziarah'];
            if (jenisRekening && !validJenis.includes(jenisRekening as string)) {
                return res.status(400).json({ message: 'jenisRekening tidak valid', data: null });
            }
            const filter: Record<string, any> = {};
            if (jenisRekening) filter.jenisRekening = jenisRekening;
            if (santriId) filter.santriId = santriId;

            const result = await RekeningModel.find(filter).populate('santriId', 'namaLengkap');
            return res.status(200).json({
                message: 'Data Berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findById(req: Request, res: Response) {
        /**
         #swagger.tags = ['Rekening']
         #swagger.summary = 'Ambil detail rekening berdasarkan ID (beserta data santri + kamar + asrama)'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.parameters['id'] = { in: 'path', required: true, type: 'string', description: 'ID rekening' }
         */
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    message: "ID Not Valid",
                    data: null
                })
            }
            const result = await RekeningModel.findById(id).populate({
                path: 'santriId',
                populate: [
                    {
                        path: 'kamarId',
                        populate: 'asramaId' 
                    },
                ]
            });
            if (!result) {
                return res.status(404).json({
                    message: 'Rekening Tidak ditemukan',
                    data: null
                })
            }

            return res.status(200).json({
                message: 'Rekening berhasil diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    }
}