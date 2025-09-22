import { Router } from 'express';
import { AuthController } from '@/controllers/authController';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { loginSchema, registerSchema } from '@/utils/validation';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

router.get('/profile', authenticate, authController.getProfile);

export default router;