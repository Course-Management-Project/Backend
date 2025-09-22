import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '@/services/enrollmentService';
import { ResponseUtil } from '@/utils/response';
import { CreateEnrollmentRequest } from '@/types/interfaces';

export class EnrollmentController {
    private enrollmentService: EnrollmentService;

    constructor() {
        this.enrollmentService = new EnrollmentService();
    }

    createEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const enrollmentData: CreateEnrollmentRequest = req.body;
            const enrollment = await this.enrollmentService.createEnrollment(enrollmentData);

            return ResponseUtil.created(res, enrollment, 'Enrollment created successfully');
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Course not found') {
                    return ResponseUtil.notFound(res, 'Course not found');
                }
                if (error.message === 'Course is not available for enrollment') {
                    return ResponseUtil.badRequest(res, 'Course is not available for enrollment');
                }
                if (error.message === 'Student is already enrolled in this course') {
                    return ResponseUtil.conflict(res, 'Student is already enrolled in this course');
                }
            }
            next(error);
        }
    };

    getStudentEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { email } = req.params;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return ResponseUtil.badRequest(res, 'Invalid email format');
            }

            const enrollments = await this.enrollmentService.getStudentEnrollments(email);

            return ResponseUtil.success(
                res,
                enrollments,
                `Enrollments for ${email} retrieved successfully`
            );
        } catch (error) {
            next(error);
        }
    };

    getEnrollmentById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const enrollment = await this.enrollmentService.getEnrollmentById(id);

            return ResponseUtil.success(res, enrollment, 'Enrollment retrieved successfully');
        } catch (error) {
            if (error instanceof Error && error.message === 'Enrollment not found') {
                return ResponseUtil.notFound(res, 'Enrollment not found');
            }
            next(error);
        }
    };

    unenrollStudent = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { studentEmail, courseId } = req.body;

            const enrollment = await this.enrollmentService.unenrollStudent(studentEmail, courseId);

            return ResponseUtil.success(res, enrollment, 'Student unenrolled successfully');
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Enrollment not found') {
                    return ResponseUtil.notFound(res, 'Enrollment not found');
                }
                if (error.message === 'Student is not currently enrolled in this course') {
                    return ResponseUtil.badRequest(res, 'Student is not currently enrolled in this course');
                }
            }
            next(error);
        }
    };

    getEnrollmentStats = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const stats = await this.enrollmentService.getEnrollmentStats();

            return ResponseUtil.success(res, stats, 'Enrollment statistics retrieved successfully');
        } catch (error) {
            next(error);
        }
    };
}