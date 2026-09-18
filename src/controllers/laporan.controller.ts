import { Request, Response } from "express";
import SantriModels from "../models/santri.models";
import TagihanModel from "../models/tagihan.models";
import PembayaranModel from "../models/pembayaran.models";

export default {
    async getAllTunggakan(req: Request, res: Response) {
        try {
            const { santriId, jenisTagihanId, kelasId } = req.query;

            const filter: Record<string, unknown> = { status: { $ne: 'lunas' } };
            if (santriId) filter.santriId = santriId;
            if (jenisTagihanId) filter.jenisTagihanId = jenisTagihanId;
            if (kelasId) {
                const santriList = await SantriModels.find({ kelasFormal: kelasId }, '_id');
                const santriIdsFromKelas = santriList.map((s) => s._id.toString());
                filter.santriId = { $in: santriIdsFromKelas };
            }
            const tagihanBelumLunas = await TagihanModel.find(filter)
                .populate({
                    path: 'santriId',
                    select: 'namaLengkap ayah kamarId sekolah kelasFormal kelasNgaji',
                    populate: {
                        path: 'kamarId',
                        select: 'nama asramaId',
                        populate: {
                            path: 'asramaId',
                            select: 'namaAsrama'
                        }
                    }
                }).populate('jenisTagihanId', 'nama')

            const itemTunggakan = await Promise.all(
                tagihanBelumLunas.map(async (t) => {
                    const pembayaran = await PembayaranModel.find({ tagihanId: t._id });
                    const terbayar = pembayaran.reduce((sum, p) => sum + p.nominalBayar, 0);
                    const sisatagihan = Math.max(0, t.nominalTagihan - terbayar);
                    return {
                        santriId: (t.santriId as any)?._id?.toString(),
                        santri: t.santriId,
                        namaTagihan: (t.jenisTagihanId as any)?.nama ?? '-',
                        sisatagihan,
                        periode: t.periode,
                        jatuhTempo: t.jatuhTempo,
                        createdAt: t.get('createdAt'),
                        noHpAyah: (t.santriId as any)?.ayah?.noHp ?? null,
                    }
                })
            )
            const itemValid = itemTunggakan.filter((i) => i.sisatagihan > 0);

            const grouped = new Map<string, any>();
            for (const item of itemValid) {
                if (!grouped.has(item.santriId)) {
                    grouped.set(item.santriId, {
                        santriId: item.santriId,
                        santri: item.santri,
                        noHpAyah: item.noHpAyah,
                        tagihanList: [],
                        totalTunggakan: 0,
                        tanggalTertua: item.createdAt
                    })
                }
                const entry = grouped.get(item.santriId);
                entry.tagihanList.push({
                    namaTagihan: item.namaTagihan,
                    sisaTagihan: item.sisatagihan,
                    periode: item.periode
                });
                entry.totalTunggakan += item.sisatagihan;
                if (new Date(item.createdAt) < new Date(entry.tanggalTertua)) {
                    entry.tanggalTertua = item.createdAt;
                }
            }
            const dataPerSantri = Array.from(grouped.values());
            const totalSantriMenunggak = dataPerSantri.length;
            const totalNominalTunggakan = dataPerSantri.reduce((sum, d) => sum + d.totalTunggakan, 0);
            const rataRataPerSantri = totalSantriMenunggak > 0
                ? Math.round(totalNominalTunggakan / totalSantriMenunggak)
                : 0;

            const now = new Date();
            const jumlahLebih30Hari = dataPerSantri.filter((d) => {
                const selisihHari = (now.getTime() - new Date(d.tanggalTertua).getTime()) / (1000 * 60 * 60 * 24);
                return selisihHari > 30;
            }).length;
            return res.status(200).json({
                message: 'Data Tunggakan berhasil diambil',
                stats: {
                    totalSantriMenunggak,
                    totalNominalTunggakan,
                    rataRataPerSantri,
                    jumlahLebih30Hari
                },
                data: dataPerSantri
            })
        } catch (error) {
            const err = error as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    }
}