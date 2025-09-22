import { CourseService } from '../../src/services/courseService';
import { CourseRepository } from '../../src/repositories/courseRepository';
import { prisma } from '../setup';

jest.mock('../../src/repositories/courseRepository');

describe('CourseService', () => {
    let courseService: CourseService;
    let mockCourseRepository: jest.Mocked<CourseRepository>;

    beforeEach(() => {
        mockCourseRepository = new CourseRepository() as jest.Mocked<CourseRepository>;
        courseService = new CourseService();
        (courseService as any).courseRepository = mockCourseRepository;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCourse', () => {
        it('should create a course successfully', async () => {
            const courseData = {
                title: 'Test Course',
                description: 'Test Description',
                difficulty: 'Beginner' as const
            };

            const mockCourse = {
                id: '1',
                ...courseData,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            mockCourseRepository.create.mockResolvedValue(mockCourse);

            const result = await courseService.createCourse(courseData);

            expect(mockCourseRepository.create).toHaveBeenCalledWith(courseData);
            expect(result).toEqual(mockCourse);
        });
    });

    describe('getCourseById', () => {
        it('should return course when found', async () => {
            const mockCourse = {
                id: '1',
                title: 'Test Course',
                description: 'Test Description',
                difficulty: 'Beginner',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                enrollments: []
            };

            mockCourseRepository.findById.mockResolvedValue(mockCourse);

            const result = await courseService.getCourseById('1');

            expect(mockCourseRepository.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockCourse);
        });

        it('should throw error when course not found', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            await expect(courseService.getCourseById('nonexistent')).rejects.toThrow('Course not found');
        });
    });

    describe('searchCourses', () => {
        it('should search courses with given term', async () => {
            const mockResult = {
                data: [{
                    id: '1',
                    title: 'JavaScript Course',
                    description: 'Learn JavaScript',
                    difficulty: 'Beginner',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }],
                nextCursor: undefined,
                hasMore: false,
                total: 1
            };

            mockCourseRepository.findMany.mockResolvedValue(mockResult);

            const result = await courseService.searchCourses({ search: 'JavaScript'});

            expect(mockCourseRepository.findMany).toHaveBeenCalledWith({
                search: 'JavaScript',
                limit: 50
            });
            expect(result).toEqual(mockResult.data);
        });
    });
});
