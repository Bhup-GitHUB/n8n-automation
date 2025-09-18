# N8N Automation Platform - API Test Cases

## Overview
This document provides comprehensive test cases for the N8N Automation Platform API. The API is built with Express.js, TypeScript, Prisma, and PostgreSQL.

**Base URL:** `http://localhost:3001`

## Prerequisites
1. Ensure the server is running (`bun run dev`)
2. Database is connected and migrated
3. Environment variables are set (JWT_SECRET, DATABASE_URL)

---

## 1. Health Check Endpoints

### 1.1 Root Endpoint
**Request:**
```
GET http://localhost:3001/
```

**Expected Response:**
```json
{
  "message": "N8N Automation Platform API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "health": "/health"
  }
}
```

### 1.2 Health Check
**Request:**
```
GET http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "N8N Automation Platform"
}
```

---

## 2. Authentication Endpoints

### 2.1 User Registration

#### 2.1.1 Successful Registration
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clr1234567890",
      "email": "test@example.com",
      "username": "testuser",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### 2.1.2 Registration with Duplicate Email
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "newuser",
  "password": "password123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

#### 2.1.3 Registration with Duplicate Username
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "new@example.com",
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

#### 2.1.4 Registration with Missing Fields
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "password required"
    }
  ]
}
```

#### 2.1.5 Registration with Invalid Email Format
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 2.2 User Login

#### 2.2.1 Successful Login
**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clr1234567890",
      "email": "test@example.com",
      "username": "testuser"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2.2.2 Login with Invalid Username
**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "nonexistent",
  "password": "password123"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

#### 2.2.3 Login with Invalid Password
**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "wrongpassword"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

#### 2.2.4 Login with Missing Fields
**Request:**
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "username": "testuser"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "password required"
    }
  ]
}
```

### 2.3 Get Current User (Protected Route)

#### 2.3.1 Successful User Data Retrieval
**Request:**
```
GET http://localhost:3001/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "user": {
      "id": "clr1234567890",
      "email": "test@example.com",
      "username": "testuser",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "_count": {
        "workflows": 0,
        "credentials": 0
      }
    }
  }
}
```

#### 2.3.2 Access Without Token
**Request:**
```
GET http://localhost:3001/api/auth/me
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

#### 2.3.3 Access with Invalid Token
**Request:**
```
GET http://localhost:3001/api/auth/me
Authorization: Bearer invalid-token
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access denied. Invalid token."
}
```

#### 2.3.4 Access with Expired Token
**Request:**
```
GET http://localhost:3001/api/auth/me
Authorization: Bearer expired-token
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access denied. Token expired."
}
```

---

## 3. Error Handling Test Cases

### 3.1 Server Error
**Request:**
```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}
```

**Expected Response (500) - When database is down:**
```json
{
  "success": false,
  "message": "internal server error"
}
```

---

## 4. Postman Collection Setup

### 4.1 Environment Variables
Create a Postman environment with these variables:
- `base_url`: `http://localhost:3001`
- `auth_token`: (will be set after login)

### 4.2 Pre-request Scripts

#### For Login Request:
```javascript
// Set base URL
pm.environment.set("base_url", "http://localhost:3001");
```

#### For Protected Routes:
```javascript
// Use stored token
const token = pm.environment.get("auth_token");
if (token) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + token
    });
}
```

#### For Registration/Login Success:
```javascript
// Store token after successful login
if (pm.response.code === 200 && pm.response.json().success) {
    const token = pm.response.json().data.token;
    if (token) {
        pm.environment.set("auth_token", token);
    }
}
```

### 4.3 Test Scripts

#### For Login Response:
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    pm.expect(pm.response.json().success).to.be.true;
    pm.expect(pm.response.json().data).to.have.property('token');
    pm.expect(pm.response.json().data).to.have.property('user');
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

#### For Registration Response:
```javascript
pm.test("Registration successful", function () {
    pm.response.to.have.status(201);
    pm.expect(pm.response.json().success).to.be.true;
    pm.expect(pm.response.json().data).to.have.property('user');
});

pm.test("User has required fields", function () {
    const user = pm.response.json().data.user;
    pm.expect(user).to.have.property('id');
    pm.expect(user).to.have.property('email');
    pm.expect(user).to.have.property('username');
    pm.expect(user).to.have.property('createdAt');
});
```

---

## 5. Test Data Setup

### 5.1 Test Users
Create these test users for comprehensive testing:

```json
[
  {
    "email": "admin@test.com",
    "username": "admin",
    "password": "admin123"
  },
  {
    "email": "user1@test.com",
    "username": "user1",
    "password": "user123"
  },
  {
    "email": "user2@test.com",
    "username": "user2",
    "password": "user123"
  }
]
```

### 5.2 Invalid Test Data
```json
[
  {
    "email": "invalid-email",
    "username": "test",
    "password": "pass"
  },
  {
    "email": "",
    "username": "",
    "password": ""
  },
  {
    "email": "test@example.com",
    "username": "a",
    "password": "password123"
  }
]
```

---

## 6. Performance Testing

### 6.1 Load Testing Scenarios
1. **Concurrent Registrations**: 10 users registering simultaneously
2. **Concurrent Logins**: 20 users logging in simultaneously
3. **Token Validation**: 100 requests to `/api/auth/me` with valid tokens

### 6.2 Expected Performance Metrics
- Response time: < 2000ms for all endpoints
- Success rate: > 99% for valid requests
- Error rate: < 1% for valid requests

---

## 7. Security Testing

### 7.1 SQL Injection Tests
Test with malicious input in all string fields:
```json
{
  "email": "test@example.com'; DROP TABLE users; --",
  "username": "testuser",
  "password": "password123"
}
```

### 7.2 XSS Testing
Test with script tags in string fields:
```json
{
  "email": "test@example.com",
  "username": "<script>alert('xss')</script>",
  "password": "password123"
}
```

### 7.3 JWT Token Security
- Test token expiration
- Test token manipulation
- Test token replay attacks

---

## 8. Database Testing

### 8.1 Data Integrity
- Verify unique constraints on email and username
- Verify password hashing
- Verify timestamps are set correctly

### 8.2 Data Validation
- Test with maximum length inputs
- Test with special characters
- Test with Unicode characters

---

## 9. API Documentation Testing

### 9.1 OpenAPI/Swagger Integration
If implementing OpenAPI documentation, test:
- All endpoints are documented
- Request/response schemas are accurate
- Authentication requirements are specified

---

## 10. Monitoring and Logging

### 10.1 Log Verification
Ensure these events are logged:
- Successful registrations
- Failed login attempts
- Token validation failures
- Database connection errors

### 10.2 Error Tracking
Monitor for:
- 4xx client errors
- 5xx server errors
- Database connection issues
- JWT token issues

---

## Notes

1. **Token Expiration**: JWT tokens expire after 7 days
2. **Password Requirements**: Currently only requires non-empty password
3. **Database**: Uses PostgreSQL with Prisma ORM
4. **Authentication**: JWT-based authentication
5. **Validation**: Uses Zod for request validation
6. **CORS**: Enabled for all origins (configure for production)

## Running Tests

1. Start the server: `bun run dev`
2. Import the Postman collection
3. Set up environment variables
4. Run tests in sequence (register → login → protected routes)
5. Verify database state after tests
