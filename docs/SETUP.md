# Parsnipt Local Development Setup Guide

This guide will walk you through setting up Parsnipt for local development on your machine.

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js 24+** - Download from [nodejs.org](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js by default
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **PostgreSQL 12+** (for database) - Download from [postgresql.org](https://www.postgresql.org/download/)
- **Redis** (for caching) - Download from [redis.io](https://redis.io/download)
- **A code editor** - Recommended: [VS Code](https://code.visualstudio.com/)

### Optional but Recommended
- **Docker** - For containerized PostgreSQL and Redis (easier than manual installation)
- **Postman or Insomnia** - For testing API endpoints

## Verification

Verify your installations by running:

```bash
node --version        # Should be 24.0.0 or higher
npm --version         # Should be 8.0.0 or higher
git --version         # Any recent version
psql --version        # Should be 12 or higher (if installed)
redis-cli --version   # If using Redis

# Step 1: Clone the Repository
git clone https://github.com/parsnipt/parsnipt.git
cd parsnipt

# Step 2: Backend Setup

# 2.1 Navigate to Backend Directory
cd backend
# 2.2 Install Dependencies
npm install
# 2.3 Create Environment File
# Create a .env file in the backend directory:
cp .env.example .env

# Then open .env and add your configuration:

# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/parsnipt_dev
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret-key
RESEND_API_KEY=your-resend-api-key

# File Storage (S3)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=parsnipt-uploads
AWS_REGION=us-east-1

# Logging
LOG_LEVEL=debug

# 2.4 Set Up Database

# Option A: Using Docker (Recommended)
# Start PostgreSQL container
docker run --name parsnipt-db -e POSTGRES_USER=parsnipt -e POSTGRES_PASSWORD=password -e POSTGRES_DB=parsnipt_dev -p 5432:5432 -d postgres:15

# Start Redis container
docker run --name parsnipt-redis -p 6379:6379 -d redis:7

# Option B: Manual Installation

If you installed PostgreSQL and Redis locally, ensure they’re running:
# On Windows
# PostgreSQL: Check Services or use pgAdmin
# Redis: redis-server

# On macOS (if using Homebrew)
brew services start postgresql
brew services start redis

# On Linux
sudo systemctl start postgresql
sudo systemctl start redis-server

# 2.5 Run Database Migrations
npm run migrate

# 2.6 Start Backend Development Server

npm run dev

# You should see output like:
Server running on http://localhost:5000
Database connected
Redis connected

# Step 3: Frontend Setup

In a new terminal window, navigate to the frontend:

# 3.1 Navigate to Frontend Directory
cd frontend

# 3.2 Install Dependencies
npm install

# 3.3 Create Environment File
cp .env.example .env

# Then open .env and add your configuration:

# API
VITE_APP_API_URL=http://localhost:5000/api
VITE_APP_API_TIMEOUT=10000

# Authentication
VITE_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_APP_AUTH0_CLIENT_ID=your-client-id

# Feature Flags
VITE_APP_ENABLE_PREVIEW=true
VITE_APP_ENABLE_GITHUB_INTEGRATION=false

# 3.4 Start Frontend Development Server
npm run dev

# You should see output like:
Local:   http://localhost:3000
```

**Verification**

Once both servers are running:

Frontend

• Open http://localhost:3000 in your browser

• You should see the Parsnipt homepage

• No errors in browser console

Backend

• API should be accessible at http://localhost:5000/api/health

• Should return a health check response

Test API Connection
curl http://localhost:5000/api/health

Expected response:
{
  "status": "ok",
  "timestamp": "2026-07-25T10:30:00Z"
}

**Available Scripts**
```bash
Backend:
npm run dev           # Start development server with auto-reload
npm run build         # Build for production
npm run start         # Start production server
npm run test          # Run tests
npm test:watch       # Run tests in watch mode
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run migrate       # Run database migrations
npm run seed          # Seed database with sample data (Phase 2)

Frontend:
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server (if using Node)
npm run test          # Run tests
npm test:watch       # Run tests in watch mode
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run preview       # Preview production build locally
```
**Environment Variables**

Backend (.env)



## Troubleshooting

**Port Already in Use**

If port 5000 or 3000 is already in use: 
```bash
# Find and kill process on port 5000 (macOS/Linux)
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change the port in .env:
# Backend
PORT=5001
# Frontend
VITE_APP_API_URL=http://localhost:5001/api  
```

**Database Connection Error**

1. Verify PostgreSQL is running

2. Check DATABASE_URL in .env

3. Verify credentials are correct

4. Try connecting manually:
```bash
psql -U parsnipt -d parsnipt_dev -h localhost
```
**Redis Connection Error**

1. Verify Redis is running

2. Check REDIS_URL in .env

3. Try connecting manually:
```bash
redis-cli ping

Should respond with PONG
```
**Dependencies Installation Fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
**Port 5000 Issues on macOS**

Port 5000 is sometimes used by macOS services:
```bash
# Find what's using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>

# Or use a different port in .env
PORT=5001
```
## Database Setup 

Database schema and migrations:

1. Manually create the database
```bash
createdb parsnipt_dev
```
2. Connect and run migrations when available:
```bash
npm run migrate
```
**Testing the Setup**

Test Backend
```bash
# Navigate to backend
cd backend

# Run tests
npm test

# Run specific test
npm test -- filename.test.ts
```
Test Frontend
```bash
# Navigate to frontend
cd frontend

# Run tests
npm test

# Run in watch mode
npm test -- --watch
```
## IDE Setup

**VS Code Extensions (Recommended)**

• ES7+ React/Redux/React-Native snippets - dsznajder.es7-react-js-snippets

• ESLint - dbaeumer.vscode-eslint

• Prettier - esbenp.prettier-vscode

• REST Client - humao.rest-client (for API testing)

• Thunder Client - rangav.vscode-thunder-client (alternative API client)

**VS Code Settings**

Add to .vscode/settings.json:

{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}

**Next Steps**

1. Both servers running locally

2. Frontend accessible at http://localhost:3000

3. Backend accessible at http://localhost:5000

4. Ready to start development!

**For more information:**

• Contributing Guide

• Architecture Overview

• API Documentation


**Getting Help**

• Check GitHub Issues for common problems

• Ask in GitHub Discussions

• Review error logs for specific error messages

Happy developing!