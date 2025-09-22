import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '@/types/interfaces';

export class JWTUtil {
    private static readonly secret = process.env.JWT_SECRET || 'fallback-secret';
    private static readonly expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

    static generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }

    static verifyToken(token: string): JwtPayload {
        return jwt.verify(token, this.secret) as JwtPayload;
    }

    static extractTokenFromHeader(authHeader?: string): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
}