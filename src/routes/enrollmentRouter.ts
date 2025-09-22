import { Router } from 'express';
import { EnrollmentController } from '@/controllers/enrollmentController';
import { validate } from '@/middleware/validation';
import { authenticate, authorize } from '@/middleware/auth';
import { createEnrollmentSchema } from '@/utils/validation';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post(
    '/',
    authenticate,
    validate(createEnrollmentSchema),
    enrollmentController.createEnrollment
);

router.get(
    '/student/:email',
    authenticate,
    enrollmentController.getStudentEnrollments
);

router.delete(
    '/',
    authenticate,
    validate(createEnrollmentSchema),
    enrollmentController.unenrollStudent
);

router.get(
    '/stats/overview',
    authenticate,
    authorize(['admin']),
    enrollmentController.getEnrollmentStats
);

router.get(
    '/:id',
    authenticate,
    enrollmentController.getEnrollmentById
);

export default router;