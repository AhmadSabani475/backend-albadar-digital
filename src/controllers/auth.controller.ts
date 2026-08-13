import { Request, Response } from "express"
import userModels from "../models/user.model";
import { comparePassword, encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middleware/auth.middleware";
import { completeProfileValidateSchema, TCompleteProfile } from "./santri.controller";
import KamarModels from "../models/kamar.models";
import SantriModels from "../models/santri.models";

type TLogin = {
    username: string;
    password: string;
}

export default {
    async login(req: Request, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.summary = 'Login'
         #swagger.description = 'Login dengan username dan password, mengembalikan JWT token. Boleh dipanggil walau is_active masih false.'
         #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: "#/components/schemas/LoginRequest" }
                }
            }
         }
        */
        const { username, password } = req.body as unknown as TLogin;
        try {
            const user = await userModels.findOne({ username: username })

            if (!user) {
                return res.status(403).json({
                    message: "User Not Found",
                    data: null
                });
            };
            const validatePassword: boolean = await comparePassword(password, user.password);

            if (!validatePassword) {
                return res.status(403).json({
                    message: "Debug: Password salah / Hash tidak cocok",
                    data: null
                });
            }
            const token = generateToken({
                id: user._id,
                role: user.role
            })
            return res.status(200).json({
                message: 'login success',
                data: token
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async me(req: IReqUser, res: Response) {
        /**
         #swagger.tags = ['Auth']
         #swagger.summary = 'Ambil data user yang sedang login'
         #swagger.description = 'Mengembalikan data user beserta data santri terkait (jika sudah complete-profile)'
         #swagger.security = [{ "bearerAuth": [] }]
        */
        try {
            const user = req.user;
            const result = await userModels.findById(user?.id).populate('santriId');
            res.status(200).json({
                message: 'Success get User',
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async completeProfile(req: IReqUser, res: Response) {
        /**
        #swagger.tags = ['Auth']
        #swagger.summary = 'Lengkapi profil saat first login'
        #swagger.description = 'Dipanggil oleh pengurus yang is_active masih false. Sekaligus reset password, isi data santri, dan assign kamar.'
        #swagger.security = [{ "bearerAuth": [] }]
        #swagger.requestBody = {
           required: true,
           content: {
               "application/json": {
                   schema: { $ref: "#/components/schemas/CompleteProfileRequest" }
               }
           }
        }
       */
        const { password, santri } = req.body as unknown as TCompleteProfile;
        try {
            await completeProfileValidateSchema.validate({ password, santri });

            const kamar = await KamarModels.findById(santri.kamarId);
            if (!kamar) {
                return res.status(404).json({
                    message: "Kamar tidak ditemukan",
                    data: null
                })
            }

            const jumlahSantriDiKamar = await SantriModels.countDocuments({ kamarId: santri.kamarId });
            if (jumlahSantriDiKamar >= kamar.kapasitas) {
                return res.status(400).json({
                    message: "Kamar Sudah Penuh",
                    data: null
                })
            }

            const santriBaru = await SantriModels.create({
                ...santri,
                tanggalTerdaftar: new Date(),
                status: 'aktif'
            })

            const user = await userModels.findById(req.user?.id);
            if (!user) {
                return res.status(404).json({
                    message: "User tidak ditemukan",
                    data: null
                })
            }

            user.password = password;
            user.santriId = santriBaru._id;
            user.is_active = true;
            await user.save();

            res.status(200).json({
                message: "Profil berhasil dilengkapi",
                data: user
            });

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    }
}