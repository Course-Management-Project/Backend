import Joi from 'joi';

export const createCourseSchema = Joi.object({
    title: Joi.string().min(3).max(255).required().messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters long',
        'string.max': 'Title cannot exceed 255 characters'
    }),
    description: Joi.string().min(10).required().messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 10 characters long'
    }),
    difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional()
});

export const createEnrollmentSchema = Joi.object({
    studentEmail: Joi.string().email().required().messages({
        'string.empty': 'Student email is required',
        'string.email': 'Please provide a valid email address'
    }),
    courseId: Joi.string().required().messages({
        'string.empty': 'Course ID is required'
    })
});

export const courseQuerySchema = Joi.object({
    difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    cursor: Joi.string().optional(),
    search: Joi.string().optional(),
    isActive: Joi.boolean().optional()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    })
});

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long'
    }),
    name: Joi.string().min(2).max(255).optional(),
    role: Joi.string().valid('student', 'instructor', 'admin').default('student').optional()
});