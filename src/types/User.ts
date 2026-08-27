import { Types } from "mongoose";
import { Santri } from "./Santri";

export interface User {
    username: string;
    password: string;
    santriId?: Santri; 
    role: 'admin' | 'pengurus';
    is_active: boolean;
}