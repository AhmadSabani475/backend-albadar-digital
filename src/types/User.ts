export interface User {
    username: string;
    password: string;
    nama: string;
    role: 'admin' | 'pengurus';
    is_active: boolean;
}