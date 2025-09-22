import { User } from '@prisma/client';
import { prisma } from '@/config/database';
import { RegisterRequest } from '@/types/interfaces';

export class UserRepository {
    async create(data: RegisterRequest & { password: string }): Promise<Omit<User, 'password'>> {
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role || 'student'
            }
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async findById(id: string): Promise<Omit<User, 'password'> | null> {
        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Omit<User, 'password'>> {
        const user = await prisma.user.update({
            where: { id },
            data
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async delete(id: string): Promise<Omit<User, 'password'>> {
        const user = await prisma.user.update({
            where: { id },
            data: { isActive: false }
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}