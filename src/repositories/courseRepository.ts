import { Course, Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateCourseRequest, CourseQueryParams, PaginationResult } from '@/types/interfaces';

export class CourseRepository {
    async create(data: CreateCourseRequest): Promise<Course> {
        return prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                difficulty: data.difficulty || 'Beginner'
            }
        });
    }

    async findById(id: string): Promise<Course | null> {
        return prisma.course.findUnique({
            where: { id },
            include: {
                enrollments: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        studentEmail: true,
                        enrolledAt: true
                    }
                }
            }
        });
    }

    async findMany(params: CourseQueryParams): Promise<PaginationResult<Course>> {
        const { difficulty, limit = 10, cursor, search, isActive } = params;

        const where: Prisma.CourseWhereInput = {
            ...(difficulty && { difficulty }),
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            })
        };
        

        const courses = await prisma.course.findMany({
            where,
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1
            }),
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });

        const hasMore = courses.length > limit;
        const data = hasMore ? courses.slice(0, -1) : courses;
        const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

        const total = await prisma.course.count({ where });

        return {
            data,
            nextCursor,
            hasMore,
            total
        };
    }

    async findAll(): Promise<Course[]> {
        return prisma.course.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        enrollments: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });
    }

    async delete(id: string): Promise<Course> {
        return prisma.course.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async hardDelete(id: string): Promise<Course> {
        return prisma.course.delete({
            where: { id }
        });
    }
}