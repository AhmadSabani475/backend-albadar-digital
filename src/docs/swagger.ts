import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        version: "v0.0.1",
        title: "Dokumentasi Al-Badar Digital",
        description: "Dokumentasi Al-Badar Digital"
    },
    servers: [
        {
            url: "http://localhost:3000/api",
            description: "Local Server"
        },
        {
            url: "https://backend-albadar-digital.vercel.app/api",
            description: "Deploy Server"
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer"
            }
        },
        schemas: {
            LoginRequest: {
                username: "sabani",
                password: "sabani12345"
            },
            CompleteProfileRequest: {
                password: "passwordBaru123",
                santri: {
                    nis: "12345",
                    namaLengkap: "Ahmad Fauzi",
                    tempatLahir: "Bandung",
                    tanggalLahir: "2010-05-14",
                    anakKe: 1,
                    jumlahSaudara: 2,
                    asalPesantren: "",
                    pendidikanTerakhir: "SD",
                    ayah: {
                        nama: "Bapak Fauzi",
                        pendidikan: "S1",
                        pekerjaan: "Wiraswasta"
                    },
                    ibu: {
                        nama: "Ibu Fauzi",
                        pendidikan: "SMA",
                        pekerjaan: "Ibu Rumah Tangga"
                    },
                    alamat: {
                        jalan: "Jl. Merdeka No. 10",
                        rtRw: "01/02",
                        desaKelurahan: "Sukamaju",
                        kecamatan: "Cibeunying",
                        kabupatenKota: "Bandung",
                        provinsi: "Jawa Barat",
                        noTelepon: "081234567890"
                    },
                    sekolahId: "6a70b8c24a9e37be1b9ee041",
                    kamarId: "6a70b8c24a9e37be1b9ee040",
                    laundry: false
                }
            },
            CreateSantriRequest: {
                nik: "3201012345678900",
                nis: "12345",
                namaLengkap: "Ahmad Fauzi",
                jenisKelamin: "L",
                tempatLahir: "Bandung",
                tanggalLahir: "2010-05-14",
                fotoUrl: "https://example.com/foto.jpg",
                anakKe: 1,
                jumlahSaudara: 2,
                noHp: "081234567890",
                noKk: "3201012345678911",
                namaKepalaKeluarga: "Bapak Fauzi",
                pendidikanTerakhir: {
                    jenjangTerakhir: "SD",
                    namaSekolah: "SDN 1 Bandung",
                    tahunMasuk: "2016",
                    tahunLulus: "2022"
                },
                ayah: {
                    nik: "3201011111111111",
                    statusHidup: "Hidup",
                    nama: "Bapak Fauzi",
                    pendidikan: "S1",
                    pekerjaan: "Wiraswasta",
                    noHp: "08111222333"
                },
                ibu: {
                    nik: "3201012222222222",
                    statusHidup: "Hidup",
                    nama: "Ibu Fauzi",
                    pendidikan: "SMA",
                    pekerjaan: "Ibu Rumah Tangga",
                    noHp: "08222333444"
                },
                alamat: {
                    jalan: "Jl. Merdeka No. 10",
                    rtRw: "01/02",
                    kodeDesaKelurahan: "3273011001",
                    desaKelurahan: "Sukamaju",
                    kodeKecamatan: "327301",
                    kecamatan: "Cibeunying",
                    kodeKabupatenKota: "3273",
                    kabupatenKota: "Bandung",
                    kodeProvinsi: "32",
                    provinsi: "Jawa Barat",
                    kodePos: "40111"
                },
                sekolahId: "6a70b8c24a9e37be1b9ee041",
                kamarId: "6a70b8c24a9e37be1b9ee040",
                laundry: false
            }
        }
    }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);