import { Request, Response } from "express";
import * as Yup from "yup";
import TarifKhususModel from "../models/tarifKhusus.models";
import TagihanModel from "../models/tagihan.models";
import JenisTagihanModel from "../models/jenisTagihan.models";
import SantriModels from "../models/santri.models";

const TagihanValidateSchema = Yup.object({
    santriId: Yup.string().required("Santri wajib dipilih"),
    jenisTagihanId: Yup.string().required("Jenis tagihan wajib dipilih"),
    periode: Yup.string().required("Periode wajib diisi"),
    jatuhTempo: Yup.date().required("Jatuh tempo wajib diisi"),
});

export default {
    async create(req: Request, res: Response) {
        try {
            const request = await TagihanValidateSchema.validate(req.body);
            const [santri, jenisTagihan] = await Promise.all([
                SantriModels.findById(request.santriId),
                JenisTagihanModel.findById(request.jenisTagihanId),
            ]);
            if (!santri) return res.status(404).json({ message: "Santri Tidak Ditemukan", data: null });
            if (!jenisTagihan) return res.status(404).json({ message: "Jenis Tagihan Tidak Ditemukan", data: null });

            const tarifKhusus = await TarifKhususModel.findOne({ santriId: request.santriId, jenisTagihanId: request.jenisTagihanId });
            const nominalTagihan = tarifKhusus ? tarifKhusus.nominalKhusus : jenisTagihan.nominalDefault;
            const sumberNominal = tarifKhusus ? 'tarif_khusus' : 'default';
            const result = await TagihanModel.create({
                ...request,
                nominalTagihan,
                sumberNominal
            });
            return res.status(201).json({
                message: "Tagihan Berhasil Dibuat",
                data: result
            });
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({ message: err.message, data: null });
        }
    },
    async findAll(req: Request, res: Response) {
        try {
            const { santriId, jenisTagihanId, status, periode, overdue } = req.query;

            const filter: Record<string, unknown> = {};
            if (santriId) filter.santriId = santriId;
            if (jenisTagihanId) filter.jenisTagihanId = jenisTagihanId;
            if (status) filter.status = status;
            if (periode) filter.periode = periode;

            if (overdue === 'true') {
                filter.status = { $ne: 'lunas' };
                filter.jatuhTempo = { $lt: new Date() };
            }

            const result = await TagihanModel.find(filter)
                .populate('santriId')
                .populate('jenisTagihanId')
                .sort({ jatuhTempo: 1 });

            return res.status(200).json({
                message: 'Data Tagihan Berhasil Diambil',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    },
    async createBulk(req: Request, res: Response) {
        try {
            const { jenisTagihanId, periode, jatuhTempo, target, santriIds, hanyaLayananLaundry } = req.body;

            if (!jenisTagihanId || !periode || !jatuhTempo) {
                return res.status(400).json({
                    message: "jenisTagihanId, periode, dan jatuhTempo wajib diisi",
                    data: null
                });
            }

            const jenisTagihan = await JenisTagihanModel.findById(jenisTagihanId);
            if (!jenisTagihan) {
                return res.status(404).json({ message: "Jenis Tagihan Tidak Ditemukan", data: null });
            }

            // Tentukan daftar santri yang jadi target
            const santriFilter: Record<string, unknown> = { status: 'aktif' };
            if (target === 'custom' && Array.isArray(santriIds) && santriIds.length > 0) {
                santriFilter._id = { $in: santriIds };
            }
            if (hanyaLayananLaundry) {
                santriFilter.layananLaundry = true;
            }

            const santriList = await SantriModels.find(santriFilter);

            const berhasil: any[] = [];
            const dilewati: { santriId: string; nama: string; alasan: string }[] = [];

            for (const santri of santriList) {
                // Cek udah ada tagihan periode ini belum (hindari duplicate)
                const sudahAda = await TagihanModel.findOne({
                    santriId: santri._id,
                    jenisTagihanId,
                    periode
                });
                if (sudahAda) {
                    dilewati.push({ santriId: santri._id.toString(), nama: santri.namaLengkap, alasan: "Tagihan periode ini sudah ada" });
                    continue;
                }

                const tarifKhusus = await TarifKhususModel.findOne({
                    santriId: santri._id,
                    jenisTagihanId
                });

                const nominalTagihan = tarifKhusus ? tarifKhusus.nominalKhusus : jenisTagihan.nominalDefault;
                const sumberNominal = tarifKhusus ? 'tarif_khusus' : 'default';

                const tagihanBaru = await TagihanModel.create({
                    santriId: santri._id,
                    jenisTagihanId,
                    periode,
                    jatuhTempo,
                    nominalTagihan,
                    sumberNominal,
                    status: 'belum_bayar'
                });
                berhasil.push(tagihanBaru);
            }

            return res.status(201).json({
                message: `Berhasil generate ${berhasil.length} tagihan, ${dilewati.length} dilewati`,
                data: { berhasil, dilewati }
            });
        } catch (error) {
            const err = error as unknown as Error;
            return res.status(400).json({ message: err.message, data: null });
        }
    }
}