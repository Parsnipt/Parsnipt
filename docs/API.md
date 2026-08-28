# Parsnipt API Documentation

Complete API reference for Parsnipt backend services. This document covers all available endpoints, request/response formats, and authentication requirements.

**API Version:** v1  
**Base URL:** `http://localhost:5000/api/v1` (development) | `https://api.parsnipt.dev/api/v1` (production)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Endpoints](#endpoints)
    - [Health Check](#health-check)
    - [Authentication](#authentication-endpoints)
    - [Extractions](#extraction-endpoints)
    - [User](#user-endpoints)
5. [Webhooks](#webhooks-phase-2)
6. [Pagination](#pagination)

---

## Authentication

### Bearer Token

All API endpoints require authentication via JWT bearer token (except public endpoints).

**Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Obtaining a Token:**
1. Register or login via frontend
2. JWT token returned in authentication response
3. Include token in Authorization header for all requests

### Refresh Token

Tokens expire after 24 hours. Use refresh token to get a new access token:

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## Error Handling

### Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional context"
    }
  },
  "timestamp": "2026-07-25T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMITED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Server error |
| INVALID_FILE_TYPE | 400 | Unsupported file type |
| FILE_TOO_LARGE | 413 | File exceeds size limit |
| EXTRACTION_FAILED | 500 | Code extraction failed |

---

## Rate Limiting

Rate limits are applied per user based on subscription tier:

| Tier | Requests/Day | Requests/Hour |
|------|--------------|---------------|
| Free | 10 | 2 |
| Pro | 100 | 20 |
| Enterprise | Unlimited | Unlimited |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1627234800
```

When rate limited, you'll receive a 429 response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 1 hour."
  }
}
```

---

## Endpoints

### Health Check

#### GET /health

Check API health status (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-25T10:30:00Z",
  "version": "1.0.0"
}
```

---

### Authentication Endpoints

#### POST /auth/register

#### GET /auth/verify/:token

Verify a newly registered user's email address.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

Response (400 Bad Request - Expired/Invalid):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Verification failed. The link may have expired."
  }
}
```

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free",
    "createdAt": "2026-07-25T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 86400
  }
}
```

#### POST /auth/login

Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free"
  },
  "tokens": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 86400
  }
}
```

#### POST /auth/logout

Logout current user and invalidate tokens.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### Extraction Endpoints

#### POST /extractions

Submit code file for extraction.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary file data]
fileName: "mycode.js"
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "extractionId": "uuid-extraction-id",
    "fileName": "mycode.js",
    "fileSize": 2048,
    "status": "processing",
    "createdAt": "2026-07-25T10:30:00Z"
  }
}
```

#### GET /extractions/{extractionId}

Retrieve extraction results.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "extractionId": "uuid-extraction-id",
    "fileName": "mycode.js",
    "status": "completed",
    "results": {
      "functions": [
        {
          "name": "calculateSum",
          "type": "function",
          "startLine": 5,
          "endLine": 12,
          "parameters": ["a", "b"],
          "returnType": "number",
          "code": "function calculateSum(a, b) {\n  return a + b;\n}"
        }
      ],
      "components": [
        {
          "name": "UserCard",
          "type": "component",
          "startLine": 15,
          "endLine": 35,
          "isReact": true,
          "isFunctional": true,
          "code": "function UserCard({ name }) {\n  return <div>{name}</div>;\n}"
        }
      ],
      "utilities": [],
      "constants": []
    },
    "completedAt": "2026-07-25T10:30:15Z"
  }
}
```

#### GET /extractions

List all user extractions with pagination.

**Query Parameters:**
```
?page=1&limit=10&status=completed&sortBy=createdAt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "extractionId": "uuid-extraction-id",
      "fileName": "mycode.js",
      "status": "completed",
      "createdAt": "2026-07-25T10:30:00Z",
      "itemCount": 8
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### DELETE /extractions/{extractionId}

Delete an extraction and its results.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Extraction deleted successfully"
}
```

#### POST /extractions/{extractionId}/export

Export extraction results in specified format.

**Request:**
```json
{
  "format": "json"
}
```

**Response (200 OK):**
```
[Binary file download - JSON, Markdown, etc.]
```

---

### User Endpoints

#### GET /users/me

Get current user profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "free",
    "extractionsToday": 3,
    "extractionLimit": 10,
    "createdAt": "2026-07-25T10:30:00Z"
  }
}
```

#### PUT /users/me

Update user profile.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-user-id",
    "email": "newemail@example.com",
    "name": "Jane Doe",
    "tier": "free"
  }
}
```

#### POST /users/me/password

Change user password.

**Request:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-secure-password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Webhooks (Phase 2)

Webhook support coming in Phase 2. Webhooks will allow you to receive notifications when extractions complete.

**Planned Events:**
- `extraction.completed` - Extraction finished successfully
- `extraction.failed` - Extraction encountered an error
- `user.subscription_changed` - User tier changed

---

## Pagination

### Query Parameters

```
?page=1          # Page number (default: 1)
&limit=10        # Items per page (default: 10, max: 100)
&sortBy=createdAt # Sort field (createdAt, updatedAt, name)
&sortOrder=desc  # Sort order (asc, desc)
```

### Pagination Response

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using Postman

1. Import API collection (coming soon)
2. Set environment variables (BASE_URL, TOKEN)
3. Execute requests
4. View responses

### Using Insomnia

Similar to Postman - import collection and use environment variables.

---

## SDK & Client Libraries (Phase 2)

Official SDKs coming in Phase 2:
- JavaScript/TypeScript
- Python
- Go
- Java

---

## Support

- API Issues: [GitHub Issues](https://github.com/parsnipt/parsnipt/issues)
- Questions: [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- Email: support@parsnipt.dev (coming soon)

---

**Last Updated:** August 27th 2026  
**Next Update:** October 2026
