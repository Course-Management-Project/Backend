import { Request, Response, NextFunction } from 'express';
import {
    PrismaClientKnownRequestError,
    PrismaClientValidationError
} from '@prisma/client/runtime/library';
import { ResponseUtil } from '@/utils/response';

export const errorHandler = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return ResponseUtil.conflict(res, 'A record with this data already exists');
            case 'P2025':
                return ResponseUtil.notFound(res, 'Record not found');
            case 'P2003':
                return ResponseUtil.badRequest(res, 'Foreign key constraint failed');
            default:
                return ResponseUtil.error(res, 'Database operation failed', 500);
        }
    }

    if (error instanceof PrismaClientValidationError) {
        return ResponseUtil.badRequest(res, 'Invalid data provided');
    }

    if (error.name === 'JsonWebTokenError') {
        return ResponseUtil.unauthorized(res, 'Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
        return ResponseUtil.unauthorized(res, 'Token expired');
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    return ResponseUtil.error(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response) => {
    return ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};