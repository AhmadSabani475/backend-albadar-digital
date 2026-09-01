import KwitansiModel from "../models/kwitansi.models";
import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import * as Yup from "yup";
import { IReqUser } from "../middleware/auth.middleware";
import { prosesPembayaran } from "../services/pembayaran.service";
import { prosesMutasi } from "../services/mutasiRekening.service";
import RekeningModel from "../models/rekening.models";
import SantriModels from "../models/santri.models";
import TagihanModel from "../models/tagihan.models";
import PembayaranModel from "../models/pembayaran.models";

async function generateNomorKwitansi(session?: mongoose.ClientSession): Promise<string> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const kwitansiTerakhirHariIni = await KwitansiModel.findOne({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
    }).sort({ createdAt: -1 })
        .session(session ?? null);

    let urutanBerikutnya = 1;

    if (kwitansiTerakhirHariIni) {

        const bagianTerakhir = kwitansiTerakhirHariIni.nomorKwitansi.split('-').pop();
        const urutanLama = parseInt(bagianTerakhir ?? '0', 10);
        urutanBerikutnya = urutanLama + 1;
    }

    const tanggalFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const urutanPadded = String(urutanBerikutnya).padStart(4, '0');

    return `KW-${tanggalFormatted}-${urutanPadded}`;
}

const ItemSchema = Yup.object({
    tipe: Yup.string().oneOf(['bayar_tagihan', 'setor_rekening', 'tarik_rekening']).required(),
    tagihanId: Yup.string().when('tipe', {
        is: 'bayar_tagihan',
        then: (schema) => schema.required('tagihanId wajib diisi untuk bayar tagihan'),
    }),
    rekeningId: Yup.string().when('tipe', {
        is: (val: string) => val === 'setor_rekening' || val === 'tarik_rekening',
        then: (schema) => schema.required('rekeningId wajib diisi untuk transaksi rekening'),
    }),
    kategori: Yup.string().oneOf(['harian', 'manual']).default('manual'),
    nominal: Yup.number().required().positive(),
    keterangan: Yup.string().optional(),
});

const KasirTransaksiSchema = Yup.object({
    santriId: Yup.string().required(),
    items: Yup.array().of(ItemSchema).min(1, 'Minimal 1 item transaksi').required(),
});

export default {
    async prosesTransaksi(req: IReqUser, res: Response) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const request = await KasirTransaksiSchema.validate(req.body, { abortEarly: false });
            const dicatatOleh = req.user?.id;

            const hasilItems: any[] = [];
            let totalNominal = 0;

            for (const item of request.items) {
                if (item.tipe === 'bayar_tagihan') {
                    const hasil = await prosesPembayaran(
                        {
                            tagihanId: item.tagihanId as string,
                            nominalBayar: item.nominal,
                            keterangan: item.keterangan,
                            dicatatOleh,
                        },
                        session
                    );

                    hasilItems.push({
                        tipe: 'bayar_tagihan',
                        referensiId: item.tagihanId,
                        nominal: item.nominal,
                        keterangan: item.keterangan,
                    });
                    totalNominal += item.nominal;
                } else {
                    const jenis = item.tipe === 'setor_rekening' ? 'setor' : 'tarik';

                    const hasil = await prosesMutasi(
                        {
                            rekeningId: item.rekeningId as string,
                            jenis,
                            kategori: (item.kategori as 'harian' | 'manual') ?? 'manual',
                            nominal: item.nominal,
                            keterangan: item.keterangan,
                            dicatatOleh,
                        },
                        session
                    );

                    hasilItems.push({
                        tipe: item.tipe,
                        referensiId: item.rekeningId,
                        nominal: item.nominal,
                        keterangan: item.keterangan,
                    });
                    totalNominal += item.nominal;
                }
            }

            const nomorKwitansi = await generateNomorKwitansi(session);
            const semuaRekening = await RekeningModel.find({ santriId: request.santriId }).session(session);
            const saldoSnapshot = semuaRekening.map((r) => ({
                jenisRekening: r.jenisRekening,
                saldo: r.saldo,
            }));

            const [kwitansi] = await KwitansiModel.create(
                [{
                    nomorKwitansi,
                    santriId: request.santriId,
                    items: hasilItems,
                    saldoSnapshot,
                    totalNominal,
                    diCatatOleh: dicatatOleh,
                }],
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json({
                message: 'Transaksi berhasil diproses',
                data: kwitansi,
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async getRingkasanData(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!Types.ObjectId.isValid(id)) {
                return res.status(401).json({
                    message: 'ID Tidak Valid',
                    data: null
                })
            }
            const santri = await SantriModels.findById(id);
            if (!santri) {
                return res.status(404).json({
                    message: 'Santri tidak ditemukan',
                    data: null
                })
            }
            const tagihan = await TagihanModel.find({ santriId: id, status: { $ne: 'lunas' } })
                .populate('jenisTagihanId', 'nama');
            const tagihanDenganSisa = await Promise.all(
                tagihan.map(async (t) => {
                    const semuaPembayaran = await PembayaranModel.find({ tagihanId: t._id });
                    const totalTerbayar = semuaPembayaran.reduce((sum, p) => sum + p.nominalBayar, 0);
                    const sisaTagihan = t.nominalTagihan - totalTerbayar;
                    const cicilanKe = semuaPembayaran.length + 1;
                    return {
                        _id: t._id,
                        namaTagihan: (t.jenisTagihanId as any)?.nama,
                        nominalTagihan: t.nominalTagihan,
                        sisaTagihan,
                        cicilanKe,
                        status: t.status,
                    };
                })
            )

            const rekening = await RekeningModel.find({ santriId: id });
            return res.status(200).json({
                message: 'Data berhasil diambil',
                data: {
                    santri,
                    tagihan: tagihanDenganSisa,
                    rekening,
                }
            })
        } catch (error) {
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    }
};