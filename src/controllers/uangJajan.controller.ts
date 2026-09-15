import { Request, Response } from "express"
import RekeningModel from "../models/rekening.models"
import MutasiRekeningModel from "../models/mutasi.models"
import { IReqUser } from "../middleware/auth.middleware"

export default {
    async getStatusHariIni(req: Request, res: Response) {
        /**
         #swagger.tags = ['UangJajan']
         #swagger.summary = 'Ambil status pembagian uang jajan hari ini untuk semua santri'
         #swagger.security = [{ "bearerAuth": [] }]
         */
        try {
            const rekeningList = await RekeningModel.find({
                jenisRekening: 'uang_jajan'
            }).populate('santriId')

            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

            const rekeningIds = rekeningList.map(r => r._id)

            const mutasiHariIni = await MutasiRekeningModel.find({
                rekeningId: { $in: rekeningIds },
                kategori: 'harian',
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            })

            const sudahDiambilSet = new Set(
                mutasiHariIni.map(m => m.rekeningId.toString())
            )

            const data = rekeningList.map(r => ({
                rekeningId: r._id,
                namaSantri: (r.santriId as any)?.namaLengkap ?? null,
                nominalHarian: r.nominalHarian,
                saldo: r.saldo,
                sudahDiambil: sudahDiambilSet.has(r._id.toString()),
                saldoCukup: r.nominalHarian != null && r.saldo >= r.nominalHarian
            }))

            res.status(200).json({ message: "Data status uang jajan berhasil diambil", data })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },

    async bagikan(req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['UangJajan']
         #swagger.summary = 'Bagikan uang jajan harian ke santri terpilih'
         #swagger.description = 'Memproses penarikan harian untuk rekening-rekening yang dipilih. Validasi: belum diambil hari ini, saldo cukup, nominalHarian sudah diset.'
         #swagger.security = [{ "bearerAuth": [] }]
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            rekeningIds: { type: "array", items: { type: "string" }, example: ["60f7a...", "60f7b..."] }
                        }
                    }
                }
            }
         }
         */
        try {
            const { rekeningIds } = req.body as { rekeningIds: string[] }

            if (!Array.isArray(rekeningIds) || rekeningIds.length === 0) {
                return res.status(400).json({ message: "rekeningIds wajib diisi dan berupa array", data: null })
            }

            const rekeningList = await RekeningModel.find({
                _id: { $in: rekeningIds },
                jenisRekening: 'uang_jajan'
            })

            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

            const mutasiHariIni = await MutasiRekeningModel.find({
                rekeningId: { $in: rekeningIds },
                kategori: 'harian',
                createdAt: { $gte: startOfDay, $lt: endOfDay }
            })
            const sudahDiambilSet = new Set(
                mutasiHariIni.map(m => m.rekeningId.toString())
            )

            const berhasil: any[] = []
            const gagal: any[] = []

            for (const rekening of rekeningList) {
                const idStr = rekening._id.toString()

                if (sudahDiambilSet.has(idStr)) {
                    gagal.push({ rekeningId: rekening._id, alasan: "Sudah diambil hari ini" })
                    continue
                }

                if (rekening.nominalHarian == null) {
                    gagal.push({ rekeningId: rekening._id, alasan: "nominalHarian belum diset" })
                    continue
                }

                if (rekening.saldo < rekening.nominalHarian) {
                    gagal.push({ rekeningId: rekening._id, alasan: "Saldo tidak cukup" })
                    continue
                }

                try {
                    await MutasiRekeningModel.create({
                        rekeningId: rekening._id,
                        jenis: 'tarik',
                        kategori: 'harian',
                        nominal: rekening.nominalHarian,
                        dicatatOleh: req.user?.id,
                        keterangan: `Uang jajan harian - ${startOfDay.toLocaleDateString('id-ID')}`
                    })

                    rekening.saldo -= rekening.nominalHarian
                    await rekening.save()

                    berhasil.push({ rekeningId: rekening._id, saldoBaru: rekening.saldo })
                } catch (innerError) {
                    const err = innerError as Error
                    gagal.push({ rekeningId: rekening._id, alasan: err.message })
                }
            }

            const foundIds = new Set(rekeningList.map(r => r._id.toString()))
            for (const id of rekeningIds) {
                if (!foundIds.has(id)) {
                    gagal.push({ rekeningId: id, alasan: "Rekening tidak ditemukan / bukan uang_jajan" })
                }
            }

            res.status(200).json({
                message: "Proses selesai",
                data: { berhasil, gagal }
            })
        } catch (error) {
            const err = error as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    }
}