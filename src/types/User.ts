import { Types } from "mongoose";
import { Santri } from "./Santri";

export interface User {
    username: string;
    password: string;
    santriId?: Santri; 
    role: 'admin' | 'bendahara';
    is_active: boolean;
}