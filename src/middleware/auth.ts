import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '@/utils/jwt';
import { ResponseUtil } from '@/utils/response';

export const authenticate = (req: Request, res: Response, next: NextFunction): any => {
    try {
        const token = JWTUtil.extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return ResponseUtil.unauthorized(res, 'Access token is required');
        }

        const decoded = JWTUtil.verifyToken(token);

        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

        next();
    } catch (error) {
        return ResponseUtil.unauthorized(res, 'Invalid or expired token');
    }
};

export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): any => {
        if (!req.user) {
            return ResponseUtil.unauthorized(res, 'Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            return ResponseUtil.forbidden(res, 'User does not have permission');
        }

        next();
    };
};