import { Request, Response } from "express"
import * as Yup from "yup";
import userModels from "../models/user.model";
import { comparePassword, encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middleware/auth.middleware";
type TCreateUser = {
    username: string;
    password: string;
    role: 'admin' | 'pengurus';
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
    role: Yup.string()
        .oneOf(["admin", "pengurus"], "Role harus admin atau pengurus")
        .required("Role wajib diisi")
})

export default {
    async createUser(req: Request, res: Response) {
        /**
         #swagger.security = [{
            "bearerAuth" : []
        }]
        */
        const {
            username,
            password,
            role
        } = req.body as unknown as TCreateUser;
        try {
            await createUserValidateSchema.validate({
                username,
                password,
                role,
            })
            const existingUser = await userModels.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    message: "Username sudah dipakai",
                    data: null
                })
            }
            const result = await userModels.create({
                username,
                password,
                role,
                is_active: false
            });
            res.status(201).json({
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
        /**
         #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#components/schemas/LoginRequest"
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
            const validatePassword: boolean = await comparePassword(password,user.password);

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
        /**
         #swagger.security = [{
            "bearerAuth" : []
         }]
         */
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