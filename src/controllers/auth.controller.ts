import { Request, Response } from "express"
import userModels from "../models/user.model";
import { comparePassword, encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middleware/auth.middleware";


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
    async setPassword(req: IReqUser, res: Response) {
        /**
   #swagger.tags = ['Auth']
   #swagger.summary = 'Set password pertama kali'
   #swagger.description = 'Dipanggil pengurus yang is_active masih false untuk mengganti password default dan mengaktifkan akun.'
   #swagger.security = [{ "bearerAuth": [] }]
   #swagger.requestBody = {
      required: true,
      content: {
          "application/json": {
              schema: {
                  type: "object",
                  properties: {
                      password: { type: "string", example: "passwordbaru123" }
                  }
              }
          }
      }
   }
  */
        const { password } = req.body as unknown as { password: string };
        try {
            if (!password || password.length < 6) {
                return res.status(400).json({
                    message: "Password minimal 6 karakter",
                    data: null
                })
            }
            const user = await userModels.findById(req.user?.id);
            if (!user) {
                return res.status(404).json({
                    message: "User tidak ditemukan",
                    data: null
                })
            }

            user.password = password;
            user.is_active = true;
            await user.save();
            res.status(200).json({
                message: "Reset Password Berhasil",
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