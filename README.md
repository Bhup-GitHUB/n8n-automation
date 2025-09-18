# N8N Automation Platform

A Node.js-based automation platform similar to n8n, built with Express.js, TypeScript, and Bun runtime.

## 🚀 Features Implemented

### ✅ Core Features
- **User Authentication** - JWT-based registration and login
- **Workflow Management** - Create, read, update, delete workflows
- **Node System** - Support for TRIGGER, ACTION, and CONDITION nodes
- **Webhook Triggers** - Create and manage webhook endpoints
- **Manual Execution** - Trigger workflows manually via API
- **Background Processing** - BullMQ queue system for workflow execution
- **Database Integration** - PostgreSQL with Prisma ORM
- **RESTful API** - Complete REST API with proper error handling

### ✅ Technical Features
- **TypeScript** - Full type safety throughout the codebase
- **Bun Runtime** - Fast JavaScript runtime instead of Node.js
- **Redis Queue** - Background job processing with BullMQ
- **Database Migrations** - Prisma schema management
- **Input Validation** - Zod schema validation
- **Error Handling** - Comprehensive error handling and logging
- **CORS Support** - Cross-origin resource sharing enabled

## 🔧 Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Queue**: BullMQ + Redis
- **Validation**: Zod
- **Authentication**: JWT

## 🚧 Features Left to Implement

### 🔄 Workflow Engine
- [ ] **Scheduled Triggers** - Cron-based workflow scheduling
- [ ] **Email Triggers** - Email received triggers
- [ ] **Conditional Logic** - Advanced condition node execution
- [ ] **Loop Nodes** - Iteration and loop functionality
- [ ] **Error Handling Nodes** - Try-catch workflow blocks
- [ ] **Sub-workflows** - Nested workflow execution

### 🔌 Integrations
- [ ] **HTTP Actions** - Enhanced HTTP request capabilities
- [ ] **Email Actions** - Send email functionality
- [ ] **Slack Integration** - Send messages to Slack
- [ ] **GitHub Integration** - GitHub API actions
- [ ] **Telegram Bot** - Telegram message sending
- [ ] **Webhook Actions** - Send webhook requests

### 🎨 UI/UX
- [ ] **Web Dashboard** - Frontend interface for workflow management
- [ ] **Visual Workflow Builder** - Drag-and-drop workflow editor
- [ ] **Real-time Monitoring** - Live execution status updates
- [ ] **Execution History** - Detailed execution logs and results
- [ ] **User Management** - Admin panel for user management

### 🔒 Security & Performance
- [ ] **Rate Limiting** - API rate limiting
- [ ] **API Keys** - API key authentication
- [ ] **Webhook Signatures** - Webhook signature verification
- [ ] **Caching** - Redis caching for better performance
- [ ] **Monitoring** - Application monitoring and metrics
- [ ] **Logging** - Structured logging system

### 📊 Analytics & Reporting
- [ ] **Execution Analytics** - Workflow execution statistics
- [ ] **Performance Metrics** - Response time and success rates
- [ ] **Usage Reports** - User activity reports
- [ ] **Error Tracking** - Error monitoring and alerting

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

3. **Setup Database**
   ```bash
   bunx prisma db push
   bunx prisma generate
   ```

4. **Start Development Server**
   ```bash
   bun run dev
   ```

5. **Access API**
   - API Base URL: `http://localhost:3000`
   - Health Check: `GET /health`
   - API Docs: `GET /`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Workflows
- `GET /api/workflows` - List user workflows
- `POST /api/workflows` - Create workflow
- `GET /api/workflows/:id` - Get workflow details
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `PATCH /api/workflows/:id/toggle` - Enable/disable workflow
- `POST /api/workflows/:id/duplicate` - Duplicate workflow

### Triggers
- `POST /api/triggers/manual/:workflowId` - Manual execution
- `POST /api/triggers/webhook/:workflowId` - Create webhook
- `GET /api/triggers/webhook/:workflowId` - List webhooks
- `ALL /api/triggers/webhook/:uuid` - Webhook trigger endpoint
- `GET /api/triggers/execution/:executionId` - Get execution details

## 🧪 Testing

See `testcase.md` for comprehensive API testing examples.

## 📄 License

MIT License