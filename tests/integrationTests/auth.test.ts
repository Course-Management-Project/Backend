import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../setup';

describe('Authentication Endpoints', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
                role: 'student'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        email: userData.email,
                        name: userData.name,
                        role: userData.role
                    },
                    token: expect.any(String)
                }
            });
        });

        it('should reject duplicate email registration', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(409);

            expect(response.body).toMatchObject({
                success: false,
                message: 'User with this email already exists'
            });
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                    role: 'student'
                });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        email: 'test@example.com'
                    },
                    token: expect.any(String)
                }
            });
        });

        it('should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toMatchObject({
                success: false,
                message: 'Invalid email or password'
            });
        });

        it('should return the user profile when token is valid', async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            const token = loginResponse.body.data.token;

            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'student',
                    isActive: true,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                },
            });
        });
    });
});