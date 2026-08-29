import { ClientSession, Types } from "mongoose";
import RekeningModel from "../models/rekening.models";
import MutasiRekeningModel from "../models/mutasi.models";

interface ProsesMutasiInput {
    rekeningId: string;
    jenis: 'setor' | 'tarik';
    kategori: 'harian' | 'manual';
    nominal: number;
    keterangan?: string;
    dicatatOleh?: Types.ObjectId;
}

export async function prosesMutasi(input: ProsesMutasiInput, session?: ClientSession) {
    const rekening = await RekeningModel.findById(input.rekeningId).session(session ?? null);
    if (!rekening) {
        throw new Error('Rekening tidak ditemukan');
    }

    if (input.jenis === 'tarik') {
        if (rekening.saldo < input.nominal) {
            throw new Error(`Saldo tidak cukup untuk rekening ${rekening._id}`);
        }
        rekening.saldo -= input.nominal;
    } else {
        rekening.saldo += input.nominal;
    }

    const [mutasiBaru] = await MutasiRekeningModel.create(
        [{
            rekeningId: input.rekeningId,
            jenis: input.jenis,
            kategori: input.kategori,
            nominal: input.nominal,
            tanggal: new Date(),
            keterangan: input.keterangan,
            dicatatOleh: input.dicatatOleh,
        }],
        { session }
    );

    await rekening.save({ session });

    return { mutasi: mutasiBaru, rekening };
}