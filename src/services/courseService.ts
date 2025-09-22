import { Course } from '@prisma/client';
import { CourseRepository } from '@/repositories/courseRepository';
import { CreateCourseRequest, CourseQueryParams, PaginationResult } from '@/types/interfaces';

export class CourseService {
    private courseRepository: CourseRepository;

    constructor() {
        this.courseRepository = new CourseRepository();
    }

    async createCourse(data: CreateCourseRequest): Promise<Course> {
        return this.courseRepository.create(data);
    }

    async getCourseById(id: string): Promise<Course> {
        const course = await this.courseRepository.findById(id);
        if (!course) {
            throw new Error('Course not found');
        }
        return course;
    }

    async getCourses(params: CourseQueryParams): Promise<PaginationResult<Course>> {
        return this.courseRepository.findMany(params);
    }

    async getAllActiveCourses(): Promise<Course[]> {
        return this.courseRepository.findAll();
    }

    async searchCourses(searchTerm: CourseQueryParams): Promise<Course[]> {
        const params: CourseQueryParams = {
            search: searchTerm.search,
            // isActive: true,
            limit: 50,
            ...(searchTerm.difficulty && {
                difficulty: searchTerm.difficulty
            }),
            ...(searchTerm.isActive !== undefined && { isActive: searchTerm.isActive })
        };

        const result = await this.courseRepository.findMany(params);
        return result.data;
    }

    async deleteCourse(id: string): Promise<Course> {
        const course = await this.getCourseById(id);
        if (!course) {
            throw new Error('Course not found');
        }
        if (course.isActive === false) {
            return this.courseRepository.hardDelete(id);
        }

        return this.courseRepository.delete(id);
    }
}