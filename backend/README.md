# Parsnipt Backend

Express.js REST API server for Parsnipt code extraction platform.

---

## Overview

The backend handles:
- User authentication and authorization
- Code file uploads and storage
- Code extraction and analysis using Babel AST parsing
- Pattern recognition and categorization
- API endpoints for frontend consumption
- Database operations and caching
- Rate limiting and usage tracking

---

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (primary data storage)
- **Cache:** Redis (session/rate limiting)
- **AST Parser:** @babel/parser (JavaScript/TypeScript)
- **Testing:** Jest
- **Linting:** ESLint
- **Code Formatting:** Prettier

---

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   ├── database.ts       # PostgreSQL connection
│   │   ├── redis.ts          # Redis connection
│   │   └── env.ts            # Environment variables
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── extractions.ts    # Extraction routes
│   │   ├── users.ts          # User routes
│   │   └── health.ts         # Health check route
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── extractionController.ts
│   │   └── userController.ts
│   ├── services/
│   │   ├── authService.ts    # Authentication logic
│   │   ├── extractionService.ts # Extraction logic
│   │   ├── userService.ts    # User logic
│   │   └── fileService.ts    # File handling
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── errorHandler.ts   # Error handling
│   │   ├── validation.ts     # Request validation
│   │   └── rateLimiter.ts    # Rate limiting
│   ├── types/
│   │   ├── index.ts          # TypeScript interfaces
│   │   ├── express.ts        # Express type extensions
│   │   └── extraction.ts     # Extraction types
│   ├── utils/
│   │   ├── logger.ts         # Logging utility
│   │   ├── errors.ts         # Custom errors
│   │   └── validators.ts     # Validation helpers
│   └── tests/                # Test files
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── jest.config.js            # Jest configuration
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 12+
- Redis 6+

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

Edit `.env` with your configuration:

```bash
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/parsnipt_dev

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your-refresh-secret

# Auth0 (if using)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# File Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=parsnipt-uploads
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=debug
```

### Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

---

## Available Scripts

```bash
npm run dev           # Start development server (with auto-reload)
npm run build         # Build for production
npm run start         # Start production server
npm run test          # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Run TypeScript compiler check
npm run migrate       # Run database migrations (Phase 2)
npm run seed          # Seed database with sample data (Phase 2)
```

---

## API Routes

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Extractions
- `POST /api/v1/extractions` - Submit file for extraction
- `GET /api/v1/extractions` - List user's extractions
- `GET /api/v1/extractions/:id` - Get extraction details
- `DELETE /api/v1/extractions/:id` - Delete extraction
- `POST /api/v1/extractions/:id/export` - Export results

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `POST /api/v1/users/me/password` - Change password

### Health
- `GET /api/v1/health` - Health check (no auth required)

See [API Documentation](../docs/API.md) for complete details.

---

## Code Extraction Pipeline

### 1. File Upload
- Validate file type, size, encoding
- Store temporarily in file storage
- Create extraction record in database

### 2. Parsing
- Read file content
- Use Babel parser to create AST
- Handle parsing errors gracefully

### 3. Analysis
- Traverse AST nodes
- Identify functions, components, utilities
- Extract metadata (parameters, return types, etc.)

### 4. Categorization
- Classify code by type
- Apply naming heuristics
- Calculate complexity metrics

### 5. Storage
- Cache results in Redis
- Store in PostgreSQL (if user opted in)
- Generate indexing for search

### 6. Response
- Format results for frontend
- Return extraction ID and data

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tier VARCHAR(50) DEFAULT 'free',
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Extractions Table
```sql
CREATE TABLE extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size_bytes INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  extraction_results JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- filename.test.ts
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Test Coverage Goals
- Unit tests: >80% coverage
- Integration tests: Critical paths
- E2E tests: Main user flows

---

## Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Environment Configuration
Set production environment variables before starting:
```bash
NODE_ENV=production npm run start
```

### Deployment Targets
- Railway
- Render
- AWS EC2
- DigitalOcean
- Google Cloud Run

See [Setup Guide](../docs/SETUP.md) for detailed deployment instructions.

---

## Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_REQUEST` - Request validation failed
- `UNAUTHORIZED` - Missing/invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Rate limit exceeded
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file type
- `EXTRACTION_FAILED` - Code extraction failed
- `INTERNAL_ERROR` - Server error

---

## Security

### Authentication
- JWT-based authentication
- Refresh token rotation
- Password hashing with bcrypt

### Authorization
- Role-based access control
- User-scoped data isolation
- Rate limiting per user/tier

### Data Protection
- HTTPS/TLS in transit
- Encryption at rest (PostgreSQL)
- No plaintext secrets in code

### Input Validation
- Request body validation
- File type and size validation
- SQL injection prevention (ORM)
- XSS prevention

---

## Performance Optimization

### Caching
- Redis for session caching
- Extraction result caching
- Rate limit counter caching

### Database
- Connection pooling
- Query optimization
- Indexes on frequently queried fields

### File Handling
- Streaming for large files
- Temporary file cleanup
- Storage optimization

---

## Logging

Logs are output to console in development and file in production:

```bash
# View logs
tail -f logs/application.log

# Log levels: debug, info, warn, error
LOG_LEVEL=debug npm run dev
```

---

## Contributing

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for contribution guidelines.

Key points:
- Follow TypeScript styleguide
- Add tests for new features
- Document API changes
- Use conventional commit messages

---

## Architecture

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for detailed system design and technical decisions.

---

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb parsnipt_dev`

### Redis Connection Error
- Verify Redis is running
- Check REDIS_URL in .env
- Test connection: `redis-cli ping`

### Port 5000 Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

### Dependencies Installation Fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Support

- Issues: [GitHub Issues](https://github.com/parsnipt/parsnipt/issues)
- Questions: [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- Documentation: [Docs](../docs/)

---

**Made with dedication by the Parsnipt Team**