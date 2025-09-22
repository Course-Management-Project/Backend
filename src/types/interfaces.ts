export interface CreateCourseRequest {
    title: string;
    description: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CreateEnrollmentRequest {
    studentEmail: string;
    courseId: string;
}

export interface CourseQueryParams {
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    limit?: number;
    cursor?: string;
    search?: string;
    isActive?: boolean;
}

export interface PaginationResult<T> {
    data: T[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string>;
}

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name?: string;
    role?: 'student' | 'instructor' | 'admin';
}