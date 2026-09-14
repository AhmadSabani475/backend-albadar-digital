import mongoose from "mongoose";
import dotenv from "dotenv";
import SekolahModel from "../models/sekolah.models";
import AsramaModels from "../models/asrama.models";
import KamarModels from "../models/kamar.models";
import TahunAjaranModel from "../models/tahunajaran.models";
import TingkatKelasModel from "../models/tingkatkelas.models";
import TingkatNgajiModel from "../models/tingkatngaji.models";
import SantriModels from "../models/santri.models";
import KelasSantriModel from "../models/kelassantri.models";
import RiwayatKelasNgajiModel from "../models/riwayatkelasngaji.models";

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL as string;

// Data Alamat lengkap standar
const alamatKomplit = {
    jalan: "Jl. Pesantren Al-Badar No. 45",
    rtRw: "04/02",
    kodeDesaKelurahan: "3273010002",
    desaKelurahan: "Sukapura",
    kodeKecamatan: "327302",
    kecamatan: "Cinambo",
    kodeKabupatenKota: "3273",
    kabupatenKota: "Kota Bandung",
    kodeProvinsi: "32",
    provinsi: "Jawa Barat",
    kodePos: "40295"
};

// Raw data santri komplit dengan beragam variasi untuk pengujian kenaikan kelas
const listDataSantri = [
    {
        nik: "3273011501100001",
        nis: "2025010001",
        namaLengkap: "Ahmad Fauzi Nugraha",
        jenisKelamin: "L" as const,
        tempatLahir: "Bandung",
        tanggalLahir: new Date("2010-03-15"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AhmadFauzi",
        anakKe: 1,
        jumlahSaudara: 3,
        noHp: "081234567801",
        noKk: "3273010101100001",
        namaKepalaKeluarga: "Herman Nugraha",
        pendidikanTerakhir: {
            namaSekolah: "SDN 1 Sukapura",
            jenjangTerakhir: "SD/MI",
            tahunMasuk: "2017",
            tahunLulus: "2023"
        },
        ayah: {
            nik: "3273010101700001",
            nama: "Herman Nugraha",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Teknik",
            pekerjaan: "Wiraswasta",
            noHp: "081122334401"
        },
        ibu: {
            nik: "3273010101750001",
            nama: "Siti Aminah",
            statusHidup: "Hidup" as const,
            pendidikan: "SMA",
            pekerjaan: "Ibu Rumah Tangga",
            noHp: "081122334402"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMP Al-Badar",
        kelasFormalUrutan: 1, // Kelas 7 -> Ekspektasi: Naik Otomatis ke Kelas 8
        kelasFormalStatus: "aktif" as const,
        ngajiUrutan: 1, // Tingkat Ngaji 1 -> Ekspektasi: Naik Otomatis ke Tingkat 2
        laundry: true,
        genderTarget: "L"
    },
    {
        nik: "3273011501100002",
        nis: "2025010002",
        namaLengkap: "Muhammad Hanif Al-Fatih",
        jenisKelamin: "L" as const,
        tempatLahir: "Cimahi",
        tanggalLahir: new Date("2010-06-20"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MuhammadHanif",
        anakKe: 2,
        jumlahSaudara: 2,
        noHp: "081234567802",
        noKk: "3273010101100002",
        namaKepalaKeluarga: "Bambang Irawan",
        pendidikanTerakhir: {
            namaSekolah: "MI Al-Hikmah Cimahi",
            jenjangTerakhir: "SD/MI",
            tahunMasuk: "2017",
            tahunLulus: "2023"
        },
        ayah: {
            nik: "3273010101700002",
            nama: "Bambang Irawan",
            statusHidup: "Hidup" as const,
            pendidikan: "D3 Manajemen",
            pekerjaan: "Karyawan Swasta",
            noHp: "081122334403"
        },
        ibu: {
            nik: "3273010101750002",
            nama: "Rina Kartika",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Guru",
            pekerjaan: "PNS",
            noHp: "081122334404"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMP Al-Badar",
        kelasFormalUrutan: 1, // Kelas 7 -> Ekspektasi: Mengulang di Kelas 7
        kelasFormalStatus: "tinggal_kelas" as const,
        ngajiUrutan: 3, // Tingkat Ngaji 3 (Checkpoint) -> Ekspektasi: Perlu Keputusan Manual
        laundry: false,
        genderTarget: "L"
    },
    {
        nik: "3273011501100003",
        nis: "2025010003",
        namaLengkap: "Rizky Ramadhan Saputra",
        jenisKelamin: "L" as const,
        tempatLahir: "Sumedang",
        tanggalLahir: new Date("2008-09-10"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RizkyRamadhan",
        anakKe: 1,
        jumlahSaudara: 1,
        noHp: "081234567803",
        noKk: "3273010101100003",
        namaKepalaKeluarga: "Deden Suryana",
        pendidikanTerakhir: {
            namaSekolah: "SMPN 1 Sumedang",
            jenjangTerakhir: "MTs/SMP",
            tahunMasuk: "2020",
            tahunLulus: "2023"
        },
        ayah: {
            nik: "3273010101700003",
            nama: "Deden Suryana",
            statusHidup: "Hidup" as const,
            pendidikan: "SMA",
            pekerjaan: "Pedagang",
            noHp: "081122334405"
        },
        ibu: {
            nik: "3273010101750003",
            nama: "Euis Sunarsih",
            statusHidup: "Hidup" as const,
            pendidikan: "SMP",
            pekerjaan: "Ibu Rumah Tangga",
            noHp: "081122334406"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMP Al-Badar",
        kelasFormalUrutan: 3, // Kelas 9 (Tingkat Akhir SMP) -> Ekspektasi: Perlu Keputusan Manual (Lanjut SMA / Alumni)
        kelasFormalStatus: "aktif" as const,
        ngajiUrutan: 6, // Tingkat Ngaji 6 (Tingkat Akhir Ngaji) -> Ekspektasi: Perlu Keputusan Manual (Khatam/Pengurus/dll)
        laundry: true,
        genderTarget: "L"
    },
    {
        nik: "3273011501100004",
        nis: "2025010004",
        namaLengkap: "Siti Nurhaliza Azzahra",
        jenisKelamin: "P" as const,
        tempatLahir: "Garut",
        tanggalLahir: new Date("2010-04-12"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SitiNurhaliza",
        anakKe: 2,
        jumlahSaudara: 4,
        noHp: "081234567804",
        noKk: "3273010101100004",
        namaKepalaKeluarga: "Asep Saifuddin",
        pendidikanTerakhir: {
            namaSekolah: "SDN 2 Garut",
            jenjangTerakhir: "SD/MI",
            tahunMasuk: "2017",
            tahunLulus: "2023"
        },
        ayah: {
            nik: "3273010101700004",
            nama: "Asep Saifuddin",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Peternakan",
            pekerjaan: "Petani/Peternak",
            noHp: "081122334407"
        },
        ibu: {
            nik: "3273010101750004",
            nama: "Neneng Hasanah",
            statusHidup: "Hidup" as const,
            pendidikan: "SMA",
            pekerjaan: "Ibu Rumah Tangga",
            noHp: "081122334408"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMP Al-Badar",
        kelasFormalUrutan: 2, // Kelas 8 -> Ekspektasi: Naik Otomatis ke Kelas 9
        kelasFormalStatus: "aktif" as const,
        ngajiUrutan: 2, // Tingkat Ngaji 2 -> Ekspektasi: Naik Otomatis ke Tingkat 3
        laundry: true,
        genderTarget: "P"
    },
    {
        nik: "3273011501100005",
        nis: "2025010005",
        namaLengkap: "Dewi Lestari Maharani",
        jenisKelamin: "P" as const,
        tempatLahir: "Tasikmalaya",
        tanggalLahir: new Date("2007-11-25"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DewiLestari",
        anakKe: 3,
        jumlahSaudara: 3,
        noHp: "081234567805",
        noKk: "3273010101100005",
        namaKepalaKeluarga: "Ujang Koswara",
        pendidikanTerakhir: {
            namaSekolah: "SMPN 1 Tasikmalaya",
            jenjangTerakhir: "MTs/SMP",
            tahunMasuk: "2019",
            tahunLulus: "2022"
        },
        ayah: {
            nik: "3273010101700005",
            nama: "Ujang Koswara",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Pendidikan",
            pekerjaan: "Guru",
            noHp: "081122334409"
        },
        ibu: {
            nik: "3273010101750005",
            nama: "Cicih Wiarsih",
            statusHidup: "Hidup" as const,
            pendidikan: "D3 Kebidanan",
            pekerjaan: "Bidan",
            noHp: "081122334410"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMA Al-Badar",
        kelasFormalUrutan: 3, // Kelas 12 (Tingkat Akhir SMA) -> Ekspektasi: Perlu Keputusan Manual (Alumni)
        kelasFormalStatus: "aktif" as const,
        ngajiUrutan: 3, // Tingkat Ngaji 3 (Checkpoint) -> Ekspektasi: Perlu Keputusan Manual
        laundry: false,
        genderTarget: "P"
    },
    {
        nik: "3273011501100006",
        nis: "2025010006",
        namaLengkap: "Nabila Zahra Ramadhani",
        jenisKelamin: "P" as const,
        tempatLahir: "Cianjur",
        tanggalLahir: new Date("2009-01-05"),
        fotoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=NabilaZahra",
        anakKe: 1,
        jumlahSaudara: 2,
        noHp: "081234567806",
        noKk: "3273010101100006",
        namaKepalaKeluarga: "Ir. Hendra Gunawan",
        pendidikanTerakhir: {
            namaSekolah: "MTs Al-Inayah Cianjur",
            jenjangTerakhir: "MTs/SMP",
            tahunMasuk: "2020",
            tahunLulus: "2023"
        },
        ayah: {
            nik: "3273010101700006",
            nama: "Ir. Hendra Gunawan",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Sivil",
            pekerjaan: "Wiraswasta",
            noHp: "081122334411"
        },
        ibu: {
            nik: "3273010101750006",
            nama: "Dewi Ratnasari",
            statusHidup: "Hidup" as const,
            pendidikan: "S1 Ekonomi",
            pekerjaan: "Perbankan",
            noHp: "081122334412"
        },
        alamat: alamatKomplit,
        sekolahNama: "SMA Al-Badar",
        kelasFormalUrutan: 1, // Kelas 10 -> Ekspektasi: Naik Otomatis ke Kelas 11
        kelasFormalStatus: "aktif" as const,
        ngajiUrutan: 4, // Tingkat Ngaji 4 -> Ekspektasi: Naik Otomatis ke Tingkat 5
        laundry: true,
        genderTarget: "P"
    }
];

async function seedSantriDenganKelas() {
    try {
        if (!MONGO_URI) {
            throw new Error("DATABASE_URL tidak ditemukan di .env");
        }

        await mongoose.connect(MONGO_URI);
        console.log("🚀 Terhubung ke MongoDB...");

        // 1. PASTIKAN SEKOLAH TERSEDIA
        console.log("📦 1. Memeriksa/Membuat Data Sekolah...");
        const sekolahMap = new Map<string, mongoose.Types.ObjectId>();

        const sekolahListInput = [
            { nama: "SMP Al-Badar", jenjang: "SMP/MTs" },
            { nama: "SMA Al-Badar", jenjang: "SMA/MA" },
        ];

        for (const s of sekolahListInput) {
            let sekolah = await SekolahModel.findOne({ nama: s.nama });
            if (!sekolah) {
                sekolah = await SekolahModel.create(s);
                console.log(`   + Sekolah ${s.nama} dibuat`);
            } else {
                console.log(`   ✓ Sekolah ${s.nama} sudah ada`);
            }
            sekolahMap.set(s.nama, sekolah._id as mongoose.Types.ObjectId);
        }

        // 2. PASTIKAN ASRAMA DAN KAMAR TERSEDIA
        console.log("\n🏠 2. Memeriksa/Membuat Data Asrama & Kamar...");
        let asramaPutra = await AsramaModels.findOne({ namaAsrama: "Asrama Putra 1" });
        if (!asramaPutra) {
            asramaPutra = await AsramaModels.create({ namaAsrama: "Asrama Putra 1", keterangan: "Asrama Santri Putra" });
        }
        let asramaPutri = await AsramaModels.findOne({ namaAsrama: "Asrama Putri 1" });
        if (!asramaPutri) {
            asramaPutri = await AsramaModels.create({ namaAsrama: "Asrama Putri 1", keterangan: "Asrama Santri Putri" });
        }

        let kamarPutra = await KamarModels.findOne({ namaKamar: "Kamar A1" });
        if (!kamarPutra) {
            kamarPutra = await KamarModels.create({ namaKamar: "Kamar A1", asramaId: asramaPutra._id, kapasitas: 15 });
        }
        let kamarPutri = await KamarModels.findOne({ namaKamar: "Kamar B1" });
        if (!kamarPutri) {
            kamarPutri = await KamarModels.create({ namaKamar: "Kamar B1", asramaId: asramaPutri._id, kapasitas: 15 });
        }

        // 3. PASTIKAN TAHUN AJARAN ASAL DAN TUJUAN TERSEDIA
        console.log("\n📅 3. Memeriksa/Membuat Tahun Ajaran Asal & Tujuan...");
        const taAsalNama = "2025/2026";
        const taTujuanNama = "2026/2027";

        let taAsal = await TahunAjaranModel.findOne({ nama: taAsalNama });
        if (!taAsal) {
            taAsal = await TahunAjaranModel.create({
                nama: taAsalNama,
                tanggalMulai: new Date("2025-07-01"),
                tanggalSelesai: new Date("2026-06-30"),
                is_active: false
            });
            console.log(`   + Tahun Ajaran Asal (${taAsalNama}) dibuat`);
        } else {
            console.log(`   ✓ Tahun Ajaran Asal (${taAsalNama}) sudah ada`);
        }

        let taTujuan = await TahunAjaranModel.findOne({ nama: taTujuanNama });
        if (!taTujuan) {
            // jadikan yang tujuan sebagai aktif
            await TahunAjaranModel.updateMany({}, { is_active: false });
            taTujuan = await TahunAjaranModel.create({
                nama: taTujuanNama,
                tanggalMulai: new Date("2026-07-01"),
                tanggalSelesai: new Date("2027-06-30"),
                is_active: true
            });
            console.log(`   + Tahun Ajaran Tujuan (${taTujuanNama}) dibuat & diaktifkan`);
        } else {
            console.log(`   ✓ Tahun Ajaran Tujuan (${taTujuanNama}) sudah ada`);
        }

        // 4. PASTIKAN TINGKAT KELAS FORMAL TERSEDIA
        console.log("\n📚 4. Memeriksa/Membuat Tingkat Kelas Formal...");
        // SMP: Kelas 7 (urutan 1), Kelas 8 (urutan 2), Kelas 9 (urutan 3)
        // SMA: Kelas 10 (urutan 1), Kelas 11 (urutan 2), Kelas 12 (urutan 3)
        for (const [sekolahNama, sekolahId] of sekolahMap.entries()) {
            const isSmp = sekolahNama.includes("SMP");
            const namaKelasList = isSmp ? ["Kelas 7", "Kelas 8", "Kelas 9"] : ["Kelas 10", "Kelas 11", "Kelas 12"];

            for (let i = 0; i < namaKelasList.length; i++) {
                const urutan = i + 1;
                const namaKelas = namaKelasList[i];
                let tk = await TingkatKelasModel.findOne({ sekolahId, urutan });
                if (!tk) {
                    await TingkatKelasModel.create({ nama: namaKelas, sekolahId, urutan });
                    console.log(`   + ${sekolahNama} - ${namaKelas} (urutan ${urutan}) dibuat`);
                }
            }
        }

        // 5. PASTIKAN TINGKAT NGAJI TERSEDIA (1-6) DENGAN CHECKPOINT
        console.log("\n📖 5. Memeriksa/Membuat Tingkat Ngaji...");
        for (let urutan = 1; urutan <= 6; urutan++) {
            // tandai urutan 3 sebagai Checkpoint untuk pengujian Kenaikan Kelas Ngaji
            const isCheckpoint = urutan === 3 || urutan === 6;
            let tn = await TingkatNgajiModel.findOne({ urutan });
            if (!tn) {
                await TingkatNgajiModel.create({
                    urutan,
                    nama: `Kelas ${urutan} Ngaji`,
                    isCheckpoint
                });
                console.log(`   + Tingkat Ngaji ${urutan} (isCheckpoint: ${isCheckpoint}) dibuat`);
            } else {
                // pastikan status isCheckpoint ter-update jika urutan === 3 || urutan === 6
                if (tn.isCheckpoint !== isCheckpoint) {
                    tn.isCheckpoint = isCheckpoint;
                    await tn.save();
                    console.log(`   ✓ Tingkat Ngaji ${urutan} updated isCheckpoint = ${isCheckpoint}`);
                }
            }
        }

        // 6. SEED SANTRI KOMPLIT & ASSIGN KELAS ASAL
        console.log("\n👨‍🎓 6. Menyiapkan Santri Komplit & Kelas Santri di Tahun Ajaran Asal...");
        let countSantri = 0;
        let countKelasFormal = 0;
        let countKelasNgaji = 0;

        for (const item of listDataSantri) {
            const sekolahId = sekolahMap.get(item.sekolahNama)!;
            const kamarId = item.genderTarget === "L" ? kamarPutra._id : kamarPutri._id;

            let santri = await SantriModels.findOne({ NIK: item.nik });
            if (!santri) {
                santri = await SantriModels.findOne({ namaLengkap: item.namaLengkap });
            }

            const santriPayload = {
                nik: item.nik,
                nis: item.nis,
                namaLengkap: item.namaLengkap,
                jenisKelamin: item.jenisKelamin,
                tempatLahir: item.tempatLahir,
                tanggalLahir: item.tanggalLahir,
                fotoUrl: item.fotoUrl,
                anakKe: item.anakKe,
                jumlahSaudara: item.jumlahSaudara,
                noHp: item.noHp,
                noKk: item.noKk,
                namaKepalaKeluarga: item.namaKepalaKeluarga,
                pendidikanTerakhir: item.pendidikanTerakhir,
                ayah: item.ayah,
                ibu: item.ibu,
                alamat: item.alamat,
                sekolahId: sekolahId,
                kamarId: kamarId,
                tanggalTerdaftar: new Date("2024-07-15"),
                status: "aktif" as const,
                laundry: item.laundry
            };

            if (!santri) {
                santri = await SantriModels.create(santriPayload);
                console.log(`   + Santri created: ${santri.namaLengkap} (NIS: ${santri.nis})`);
                countSantri++;
            } else {
                // Update santri data agar fieldnya komplit
                Object.assign(santri, santriPayload);
                await santri.save();
                console.log(`   ✓ Santri updated: ${santri.namaLengkap}`);
            }

            // Cari TingkatKelas untuk sekolah ini
            const tingkatKelas = await TingkatKelasModel.findOne({
                sekolahId: sekolahId,
                urutan: item.kelasFormalUrutan
            });

            if (!tingkatKelas) {
                console.error(`❌ Tingkat Kelas urutan ${item.kelasFormalUrutan} untuk sekolah ${item.sekolahNama} tidak ditemukan!`);
                continue;
            }

            // Assign / Reset KelasSantri di Tahun Ajaran Asal (2025/2026)
            await KelasSantriModel.deleteMany({
                santriId: santri._id,
                tahunAjaranId: taAsal._id
            });

            await KelasSantriModel.create({
                santriId: santri._id,
                tahunAjaranId: taAsal._id,
                tingkatKelasId: tingkatKelas._id,
                status: item.kelasFormalStatus
            });
            countKelasFormal++;

            // Cari TingkatNgaji
            const tingkatNgaji = await TingkatNgajiModel.findOne({ urutan: item.ngajiUrutan });
            if (tingkatNgaji) {
                await RiwayatKelasNgajiModel.deleteMany({
                    santriId: santri._id,
                    tahunAjaranId: taAsal._id
                });

                await RiwayatKelasNgajiModel.create({
                    santriId: santri._id,
                    tahunAjaranId: taAsal._id,
                    tingkatNgajiId: tingkatNgaji._id
                });
                countKelasNgaji++;
            }

            // Bersihkan data di Tahun Ajaran Tujuan (2026/2027) jika ada sisa testing sebelumnya
            await KelasSantriModel.deleteMany({
                santriId: santri._id,
                tahunAjaranId: taTujuan._id
            });
            await RiwayatKelasNgajiModel.deleteMany({
                santriId: santri._id,
                tahunAjaranId: taTujuan._id
            });
        }

        console.log("\n=======================================================");
        console.log(`✅ SEEDING BERHASIL!`);
        console.log(`   - Santri diproses/di-update : ${listDataSantri.length}`);
        console.log(`   - Kelas Formal Asal (2025/2026): ${countKelasFormal} santri`);
        console.log(`   - Kelas Ngaji Asal (2025/2026) : ${countKelasNgaji} santri`);
        console.log(`   - Tahun Ajaran Asal           : ${taAsalNama} (ID: ${taAsal._id})`);
        console.log(`   - Tahun Ajaran Tujuan         : ${taTujuanNama} (ID: ${taTujuan._id})`);
        console.log("=======================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("❌ Gagal seeding santri & kelas:", err);
        process.exit(1);
    }
}

seedSantriDenganKelas();
