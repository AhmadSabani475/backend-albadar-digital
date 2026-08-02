import { Response, NextFunction } from "express";
import { IReqUser } from "./auth.middleware";

export const checkRole = (allowedRoles: string[]) => {
    return (req: IReqUser, res: Response, next: NextFunction) => {
        const role = req.user?.role;

        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({
                message: "Kamu tidak punya akses untuk melakukan ini",
                data: null
            });
        }

        next();
    }
}