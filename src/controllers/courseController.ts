import { Request, Response, NextFunction } from 'express';
import { CourseService } from '@/services/courseService';
import { ResponseUtil } from '@/utils/response';
import { CreateCourseRequest, CourseQueryParams } from '@/types/interfaces';

export class CourseController {
    private courseService: CourseService;

    constructor() {
        this.courseService = new CourseService();
    }

    createCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const courseData: CreateCourseRequest = req.body;
            const course = await this.courseService.createCourse(courseData);

            return ResponseUtil.created(res, course, 'Course created successfully');
        } catch (error) {
            next(error);
        }
    };

    getCourses = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const queryParams: CourseQueryParams = req.query;
            const role = (req.user as any)?.role;
            

            if (Object.keys(queryParams).length === 0) {
                const courses = await this.courseService.getAllActiveCourses();

                return ResponseUtil.success(res, courses, 'Courses retrieved successfully');
            }
            if (!role || role === 'student') {
                queryParams.isActive = true;
            }

            const result = await this.courseService.getCourses(queryParams);
            return ResponseUtil.success(res, result, 'Courses retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const course = await this.courseService.getCourseById(id);

            return ResponseUtil.success(res, course, 'Course retrieved successfully');
        } catch (error) {
            if (error instanceof Error && error.message === 'Course not found') {
                return ResponseUtil.notFound(res, 'Course not found');
            }
            next(error);
        }
    };

    searchCourses = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { q, difficulty } = req.query;
            const role = (req.user as any)?.role;

            if (!q || typeof q !== 'string') {
                return ResponseUtil.badRequest(res, 'Search query is required');
            }

            const params: CourseQueryParams = {
                search: q as string || '',
                isActive: true,
                limit: 50,
                ...(difficulty && typeof difficulty === 'string' && {
                    difficulty: difficulty as 'Beginner' | 'Intermediate' | 'Advanced',
                }),
            };

            if (!role || role === 'student') {
                params.isActive = true;
            }

            const courses = await this.courseService.searchCourses(params);

            return ResponseUtil.success(res, courses, 'Search results retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const { id } = req.params;
            const course = await this.courseService.deleteCourse(id);

            return ResponseUtil.success(res, course, 'Course deleted successfully');
        } catch (error) {
            if (error instanceof Error && error.message === 'Course not found') {
                return ResponseUtil.notFound(res, 'Course not found');
            }
            next(error);
        }
    };
}