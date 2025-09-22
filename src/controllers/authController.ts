import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { ResponseUtil } from '@/utils/response';
import { LoginRequest, RegisterRequest } from '@/types/interfaces';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const userData: RegisterRequest = req.body;
            const result = await this.authService.register(userData);

            return ResponseUtil.created(
                res,
                {
                    user: result.user,
                    token: result.token
                },
                'User registered successfully'
            );
        } catch (error) {
            if (error instanceof Error && error.message === 'User with this email already exists') {
                return ResponseUtil.conflict(res, 'User with this email already exists');
            }
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const loginData: LoginRequest = req.body;
            const result = await this.authService.login(loginData);

            return ResponseUtil.success(
                res,
                {
                    user: result.user,
                    token: result.token
                },
                'Login successful'
            );
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invalid email or password') {
                    return ResponseUtil.unauthorized(res, 'Invalid email or password');
                }
                if (error.message === 'Account is deactivated') {
                    return ResponseUtil.forbidden(res, 'Account is deactivated');
                }
            }
            next(error);
        }
    };

    getProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            if (!req.user) {
                return ResponseUtil.unauthorized(res, 'Authentication required');
            }

            const user = await this.authService.getUserById(req.user.id);

            return ResponseUtil.success(res, user, 'Profile retrieved successfully');
        } catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                return ResponseUtil.notFound(res, 'User not found');
            }
            next(error);
        }
    };
}