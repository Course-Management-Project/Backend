# Course Management API - Sonic Labs Backend Assignment

This RESTful API manages course catalogs and student enrollments with comprehensive authentication, validation, and testing.

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd course-management-api
npm install
```

### 2. Environment Configuration
Create a `.env` file and configure your environment:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/course_management_db?schema=public" 
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. Database Setup
```bash
# First, create a database in PostgreSQL - Use pgAdmin or CLI to create your database 'course_management_db'
# (username: postgres, password: yourpassword)
# Then run these commands sequentially:

npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed with demo data
```

**Note:** If you encounter the error "Module '"@prisma/client"' has no exported member '...'", it means you haven't run `npm run db:generate`. If you have run it, simply close VS Code and reopen it.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Manage Database
```bash
npm run db:studio
```
Use this command to view the database through Prisma client on http://localhost:5555 or use pgAdmin.

## 🗄️ Database Schema

### Models

**Course**
- `id`: String (CUID) - Primary key
- `title`: String - Course title (required)
- `description`: Text - Course description (required)
- `difficulty`: String - "Beginner", "Intermediate", "Advanced"
- `isActive`: Boolean - Soft delete flag
- `createdAt`, `updatedAt`: DateTime

**Enrollment**
- `id`: String (CUID) - Primary key
- `studentEmail`: String - Student's email (required)
- `courseId`: String - Foreign key to Course
- `enrolledAt`: DateTime - Enrollment timestamp
- `isActive`: Boolean - Soft delete flag
- Unique constraint on (studentEmail, courseId)

**User** (Bonus: Authentication)
- `id`: String (CUID) - Primary key
- `email`: String - Unique user email
- `password`: String - Hashed password
- `name`: String - User's full name
- `role`: String - "student", "instructor", "admin"
- `isActive`: Boolean - Account status

### Key Design Decisions

**Enhanced Database Schema:** Extended beyond the basic requirements to include user authentication and role management
- Added User table for proper authentication
- Added isActive fields for soft deletion
- Implemented unique constraints and foreign key relationships

**RESTful API Design:** Followed REST conventions with proper HTTP methods and status codes
- Used `/api/v1/enrollments/student/:email` instead of `/students/:email/enrollments` for better resource organization

**JWT Authentication:** Implemented comprehensive authentication system
- Role-based access control (admin, instructor, student)
- Protected endpoints with middleware
- Token-based stateless authentication

## API Documentation
[View API Documentation](https://docs.google.com/spreadsheets/d/1lQ8768mA8S55v9cSkAgrGdfRJhFlvP5vGaFuoMb1tnY/edit?usp=sharing)
## Postman
You can import file json from folder postman to postman to test API

## Postman Collection
Available in the repository for testing the API endpoints.

## 🧪 Testing

### Run Test Suite
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only  
npm run test:integration
```

### Test Coverage
- **Unit Tests:** Service layer testing
- **Integration Tests:** Complete API endpoint testing with test database

### Key Test Scenarios

**Course Tests:**
- ✅ Create course with valid data (201 Created)
- ✅ Create course with missing parameters (400 Bad Request)
- ✅ Create course without authentication (401 Unauthorized)
- ✅ List courses with pagination
- ✅ Search courses by difficulty and title

**Enrollment Tests:**
- ✅ Enroll student successfully (201 Created)
- ✅ Prevent duplicate enrollment (409 Conflict)
- ✅ List student enrollments correctly

**Authentication Tests:**
- ✅ Register user with valid data
- ✅ Login with correct credentials
- ✅ Reject login with incorrect information
- ✅ Protect endpoints with JWT validation

## 🐳 Docker

**Note:** If you run with Docker or in production, you must change `_moduleAliases` to dist:

```json
From:
  "_moduleAliases": {
    "@": "src"
  }
To:
  "_moduleAliases": {
    "@": "dist"
  }
```

### Using Docker Compose
```bash
# Build and run with Docker
docker-compose up --build -d

# Check running containers
docker-compose ps
```

You will see 2 services:
- `app` (Node.js API, port 3000)
- `db` (PostgreSQL, port 5432)

```bash
# Run Prisma commands in container
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx prisma db seed

# Stop containers
docker-compose down
```

## Production Deployment

### Build Application
```bash
npm run build
```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL="your-production-postgresql-url"
JWT_SECRET="your-secure-256-bit-secret"
JWT_EXPIRES_IN=7d
PORT=3000
```

### Run Production
```bash
npm start
```

## Default Users (Seeded Data)

| Email | Password | Role | Access |
|-------|----------|------|--------|
| admin@example.com | admin123 | admin | Full access |
| instructor@example.com | instructor123 | instructor | Limited access |
| student1@example.com | student123 | student | Student access |
| student2@example.com | student123 | student | Student access |

## 📝 Project Structure

```
src/
├── config/
│   └── database.ts           # Database connection setup
├── controllers/              # HTTP request handlers
│   ├── authController.ts
│   ├── courseController.ts
│   └── enrollmentController.ts
├── middleware/               # Express middleware
│   ├── auth.ts              # JWT authentication
│   ├── errorHandler.ts      # Global error handling
│   ├── rateLimiter.ts       # Rate limiting
│   └── validation.ts        # Request validation
├── repositories/             # Data access layer
│   ├── courseRepository.ts
│   ├── enrollmentRepository.ts
│   └── userRepository.ts
├── routes/                   # API route definitions
│   ├── auth.ts
│   ├── courses.ts
│   ├── enrollments.ts
│   └── index.ts
├── services/                 # Business logic layer
│   ├── authService.ts
│   ├── courseService.ts
│   └── enrollmentService.ts
├── types/                    # TypeScript type definitions
│   ├── interfaces.ts
│   └── express/index.d.ts
├── utils/                    # Utility functions
│   ├── jwt.ts
│   ├── password.ts
│   ├── response.ts
│   └── validation.ts
└── app.ts                    # Application entry point

prisma/
├── migrations/               # Database migrations
├── schema.prisma            # Database schema definition
└── seed.ts                  # Database seeding script

tests/
├── integrationTests/         # API endpoint tests
├── unitTests/               # Unit tests for services/utils
└── setup/                   # Test configuration
```

## Bonus Features Completed

**JWT Authentication:** Complete user management with role-based access

**Pagination & Filtering:** Advanced query capabilities with cursor-based pagination

**Containerization:** Docker and Docker Compose support

**Frontend UI:** React-based frontend application with full functionality deployed on Vercel via domain on AWS Route 53 hosted zone

**AWS Deployment:**

• The application backend is deployed on an EC2 t2.micro instance.

• Security groups were configured to allow HTTP (80), HTTPS (443), and SSH (restricted to my IP address).

• I purchased a .site domain via iNET and connected it to the EC2 instance using Route 53 for DNS management.

• PostgreSQL was installed on the instance. I created a dedicated database and role for the application and managed connection details through environment variables saved in the project's `.env` file.

• The Node.js API runs with PM2, ensuring the service stays alive and restarts automatically on reboot.

• For HTTPS, I used Caddy as a reverse proxy, which automatically provisions and renews SSL certificates through Let's Encrypt.

• Database migrations and seeding are handled with Prisma CLI just like in the development environment (`npm run db:migrate`, `npm run db:seed`, etc.).


**Live Production Project:** https://coursera.trieuvikhang.site/
