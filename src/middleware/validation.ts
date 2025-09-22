import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';
import { ResponseUtil } from '@/utils/response';

export const validate = (schema: Joi.ObjectSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): any => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors: Record<string, string> = {};
            error.details.forEach((detail) => {
                const key = detail.path.join('.');
                errors[key] = detail.message;
            });

            return ResponseUtil.validationError(res, errors);
        }

        next();
    };
};

export const validateQuery = (schema: Joi.ObjectSchema): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): any => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });

        if (error) {
            const errors: Record<string, string> = {};
            error.details.forEach((detail) => {
                const key = detail.path.join('.');
                errors[key] = detail.message;
            });

            return ResponseUtil.validationError(res, errors);
        }

        req.query = value;
        next();
    };
};