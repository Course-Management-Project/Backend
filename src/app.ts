import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

import authRouter from '@/routes/authRouter';
import courseRouter from '@/routes/courseRouter';
import enrollmentRouter from '@/routes/enrollmentRouter';

import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';

config();

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests.'
});
app.use(limiter);

app.use(compression());
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Course Management API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);

app.use(notFoundHandler);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
    });
}

export default app;