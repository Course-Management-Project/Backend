import { Enrollment } from '@prisma/client';
import { EnrollmentRepository } from '@/repositories/enrollmentRepository';
import { CourseRepository } from '@/repositories/courseRepository';
import { UserRepository } from '@/repositories/userRepository';
import { CreateEnrollmentRequest } from '@/types/interfaces';

export class EnrollmentService {
    private enrollmentRepository: EnrollmentRepository;
    private courseRepository: CourseRepository;
    private userRepository: UserRepository;

    constructor() {
        this.enrollmentRepository = new EnrollmentRepository();
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
    }

    async createEnrollment(data: CreateEnrollmentRequest): Promise<Enrollment> {
        const course = await this.courseRepository.findById(data.courseId);
        if (!course) {
            throw new Error('Course not found');
        }
        const student = await this.userRepository.findByEmail(data.studentEmail);

        if (!student) {
            throw new Error('Student not found');
        }

        if (!course.isActive) {
            throw new Error('Course is not available for enrollment');
        }

        const existingEnrollment = await this.enrollmentRepository.findByStudentAndCourse(
            data.studentEmail,
            data.courseId
        );

        if (existingEnrollment) {
            if (existingEnrollment.isActive) {
                throw new Error('Student is already enrolled in this course');
            } else {
                return this.enrollmentRepository.update(existingEnrollment.id, { isActive: true });
            }
        }

        return this.enrollmentRepository.create(data);
    }

    async getStudentEnrollments(studentEmail: string): Promise<Enrollment[]> {
        const student = await this.userRepository.findByEmail(studentEmail);

        if (!student) {
            throw new Error('Student not found');
        }
        return this.enrollmentRepository.findByStudentEmail(studentEmail);
    }

    async getEnrollmentById(id: string): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.findById(id);
        if (!enrollment) {
            throw new Error('Enrollment not found');
        }
        return enrollment;
    }

    async unenrollStudent(studentEmail: string, courseId: string): Promise<Enrollment> {
        const enrollment = await this.enrollmentRepository.findByStudentAndCourse(
            studentEmail,
            courseId
        );

        if (!enrollment) {
            throw new Error('Enrollment not found');
        }

        if (!enrollment.isActive) {
            throw new Error('Student is not currently enrolled in this course');
        }

        return this.enrollmentRepository.update(enrollment.id, { isActive: false });
    }

    async getEnrollmentStats(): Promise<{
        totalEnrollments: number;
        activeEnrollments: number;
        enrollmentsByDifficulty: Record<string, number>;
    }> {
        return this.enrollmentRepository.getEnrollmentStats();
    }
}