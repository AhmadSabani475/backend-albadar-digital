import { Request, Response } from "express"
import * as Yup from "yup";
import userModels from "../models/user.model";
type TCreateUser = {
    username: string;
    password: string;
    nama: string;
    role: 'admin' | 'pengurus';
    is_active?: boolean;
};

const createUserValidateSchema = Yup.object({
    username: Yup.string()
        .required("Username wajib diisi")
        .min(3, "Username minimal 3 karakter"),
    password: Yup.string()
        .required("Password wajib diisi")
        .min(6, "Password minimal 6 karakter"),
    nama: Yup.string().required("Nama wajib diisi"),
    role: Yup.string()
        .oneOf(["admin", "pengurus"], "Role harus admin atau pengurus")
        .required("Role wajib diisi"),
    is_active: Yup.boolean().default(false)
})

export default {
    async createUser(req: Request, res: Response) {
        const {
            username,
            nama,
            password,
            role,
            is_active = false
        } = req.body as unknown as TCreateUser;
        try {
            await createUserValidateSchema.validate({
                username,
                password,
                nama,
                role
            })
            const result = await userModels.create({
                username,
                password,
                nama,
                role
            });
            res.status(200).json({
                message: "user berhasil dibuat",
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