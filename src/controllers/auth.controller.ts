import { Request, Response } from "express"
import * as Yup from "yup";
import userModels from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middleware/auth.middleware";
type TCreateUser = {
    username: string;
    password: string;
    nama: string;
    role: 'admin' | 'pengurus';
    is_active?: boolean;
};
type TLogin = {
    username: string;
    password: string;
}
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
                role,
                is_active
            })
            const result = await userModels.create({
                username,
                password,
                nama,
                role,
                is_active
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
    },
    async login(req: Request, res: Response) {
        const { username, password } = req.body as unknown as TLogin;
        try {
            const user = await userModels.findOne({ username: username })

            if (!user) {
                return res.status(403).json({
                    message: "User Not Found",
                    data: null
                });
            };
            const validatePassword: boolean = encrypt(password) === user.password;

            if (!validatePassword) {
                return res.status(403).json({
                    message: "User Not Found",
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
        try {
            const user = req.user;
            const result = await userModels.findById(user?.id);
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
    }
}