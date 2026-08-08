import * as Yup from "yup";
import { Request, Response } from "express";
import userModels from "../models/user.model";
type TCreateUser = {
    username: string;
    role: 'admin' | 'pengurus';
};

const createUserValidateSchema = Yup.object({
    username: Yup.string()
        .required("Username wajib diisi")
        .min(3, "Username minimal 3 karakter"),
    role: Yup.string()
        .oneOf(["admin", "pengurus"], "Role harus admin atau pengurus")
        .required("Role wajib diisi")
})

function generateDefaultPassword(username: string): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 digit acak
    return `${username}${randomDigits}`;
}
export default {
    async createUser(req: Request, res: Response) {
        /**
          #swagger.tags = ['Users']
          #swagger.summary = 'Buat akun pengurus baru (khusus admin)'
          #swagger.description = 'Admin membuat kredensial awal untuk pengurus. is_active otomatis false, wajib complete-profile saat login pertama.'
          #swagger.security = [{ "bearerAuth": [] }]
          #swagger.requestBody = {
             required: true,
             content: {
                 "application/json": {
                     schema: {
                         type: "object",
                         properties: {
                             username: { type: "string", example: "pengurus01" },
                             role: { type: "string", enum: ["admin", "pengurus"], example: "pengurus" }
                         }
                     }
                 }
             }
          }
             */
        const {
            username,
            role
        } = req.body as unknown as TCreateUser;
        try {
            await createUserValidateSchema.validate({
                username,
                role,
            })
            const existingUser = await userModels.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: "Username sudah dipakai",
                    data: null
                })
            }

            const generatedPassword = generateDefaultPassword(username);

            const result = await userModels.create({
                username,
                password: generatedPassword,
                role,
                is_active: false
            });
            res.status(201).json({
                message: "user berhasil dibuat",
                data: {
                    ...result.toJSON(),
                    generatedPassword
                }
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    },
    async getAllUsers(req: Request, res: Response) {
        /**
    #swagger.tags = ['Users']
    #swagger.summary = 'Ambil semua data user (khusus admin)'
    #swagger.security = [{ "bearerAuth": [] }]
   */
        try {
            const result = await userModels.find().populate('santriId');
            return res.status(200).json({
                message: "Get Users Success",
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            })
        }
    }
}