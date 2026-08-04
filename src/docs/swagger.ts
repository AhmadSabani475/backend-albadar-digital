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
                username: "ahmadsabani",
                password: "ahmad1234"
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
                    sekolah: "SMP Negeri 1 Bandung",
                    kamarId: "6a70b8c24a9e37be1b9ee040"
                }
            }
        }
    }
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];


swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);