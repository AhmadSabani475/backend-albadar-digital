import { Types } from "mongoose"
import { User } from "../types/User"
import jwt from "jsonwebtoken"
import { SECRET } from "./env"
export interface IUserToken extends Omit<User,
    "username" | "password" | "nama" | "is_active"> {
    id?: Types.ObjectId
}

export const generateToken = (user: IUserToken): string => {
    const token = jwt.sign(user, SECRET, {
        expiresIn: '1h'
    })
    return token;
}
export const getUserData = (token: string): IUserToken | null => {
    try {
        const user = jwt.verify(token, SECRET) as IUserToken;
        return user;
    } catch (error) {
        return null;
    }
}