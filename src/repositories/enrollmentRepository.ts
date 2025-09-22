import { Enrollment } from '@prisma/client';
import { prisma } from '@/config/database';
import { CreateEnrollmentRequest } from '@/types/interfaces';

export class EnrollmentRepository {
    async create(data: CreateEnrollmentRequest): Promise<Enrollment> {
        return prisma.enrollment.create({
            data: {
                studentEmail: data.studentEmail,
                courseId: data.courseId
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        difficulty: true
                    }
                }
            }
        });
    }

    async findByStudentEmail(studentEmail: string): Promise<Enrollment[]> {
        return prisma.enrollment.findMany({
            where: {
                studentEmail,
                isActive: true
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        difficulty: true,
                        isActive: true
                    }
                }
            },
            orderBy: { enrolledAt: 'desc' }
        });
    }

    async findById(id: string): Promise<Enrollment | null> {
        return prisma.enrollment.findUnique({
            where: { id },
            include: {
                course: true
            }
        });
    }

    async findByStudentAndCourse(studentEmail: string, courseId: string): Promise<Enrollment | null> {
        return prisma.enrollment.findUnique({
            where: {
                studentEmail_courseId: {
                    studentEmail,
                    courseId
                }
            },
            include: {
                course: true
            }
        });
    }

    async update(id: string, data: Partial<Pick<Enrollment, 'isActive'>>): Promise<Enrollment> {
        return prisma.enrollment.update({
            where: { id },
            data,
            include: {
                course: true
            }
        });
    }

    async delete(id: string): Promise<Enrollment> {
        return prisma.enrollment.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async hardDelete(id: string): Promise<Enrollment> {
        return prisma.enrollment.delete({
            where: { id }
        });
    }

    async getEnrollmentStats(): Promise<{
        totalEnrollments: number;
        activeEnrollments: number;
        enrollmentsByDifficulty: Record<string, number>;
    }> {
        const totalEnrollments = await prisma.enrollment.count();
        const activeEnrollments = await prisma.enrollment.count({
            where: { isActive: true }
        });

        const enrollmentsByDifficulty = await prisma.enrollment.groupBy({
            by: ['courseId'],
            where: { isActive: true },
            _count: true
        });

        const difficultyStats: Record<string, number> = {};

        for (const enrollment of enrollmentsByDifficulty) {
            const course = await prisma.course.findUnique({
                where: { id: enrollment.courseId },
                select: { difficulty: true }
            });

            if (course) {
                difficultyStats[course.difficulty] = (difficultyStats[course.difficulty] || 0) + enrollment._count;
            }
        }

        return {
            totalEnrollments,
            activeEnrollments,
            enrollmentsByDifficulty: difficultyStats
        };
    }
}