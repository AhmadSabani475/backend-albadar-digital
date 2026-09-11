import SantriModels from "../models/santri.models"
import { Request, Response } from "express"
import TagihanModel from "../models/tagihan.models"
import KwitansiModel from "../models/kwitansi.models"
import RekeningModel from "../models/rekening.models"
import PembayaranModel from "../models/pembayaran.models"

export const dashboardController = {
    async getSummary(req: Request, res: Response) {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const [totalSantriAktif,
                tagihanBelumLunas,
                pemasukanHariIni,
                saldoTabunganZiarah,
                saldoUangJajan,
                grafikPemasukanHarian,
                pieChartStatusTagihan,
                transaksiTerakhir,
            ] = await Promise.all([
                SantriModels.countDocuments({ status: 'aktif' }),
                TagihanModel.find({ status: { $ne: 'lunas' } }),
                KwitansiModel.aggregate([
                    { $match: { createdAt: { $gte: startOfDay, $lt: endOfDay } } },
                    { $group: { _id: null, total: { $sum: '$totalNominal' } } }
                ]),
                RekeningModel.aggregate([
                    { $match: { jenisRekening: 'tabungan_ziarah' } },
                    { $group: { _id: null, total: { $sum: '$saldo' } } }
                ]),
                RekeningModel.aggregate([
                    { $match: { jenisRekening: 'uang_jajan' } },
                    { $group: { _id: null, total: { $sum: '$saldo' } } }
                ]),
                KwitansiModel.aggregate([
                    { $match: { createdAt: { $gte: startOfMonth, $lt: endOfDay } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            total: { $sum: '$totalNominal' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),
                TagihanModel.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),
                KwitansiModel.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('santriId', 'namaLengkap')
            ])

            const totalTagihanBelumLunas = (await Promise.all(
                tagihanBelumLunas.map(async (t) => {
                    const semuaPembayaran = await PembayaranModel.find({ tagihanId: t._id })
                    const totalTerbayar = semuaPembayaran.reduce((sum, p) => sum + p.nominalBayar, 0)
                    return Math.max(0, t.nominalTagihan - totalTerbayar)
                })
            )).reduce((sum, sisa) => sum + sisa, 0);
            return res.status(200).json({
                message: 'Ringkasan dashboard berhasil diambil',
                data: {
                    totalSantriAktif,
                    totalTagihanBelumLunas,
                    pemasukanHariIni: pemasukanHariIni[0]?.total || 0,
                    saldoTabunganZiarah: saldoTabunganZiarah[0]?.total || 0,
                    saldoUangJajan: saldoUangJajan[0]?.total || 0,
                    grafikPemasukanHarian: grafikPemasukanHarian.map((g) => ({
                        tanggal: g._id,
                        total: g.total,
                    })),
                    pieChartStatusTagihan: pieChartStatusTagihan.map((p) => ({
                        status: p._id,
                        count: p.count,
                    })),
                    transaksiTerakhir,
                }
            });
        } catch (error) {
            const err = error as Error;
            return res.status(500).json({ message: err.message, data: null });
        }
    }
}


