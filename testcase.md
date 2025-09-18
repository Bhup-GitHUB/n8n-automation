# API Testing Guide

This document provides comprehensive test cases for the N8N Automation Platform API.

## 🚀 Prerequisites

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Ensure Redis and PostgreSQL are running

3. Use tools like Postman, Insomnia, or curl for testing

## 📋 Test Cases

### 1. Health Check

**Test**: Verify server is running
```bash
curl -X GET http://localhost:3000/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-09-18T09:12:47.670Z",
  "service": "N8N Automation Platform"
}
```

---

### 2. API Information

**Test**: Get API information
```bash
curl -X GET http://localhost:3000/
```

**Expected Response**:
```json
{
  "message": "N8N Automation Platform API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "workflows": "/api/workflows",
    "triggers": "/api/triggers",
    "health": "/health"
  }
}
```

---

## 🔐 Authentication Tests

### 3. User Registration

**Test**: Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cuid_...",
      "email": "test@example.com",
      "username": "testuser",
      "createdAt": "2025-09-18T09:12:47.670Z"
    }
  }
}
```

### 4. User Login

**Test**: Login with credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cuid_...",
      "email": "test@example.com",
      "username": "testuser"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Get User Profile

**Test**: Get authenticated user profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "user": {
      "id": "cuid_...",
      "email": "test@example.com",
      "username": "testuser",
      "createdAt": "2025-09-18T09:12:47.670Z",
      "_count": {
        "workflows": 0,
        "credentials": 0
      }
    }
  }
}
```

---

## 🔄 Workflow Management Tests

### 6. Create Workflow

**Test**: Create a new workflow
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Workflow",
    "description": "A test workflow for API testing",
    "enabled": false,
    "nodes": [
      {
        "type": "TRIGGER",
        "name": "Manual Trigger",
        "position": { "x": 100, "y": 100 },
        "config": {}
      },
      {
        "type": "ACTION",
        "name": "Log Action",
        "position": { "x": 300, "y": 100 },
        "config": {
          "actionType": "log",
          "message": "Workflow executed successfully"
        }
      }
    ],
    "connections": [
      {
        "sourceId": "node1",
        "targetId": "node2"
      }
    ]
  }'
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Workflow created successfully",
  "data": {
    "workflow": {
      "id": "cuid_...",
      "title": "Test Workflow",
      "description": "A test workflow for API testing",
      "enabled": false,
      "userId": "cuid_...",
      "nodes": [...],
      "connections": [...]
    }
  }
}
```

### 7. List Workflows

**Test**: Get all user workflows
```bash
curl -X GET http://localhost:3000/api/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Workflows retrieved successfully",
  "data": {
    "workflows": [
      {
        "id": "cuid_...",
        "title": "Test Workflow",
        "description": "A test workflow for API testing",
        "enabled": false,
        "createdAt": "2025-09-18T09:12:47.670Z",
        "updatedAt": "2025-09-18T09:12:47.670Z",
        "nodes": [...],
        "_count": {
          "executions": 0
        }
      }
    ]
  }
}
```

### 8. Get Workflow Details

**Test**: Get specific workflow
```bash
curl -X GET http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Update Workflow

**Test**: Update workflow
```bash
curl -X PUT http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Test Workflow",
    "enabled": true
  }'
```

### 10. Toggle Workflow

**Test**: Enable/disable workflow
```bash
curl -X PATCH http://localhost:3000/api/workflows/WORKFLOW_ID/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Duplicate Workflow

**Test**: Duplicate workflow
```bash
curl -X POST http://localhost:3000/api/workflows/WORKFLOW_ID/duplicate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Delete Workflow

**Test**: Delete workflow
```bash
curl -X DELETE http://localhost:3000/api/workflows/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Trigger Tests

### 13. Manual Workflow Execution

**Test**: Execute workflow manually
```bash
curl -X POST http://localhost:3000/api/triggers/manual/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testData": "This is test data for manual execution"
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Workflow queued for manual execution",
  "data": {
    "executionId": "cuid_...",
    "jobId": "job_id_..."
  }
}
```

### 14. Create Webhook

**Test**: Create webhook for workflow
```bash
curl -X POST http://localhost:3000/api/triggers/webhook/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST"
  }'
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Webhook created successfully",
  "data": {
    "webhook": {
      "id": "cuid_...",
      "workflowId": "cuid_...",
      "path": "/webhook/uuid-here",
      "method": "POST",
      "enabled": true,
      "createdAt": "2025-09-18T09:12:47.670Z"
    }
  }
}
```

### 15. List Webhooks

**Test**: Get workflow webhooks
```bash
curl -X GET http://localhost:3000/api/triggers/webhook/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 16. Webhook Trigger

**Test**: Trigger webhook (use the path from step 14)
```bash
curl -X POST http://localhost:3000/api/triggers/webhook/WEBHOOK_UUID \
  -H "Content-Type: application/json" \
  -d '{
    "webhookData": "This is webhook trigger data",
    "timestamp": "2025-09-18T09:12:47.670Z"
  }'
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Webhook received and workflow queued",
  "executionId": "cuid_...",
  "jobId": "job_id_..."
}
```

### 17. Get Execution Details

**Test**: Get execution status
```bash
curl -X GET http://localhost:3000/api/triggers/execution/EXECUTION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Execution retrieved successfully",
  "data": {
    "execution": {
      "id": "cuid_...",
      "workflowId": "cuid_...",
      "status": "SUCCESS",
      "startedAt": "2025-09-18T09:12:47.670Z",
      "finishedAt": "2025-09-18T09:12:48.670Z",
      "error": null,
      "data": {...},
      "workflow": {
        "id": "cuid_...",
        "title": "Test Workflow",
        "nodes": [...],
        "connections": [...]
      }
    }
  }
}
```

---

## ❌ Error Handling Tests

### 18. Invalid Authentication

**Test**: Access protected endpoint without token
```bash
curl -X GET http://localhost:3000/api/workflows
```

**Expected Response** (401):
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

### 19. Invalid Token

**Test**: Access with invalid token
```bash
curl -X GET http://localhost:3000/api/workflows \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response** (401):
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 20. Validation Errors

**Test**: Create workflow with invalid data
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "",
    "nodes": []
  }'
```

**Expected Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Workflow title is required"
    },
    {
      "field": "nodes",
      "message": "At least one node is required"
    }
  ]
}
```

### 21. Webhook Not Found

**Test**: Trigger non-existent webhook
```bash
curl -X POST http://localhost:3000/api/triggers/webhook/invalid-uuid \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Expected Response** (404):
```json
{
  "success": false,
  "message": "Webhook not found"
}
```

---

## 🧪 Test Scenarios

### Complete Workflow Test

1. **Register User** → Get JWT token
2. **Create Workflow** → Get workflow ID
3. **Create Webhook** → Get webhook path
4. **Trigger Webhook** → Execute workflow
5. **Check Execution** → Verify results

### Error Handling Test

1. **Test Invalid Inputs** → Verify validation
2. **Test Unauthorized Access** → Verify auth
3. **Test Non-existent Resources** → Verify 404s
4. **Test Server Errors** → Verify 500s

### Performance Test

1. **Multiple Concurrent Requests** → Test load handling
2. **Large Workflow Creation** → Test limits
3. **Queue Processing** → Test background jobs

---

## 📊 Expected Response Times

- **Health Check**: < 100ms
- **Authentication**: < 200ms
- **Workflow CRUD**: < 500ms
- **Webhook Trigger**: < 1000ms
- **Execution Status**: < 200ms

## 🔍 Monitoring

Check the console logs for:
- Database connection status
- Queue worker status
- Execution logs
- Error messages

## 📝 Notes

- Replace `YOUR_JWT_TOKEN` with actual JWT from login
- Replace `WORKFLOW_ID` with actual workflow ID
- Replace `WEBHOOK_UUID` with actual webhook UUID
- All timestamps are in ISO 8601 format
- All IDs are CUID format