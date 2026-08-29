import { ClientSession, Types } from "mongoose";
import TagihanModel from "../models/tagihan.models";
import PembayaranModel from "../models/pembayaran.models";

interface ProsesPembayaranInput {
    tagihanId: string;
    nominalBayar: number;
    tanggalBayar?: Date;
    metodeBayar?: string;
    keterangan?: string;
    dicatatOleh?: Types.ObjectId;
}

export async function prosesPembayaran(input: ProsesPembayaranInput, session?: ClientSession) {
    const tagihan = await TagihanModel.findById(input.tagihanId).session(session ?? null);
    if (!tagihan) {
        throw new Error('Tagihan tidak ditemukan');
    }
    if (tagihan.status === 'lunas') {
        throw new Error('Tagihan sudah lunas');
    }

    const [pembayaranBaru] = await PembayaranModel.create(
        [{
            tagihanId: input.tagihanId,
            santriId: tagihan.santriId,
            nominalBayar: input.nominalBayar,
            metodeBayar: input.metodeBayar,
            keterangan: input.keterangan,
            dicatatOleh: input.dicatatOleh,
            tanggalBayar: input.tanggalBayar ?? new Date(),
        }],
        { session }
    );

    const semuaPembayaran = await PembayaranModel.find({ tagihanId: input.tagihanId }).session(session ?? null);
    const totalTerbayar = semuaPembayaran.reduce((sum, p) => sum + p.nominalBayar, 0);
    const statusBaru = totalTerbayar >= tagihan.nominalTagihan ? 'lunas' : 'sebagian';

    const tagihanUpdated = await TagihanModel.findByIdAndUpdate(
        input.tagihanId,
        { status: statusBaru },
        { new: true, session }
    );

    return { pembayaran: pembayaranBaru, totalTerbayar, tagihan: tagihanUpdated };
}