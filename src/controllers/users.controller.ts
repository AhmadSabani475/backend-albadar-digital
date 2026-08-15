import * as Yup from "yup";
import { Request, Response } from "express";
import userModels from "../models/user.model";
import SantriModels from "../models/santri.models";
type TCreateUser = {
    username: string;
    role: 'admin' | 'pengurus';
    santriId?: string;
};

const createUserValidateSchema = Yup.object({
    username: Yup.string()
        .required("Username wajib diisi")
        .min(3, "Username minimal 3 karakter"),
    role: Yup.string()
        .oneOf(["admin", "pengurus"], "Role harus admin atau pengurus")
        .required("Role wajib diisi"),
    santriId: Yup.string().optional()
})

function generateDefaultPassword(username: string): string {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
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
            role,
            santriId
        } = req.body as unknown as TCreateUser;
        try {
            await createUserValidateSchema.validate({
                username,
                role,
                santriId
            })
            const existingUser = await userModels.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: "Username sudah dipakai",
                    data: null
                })
            }
            if (santriId) {
                const santri = await SantriModels.findById(santriId);
                if (!santri) {
                    return res.status(404).json({
                        message: "Santri Not Found",
                        data: null
                    })
                }
                const cekSantri = await userModels.findOne({ santriId });
                if (cekSantri) {
                    return res.status(400).json({
                        message: "Santri Sudah Tertaut",
                        data: null
                    })
                }
            }
            const generatedPassword = generateDefaultPassword(username);

            const result = await userModels.create({
                username,
                password: generatedPassword,
                role,
                santriId: santriId ?? null,
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
    },
    async deleteUserById(req: Request, res: Response) {
        /**
    #swagger.tags = ['Users']
    #swagger.summary = 'Hapus User'
    #swagger.security = [{ "bearerAuth": [] }]
       #swagger.parameters['id'] = {
       in: 'path',
       required: true,
       type: 'string',
       description: 'ID santri (MongoDB ObjectId)'
   }
   */
        try {
            const {id} = req.params;
            const user = await userModels.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({
                    message: "User Not Found",
                    success: false
                })
            }
            return res.status(200).json({
                message: "User Deleted",
                success: true
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                success: false
            })
        }
    }
}       