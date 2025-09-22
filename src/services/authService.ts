import { User } from '@prisma/client';
import { UserRepository } from '@/repositories/userRepository';
import { LoginRequest, RegisterRequest } from '@/types/interfaces';
import { PasswordUtil } from '@/utils/password';
import { JWTUtil } from '@/utils/jwt';

export class AuthService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async register(data: RegisterRequest): Promise<{
        user: Omit<User, 'password'>;
        token: string;
    }> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await PasswordUtil.hash(data.password);

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword
        });

        const token = JWTUtil.generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        return { user, token };
    }

    async login(data: LoginRequest): Promise<{
        user: Omit<User, 'password' | 'isActive' | 'createdAt' | 'updatedAt'>;
        token: string;
    }> {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        const isValidPassword = await PasswordUtil.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        const token = JWTUtil.generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        const { password, isActive, createdAt, updatedAt, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }

    async getUserById(id: string): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}