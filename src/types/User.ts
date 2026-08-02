import { Types } from "mongoose";

export interface User {
    username: string;
    password: string;
    santriId?: Types.ObjectId; 
    role: 'admin' | 'pengurus';
    is_active: boolean;
}