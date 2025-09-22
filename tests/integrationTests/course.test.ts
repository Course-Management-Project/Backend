import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';

describe('Course Endpoints', () => {
    let adminToken: string;
    let studentToken: string;
    let adminUser: any;
    let studentUser: any;
    let sampleCourse: any;

    beforeAll(async () => {
        const adminData = {
            email: 'admin@test.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin'
        };

        const studentData = {
            email: 'student@test.com',
            password: 'student123',
            name: 'Student User',
            role: 'student'
        };

        const adminResponse = await request(app)
            .post('/api/auth/register')
            .send(adminData);

        const studentResponse = await request(app)
            .post('/api/auth/register')
            .send(studentData);

        adminToken = adminResponse.body.data.token;
        studentToken = studentResponse.body.data.token;

        adminUser = adminResponse.body.data.user;
        studentUser = studentResponse.body.data.user;
    });

    beforeEach(async () => {
        await prisma.enrollment.deleteMany();
        await prisma.course.deleteMany();

        sampleCourse = await prisma.course.create({
            data: {
                title: 'Test Course',
                description: 'This is a test course description',
                difficulty: 'Beginner'
            }
        });
    });

    afterAll(async () => {
        await prisma.enrollment.deleteMany();
        await prisma.course.deleteMany();
        await prisma.user.deleteMany();
    });

    describe('GET /api/courses', () => {
        it('should get all active courses without authentication', async () => {
            const response = await request(app)
                .get('/api/courses')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Courses retrieved successfully',
            });

            expect(Array.isArray(response.body.data.data)).toBe(true);
            expect(response.body.data.data).toHaveLength(1);
            expect(response.body.data.data[0]).toMatchObject({
                title: 'Test Course',
                description: 'This is a test course description',
                difficulty: 'Beginner'
            });
        });

        it('should filter courses by difficulty', async () => {
            await prisma.course.create({
                data: {
                    title: 'Advanced Course',
                    description: 'Advanced level course',
                    difficulty: 'Advanced'
                }
            });

            const response = await request(app)
                .get('/api/courses?difficulty=Advanced')
                .expect(200);

            expect(response.body.data.data).toHaveLength(1);
            expect(response.body.data.data[0].difficulty).toBe('Advanced');
        });
    });

    describe('GET /api/courses/:id', () => {
        it('should get course by valid ID', async () => {
            const response = await request(app)
                .get(`/api/courses/${sampleCourse.id}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Course retrieved successfully',
                data: {
                    id: sampleCourse.id,
                    title: 'Test Course',
                    description: 'This is a test course description',
                    difficulty: 'Beginner'
                }
            });
        });

        it('should return 404 for non-existent course', async () => {
            const response = await request(app)
                .get('/api/courses/non-existent-id')
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Course not found'
            });
        });
    });

    describe('GET /api/courses/search', () => {
        it('should search courses by title', async () => {
            const response = await request(app)
                .get('/api/courses/search?q=Test')
                .expect(200);

            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toContain('Test');
        });

        it('should return empty array for no matches', async () => {
            const response = await request(app)
                .get('/api/courses/search?q=NonExistentCourse')
                .expect(200);

            expect(response.body.data).toHaveLength(0);
        });
    });

    describe('POST /api/courses', () => {
        it('should create course with admin token', async () => {
            const courseData = {
                title: 'Admin Course',
                description: 'Course created by admin',
                difficulty: 'Advanced'
            };

            const response = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(courseData)
                .expect(201);

            expect(response.body.data.title).toBe(courseData.title);
        });

        it('should reject course creation with student token', async () => {
            const courseData = {
                title: 'Student Course',
                description: 'Students cannot create courses',
                difficulty: 'Beginner'
            };

            const response = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(courseData)
                .expect(403);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User does not have permission'
            });
        });
    });
});