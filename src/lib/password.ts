
import { hash, compare } from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!hash) return false;
    return compare(password, hash);
}
