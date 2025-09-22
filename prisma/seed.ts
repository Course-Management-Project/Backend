import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const hashedAdminPassword = await PasswordUtil.hash(adminPassword);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            name: 'System Administrator',
            role: 'admin'
        }
    });

    console.log(`Admin user created: ${admin.email}`);

    const instructorPassword = await PasswordUtil.hash('instructor123');

    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@example.com' },
        update: {},
        create: {
            email: 'instructor@example.com',
            password: instructorPassword,
            name: 'John Instructor',
            role: 'instructor'
        }
    });

    console.log(`Instructor user created: ${instructor.email}`);

    const studentPassword = await PasswordUtil.hash('student123');

    const students = await Promise.all([
        prisma.user.upsert({
            where: { email: 'student1@example.com' },
            update: {},
            create: {
                email: 'student1@example.com',
                password: studentPassword,
                name: 'Alice Student',
                role: 'student'
            }
        }),
        prisma.user.upsert({
            where: { email: 'student2@example.com' },
            update: {},
            create: {
                email: 'student2@example.com',
                password: studentPassword,
                name: 'Bob Student',
                role: 'student'
            }
        })
    ]);

    console.log(`Students created: ${students.map(s => s.email).join(', ')}`);

    const courses = await Promise.all([
        prisma.course.upsert({
            where: { id: 'course-1' },
            update: {},
            create: {
                id: 'course-1',
                title: 'Introduction to Programming',
                description: 'Learn the fundamentals of programming with JavaScript. This course covers variables, functions, loops, and basic algorithms.',
                difficulty: 'Beginner'
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-2' },
            update: {},
            create: {
                id: 'course-2',
                title: 'Advanced Web Development',
                description: 'Master modern web development with React, Node.js, and databases. Build full-stack applications from scratch.',
                difficulty: 'Advanced'
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-3' },
            update: {},
            create: {
                id: 'course-3',
                title: 'Database Design & SQL',
                description: 'Learn how to design efficient databases and write complex SQL queries. Covers normalization, indexing, and optimization.',
                difficulty: 'Intermediate'
            }
        }),
        prisma.course.upsert({
            where: { id: 'course-4' },
            update: {},
            create: {
                id: 'course-4',
                title: 'Python for Data Science',
                description: 'Use Python for data analysis and machine learning. Learn pandas, numpy, matplotlib, and scikit-learn.',
                difficulty: 'Intermediate'
            }
        })
    ]);

    console.log(`Courses created: ${courses.map(c => c.title).join(', ')}`);

    const enrollments = await Promise.all([
        prisma.enrollment.upsert({
            where: {
                studentEmail_courseId: {
                    studentEmail: 'student1@example.com',
                    courseId: 'course-1'
                }
            },
            update: {},
            create: {
                studentEmail: 'student1@example.com',
                courseId: 'course-1'
            }
        }),
        prisma.enrollment.upsert({
            where: {
                studentEmail_courseId: {
                    studentEmail: 'student1@example.com',
                    courseId: 'course-3'
                }
            },
            update: {},
            create: {
                studentEmail: 'student1@example.com',
                courseId: 'course-3'
            }
        }),
        prisma.enrollment.upsert({
            where: {
                studentEmail_courseId: {
                    studentEmail: 'student2@example.com',
                    courseId: 'course-1'
                }
            },
            update: {},
            create: {
                studentEmail: 'student2@example.com',
                courseId: 'course-1'
            }
        }),
        prisma.enrollment.upsert({
            where: {
                studentEmail_courseId: {
                    studentEmail: 'student2@example.com',
                    courseId: 'course-4'
                }
            },
            update: {},
            create: {
                studentEmail: 'student2@example.com',
                courseId: 'course-4'
            }
        })
    ]);

    console.log(`Enrollments created: ${enrollments.length}`);
    console.log('Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });