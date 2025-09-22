import { Router } from 'express';
import { CourseController } from '@/controllers/courseController';
import { validate, validateQuery } from '@/middleware/validation';
import { authenticate, authorize } from '@/middleware/auth';
import { createCourseSchema, courseQuerySchema } from '@/utils/validation';
import { optionalAuthenticate } from '@/middleware/optionalAuthenticate';

const router = Router();
const courseController = new CourseController();

router.get('/', optionalAuthenticate, validateQuery(courseQuerySchema), courseController.getCourses);
router.get('/search', courseController.searchCourses);
router.get('/:id', courseController.getCourseById);

router.post(
    '/',
    authenticate,
    authorize(['admin']),
    validate(createCourseSchema),
    courseController.createCourse
);
router.delete(
    '/:id',
    authenticate,
    authorize(['admin']),
    courseController.deleteCourse
);

export default router;