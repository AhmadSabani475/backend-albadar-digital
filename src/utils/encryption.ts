import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const encrypt = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
}