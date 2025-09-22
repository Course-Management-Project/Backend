import { Response } from 'express';
import { ApiResponse } from '@/types/interfaces';

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T,
        message = 'Success',
        statusCode = 200
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data
        };
        return res.status(statusCode).json(response);
    }

    static error(
        res: Response,
        message = 'An error occurred',
        statusCode = 500,
        error?: string,
        errors?: Record<string, string>
    ): Response {
        const response: ApiResponse = {
            success: false,
            message,
            error,
            errors
        };
        return res.status(statusCode).json(response);
    }

    static created<T>(
        res: Response,
        data: T,
        message = 'Created successfully'
    ): Response {
        return this.success(res, data, message, 201);
    }

    static badRequest(
        res: Response,
        message = 'Bad request',
        errors?: Record<string, string>
    ): Response {
        return this.error(res, message, 400, undefined, errors);
    }

    static unauthorized(
        res: Response,
        message = 'Unauthorized'
    ): Response {
        return this.error(res, message, 401);
    }

    static forbidden(
        res: Response,
        message = 'Forbidden'
    ): Response {
        return this.error(res, message, 403);
    }

    static notFound(
        res: Response,
        message = 'Not found'
    ): Response {
        return this.error(res, message, 404);
    }

    static conflict(
        res: Response,
        message = 'Conflict'
    ): Response {
        return this.error(res, message, 409);
    }

    static validationError(
        res: Response,
        errors: Record<string, string>,
        message = 'Validation error'
    ): Response {
        return this.error(res, message, 400, undefined, errors);
    }
}