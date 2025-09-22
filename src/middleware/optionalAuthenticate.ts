import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '@/utils/jwt';

export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): any => {
    try {
        const token = JWTUtil.extractTokenFromHeader(req.headers.authorization);

        if (token) {
            const decoded = JWTUtil.verifyToken(token);
            req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        }
    } catch (error) {
        console.warn('Invalid token provided, skipping auth');
    }

    next();
};
