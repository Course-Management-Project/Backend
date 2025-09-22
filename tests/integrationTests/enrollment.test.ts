import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';

describe('Enrollment Endpoints', () => {
    let adminToken: string;
    let studentToken: string;
    let adminUser: any;
    let studentUser: any;
    let sampleCourse: any;
    let sampleCourse2: any;

    beforeAll(async () => {
        await prisma.user.deleteMany();

        const timestamp = Date.now();
        const adminData = {
            email: `admin${timestamp}@test.com`,
            password: 'admin123',
            name: 'Admin User',
            role: 'admin'
        };

        const studentData = {
            email: `student${timestamp}@test.com`,
            password: 'student123',
            name: 'Student User',
            role: 'student'
        };

        const adminResponse = await request(app).post('/api/auth/register').send(adminData);
        const studentResponse = await request(app).post('/api/auth/register').send(studentData);

        await prisma.user.findMany().then(users => console.log('All users in DB after registration:', users));
        if (!adminResponse.body.success) {
            console.error('Admin registration failed:', adminResponse.body);
        }
        if (!studentResponse.body.success) {
            console.error('Student registration failed:', studentResponse.body);
        }

        if (adminResponse.body.message === 'A record with this data already exists') {
            const loginResponse = await request(app).post('/api/auth/login').send({
                email: adminData.email,
                password: adminData.password
            });
            adminToken = loginResponse.body.data.token;
            adminUser = loginResponse.body.data.user;
        } else {
            adminToken = adminResponse.body.data.token;
            adminUser = adminResponse.body.data.user;
        }

        if (studentResponse.body.message === 'A record with this data already exists') {
            const loginResponse = await request(app).post('/api/auth/login').send({
                email: studentData.email,
                password: studentData.password
            });
            studentToken = loginResponse.body.data.token;
            studentUser = loginResponse.body.data.user;
        } else {
            studentToken = studentResponse.body.data.token;
            studentUser = studentResponse.body.data.user;
        }
    });

    beforeEach(async () => {
        await prisma.enrollment.deleteMany();
        await prisma.course.deleteMany();

        [sampleCourse, sampleCourse2] = await Promise.all([
            prisma.course.create({
                data: {
                    title: 'JavaScript Fundamentals',
                    description: 'Learn the basics of JavaScript programming',
                    difficulty: 'Beginner',
                    isActive: true
                }
            }),
            prisma.course.create({
                data: {
                    title: 'Advanced React',
                    description: 'Master React development with hooks and context',
                    difficulty: 'Advanced',
                    isActive: true
                }
            })
        ]);
    });

    afterAll(async () => {
        await prisma.enrollment.deleteMany();
        await prisma.course.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('POST /api/enrollments', () => {
        it('should create enrollment successfully', async () => {

            const studentExists = await prisma.user.findUnique({
                where: { email: studentUser.email }
            });

            if (!studentExists) {
                throw new Error(`Student ${studentUser.email} not found in database`);
            }
            await prisma.user.findMany().then(users => console.log('All users in DB:', users));

            const enrollmentData = {
                studentEmail: studentUser.email,
                courseId: sampleCourse.id
            };


            const response = await request(app)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(enrollmentData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Enrollment created successfully',
                data: {
                    studentEmail: studentUser.email,
                    courseId: sampleCourse.id,
                    isActive: true
                }
            });

            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    studentEmail_courseId: {
                        studentEmail: studentUser.email,
                        courseId: sampleCourse.id
                    }
                }
            });
            expect(enrollment).toBeTruthy();
        });

        it('should reject enrollment in non-existent course', async () => {
            const nonExistentCourseId = 'clxxxxxxxxxxxxxxxxxxxx';

            const enrollmentData = {
                studentEmail: studentUser.email,
                courseId: nonExistentCourseId
            };

            const response = await request(app)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(enrollmentData)
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Course not found'
            });
        });

        it('should prevent duplicate enrollments', async () => {
            const enrollmentData = {
                studentEmail: studentUser.email,
                courseId: sampleCourse.id
            };

            await request(app)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(enrollmentData)
                .expect(201);

            const response = await request(app)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(enrollmentData)
                .expect(409);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Student is already enrolled in this course'
            });
        });

        it('should validate enrollment data', async () => {
            const invalidData = {
                studentEmail: 'invalid-email',
                courseId: ''
            };

            const response = await request(app)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(invalidData)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Validation error'
            });
        });
    });

    describe('GET /api/enrollments/student/:email', () => {
        beforeEach(async () => {
            await Promise.all([
                prisma.enrollment.create({
                    data: {
                        studentEmail: studentUser.email,
                        courseId: sampleCourse.id,
                        isActive: true
                    }
                }),
                prisma.enrollment.create({
                    data: {
                        studentEmail: studentUser.email,
                        courseId: sampleCourse2.id,
                        isActive: true
                    }
                })
            ]);
        });

        it('should get student enrollments successfully', async () => {
            const response = await request(app)
                .get(`/api/enrollments/student/${studentUser.email}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: `Enrollments for ${studentUser.email} retrieved successfully`,
                data: expect.any(Array)
            });

            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toMatchObject({
                studentEmail: studentUser.email,
                isActive: true
            });
        });

        it('should validate email format', async () => {
            const response = await request(app)
                .get('/api/enrollments/student/invalid-email')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email format'
            });
        });
    });

    describe('GET /api/enrollments/stats/overview', () => {
        beforeEach(async () => {
            await Promise.all([
                prisma.enrollment.create({
                    data: {
                        studentEmail: studentUser.email,
                        courseId: sampleCourse.id,
                        isActive: true
                    }
                }),
                prisma.enrollment.create({
                    data: {
                        studentEmail: studentUser.email,
                        courseId: sampleCourse2.id,
                        isActive: false
                    }
                })
            ]);
        });

        it('should get enrollment statistics for admin', async () => {
            const response = await request(app)
                .get('/api/enrollments/stats/overview')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Enrollment statistics retrieved successfully',
                data: {
                    totalEnrollments: expect.any(Number),
                    activeEnrollments: expect.any(Number)
                }
            });
        });

        it('should reject access for non-admin users', async () => {
            const response = await request(app)
                .get('/api/enrollments/stats/overview')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(403);

            expect(response.body.message).toBe('User does not have permission');
        });
    });
});