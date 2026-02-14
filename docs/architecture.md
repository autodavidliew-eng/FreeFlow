# FreeFlow Architecture

## Overview

FreeFlow is a modern workflow and productivity platform built on a microservices architecture. The system enables users to manage tasks, monitor alarms, customize dashboards, and extend functionality through mini-applications.

## Architecture Principles

- **Separation of Concerns**: Each microservice owns its domain
- **API-First Design**: All services expose RESTful APIs
- **Event-Driven Communication**: Services communicate via message bus for async operations
- **Stateless Services**: Horizontal scaling without session affinity
- **Security by Design**: JWT-based authentication, RBAC authorization

## System Components

### Frontend Layer

#### **Next.js Portal** (`apps/web`)
- **Responsibility**: User-facing web application
- **Technology**: Next.js 15, React 19, TypeScript
- **Key Features**:
  - Server-side rendering for optimal performance
  - Client-side routing for seamless navigation
  - Real-time updates via WebSockets
  - Responsive design for mobile/desktop
- **Routes**:
  - `/` - Landing/home page
  - `/dashboard` - Personalized user dashboard
  - `/inbox` - Task management interface
  - `/alarms` - Notification center
  - `/miniapps` - Mini-application marketplace
  - `/profile` - User profile and settings

### Backend Layer

#### **API Gateway** (`apps/api`)
- **Responsibility**: Single entry point for all client requests
- **Technology**: NestJS, TypeScript
- **Key Features**:
  - Request routing to microservices
  - Authentication/authorization enforcement
  - Rate limiting and throttling
  - Request/response transformation
  - API documentation (Swagger/OpenAPI)
  - CORS handling
  - Request logging and monitoring
- **Port**: 4000
- **Base Path**: `/api/v1`

### Microservices

#### 1. **Auth Service** (`services/auth`)
- **Responsibility**: User identity and access management
- **Domain**: Authentication, authorization, user profiles
- **Key Features**:
  - User registration and login
  - JWT token generation and validation
  - Password reset and email verification
  - OAuth2/OIDC integration (Google, GitHub, etc.)
  - Role-based access control (RBAC)
  - Session management
- **Database**: PostgreSQL (users, roles, permissions)
- **Port**: 4001
- **Key Endpoints**:
  - `POST /auth/register` - User registration
  - `POST /auth/login` - User authentication
  - `POST /auth/refresh` - Token refresh
  - `GET /users/me` - Get current user profile
  - `PATCH /users/me` - Update user profile
  - `GET /users/{id}/permissions` - Get user permissions

#### 2. **Dashboard Service** (`services/dashboard`)
- **Responsibility**: Dashboard configuration and widget management
- **Domain**: Layouts, widgets, personalization
- **Key Features**:
  - Customizable dashboard layouts
  - Widget catalog and management
  - User preferences and themes
  - Dashboard templates
  - Widget data aggregation from other services
  - Real-time widget updates
- **Database**: PostgreSQL (layouts, widget configs)
- **Cache**: Redis (widget data cache)
- **Port**: 4002
- **Key Endpoints**:
  - `GET /dashboards/layout` - Get user's dashboard layout
  - `PUT /dashboards/layout` - Update dashboard layout
  - `GET /widgets` - List available widgets
  - `GET /widgets/{id}/data` - Get widget data
  - `POST /dashboards/templates` - Create dashboard template

#### 3. **Notification Service** (`services/notification`)
- **Responsibility**: Alert management and real-time notifications
- **Domain**: Alarms, alerts, push notifications
- **Key Features**:
  - Multi-channel notifications (email, SMS, push, in-app)
  - Alarm configuration and triggering
  - Notification preferences per user
  - Real-time WebSocket connections
  - Notification history and read status
  - Alert rules and scheduling
- **Database**: PostgreSQL (notifications, preferences)
- **Message Queue**: RabbitMQ or Redis Pub/Sub
- **Port**: 4003
- **Key Endpoints**:
  - `GET /alarms` - List user alarms
  - `POST /alarms` - Create new alarm
  - `PATCH /alarms/{id}` - Update alarm
  - `DELETE /alarms/{id}` - Delete alarm
  - `POST /alarms/{id}/snooze` - Snooze alarm
  - `GET /notifications` - Get notification history
  - `PATCH /notifications/{id}/read` - Mark as read

#### 4. **Task Service** (`services/task`)
- **Responsibility**: Task and inbox management
- **Domain**: Tasks, assignments, workflows
- **Key Features**:
  - Task creation, assignment, and tracking
  - Priority and deadline management
  - Task dependencies and subtasks
  - Inbox view with filtering and sorting
  - Task comments and attachments
  - Workflow automation
  - Task templates
- **Database**: PostgreSQL (tasks, assignments, comments)
- **Search**: Elasticsearch (optional, for advanced search)
- **Port**: 4004
- **Key Endpoints**:
  - `GET /inbox/tasks` - List user's tasks
  - `POST /tasks` - Create new task
  - `GET /tasks/{id}` - Get task details
  - `PATCH /tasks/{id}` - Update task
  - `DELETE /tasks/{id}` - Delete task
  - `POST /tasks/{id}/comments` - Add comment
  - `POST /tasks/{id}/assign` - Assign task to user

#### 5. **MiniApp Service** (`services/miniapp`)
- **Responsibility**: Mini-application ecosystem management
- **Domain**: Plugin management, app marketplace
- **Key Features**:
  - Mini-app catalog and discovery
  - App installation and lifecycle management
  - App permissions and sandboxing
  - App configuration per user
  - App marketplace with ratings/reviews
  - SDK for third-party developers
  - App versioning and updates
- **Database**: PostgreSQL (apps, installations, configs)
- **Storage**: S3 or MinIO (app packages, assets)
- **Port**: 4005
- **Key Endpoints**:
  - `GET /miniapps` - List available mini-apps
  - `POST /miniapps/install` - Install a mini-app
  - `DELETE /miniapps/{id}/uninstall` - Uninstall mini-app
  - `GET /miniapps/installed` - List user's installed apps
  - `GET /miniapps/{id}/config` - Get app configuration
  - `PUT /miniapps/{id}/config` - Update app configuration

## Data Flow

### Authentication Flow
1. User submits credentials to API Gateway
2. Gateway forwards to Auth Service
3. Auth Service validates credentials
4. Auth Service generates JWT token
5. Token returned to client
6. Client includes token in subsequent requests
7. Gateway validates token before routing

### Dashboard Loading Flow
1. User navigates to `/dashboard`
2. Portal requests layout from Gateway
3. Gateway fetches layout from Dashboard Service
4. Dashboard Service returns widget configuration
5. Portal requests data for each widget
6. Gateway routes widget data requests to appropriate services
7. Dashboard Service aggregates and caches responses
8. Portal renders dashboard with widget data

### Task Creation Flow
1. User creates task in Portal
2. Portal sends request to Gateway
3. Gateway routes to Task Service
4. Task Service creates task in database
5. Task Service publishes "task.created" event
6. Notification Service subscribes to event
7. Notification Service sends notification to assignee
8. Task Service returns created task to Portal

## Communication Patterns

### Synchronous (REST)
- Client → API Gateway → Microservices
- Used for: CRUD operations, queries, immediate responses

### Asynchronous (Events)
- Microservices → Message Bus → Subscribers
- Used for: Notifications, background processing, cross-service updates
- Events:
  - `user.registered`
  - `user.updated`
  - `task.created`
  - `task.assigned`
  - `task.completed`
  - `alarm.triggered`
  - `miniapp.installed`

### Real-time (WebSocket)
- Portal ↔ API Gateway ↔ Notification Service
- Used for: Live notifications, dashboard updates, presence

## Infrastructure Services

### Database
- **PostgreSQL** - Primary datastore for all services
- Each service has its own database/schema
- Connection pooling via PgBouncer

### Cache
- **Redis** - Distributed caching and session storage
- Widget data caching (5-minute TTL)
- Rate limiting counters
- Real-time presence tracking

### Message Queue
- **RabbitMQ** or **Redis Pub/Sub** - Event bus
- Topic-based routing
- Dead letter queues for failed messages
- Message persistence

### Storage
- **S3/MinIO** - Object storage
- Mini-app packages and assets
- User file uploads
- Static assets

## Security

### Authentication
- JWT-based authentication
- Access tokens (15 min expiry)
- Refresh tokens (7 days expiry)
- Token stored in httpOnly cookies

### Authorization
- Role-Based Access Control (RBAC)
- Roles: Admin, Manager, User, Guest
- Permissions checked at Gateway level
- Service-level permission validation

### Data Protection
- TLS/SSL for all communications
- Environment-based secrets management
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection (content security policy)

## Deployment

### Development
```
pnpm dev
# All services run locally on different ports
# Shared PostgreSQL and Redis instances
```

### Production (Docker)
```
pnpm docker:up
# Multi-container deployment
# Service discovery via Docker network
# Nginx reverse proxy
```

### Cloud (Kubernetes - Future)
- Each service as separate deployment
- Horizontal pod autoscaling
- Service mesh (Istio) for traffic management
- Managed databases (RDS, ElastiCache)

## Monitoring & Observability

### Logging
- Structured JSON logging
- Centralized log aggregation (ELK stack)
- Log levels: ERROR, WARN, INFO, DEBUG

### Metrics
- Prometheus for metrics collection
- Grafana for visualization
- Key metrics:
  - Request latency (p50, p95, p99)
  - Error rates
  - Service availability
  - Database connection pool usage

### Tracing
- Distributed tracing (Jaeger/Zipkin)
- Request correlation IDs
- Service dependency mapping

## Scalability Considerations

### Horizontal Scaling
- All services are stateless
- Load balancing via API Gateway
- Database read replicas for queries

### Caching Strategy
- Widget data cached in Redis
- CDN for static assets
- API response caching (conditional)

### Database Optimization
- Indexing on frequently queried fields
- Query optimization and EXPLAIN analysis
- Connection pooling
- Read/write splitting

## Future Enhancements

1. **GraphQL Gateway** - Alternative to REST for complex queries
2. **Event Sourcing** - Audit trail and replay capabilities
3. **CQRS** - Separate read/write models for performance
4. **Multi-tenancy** - Isolated workspaces per organization
5. **Mobile Apps** - React Native apps consuming same APIs
6. **AI/ML Integration** - Smart task suggestions, anomaly detection
7. **Workflow Engine** - Visual workflow builder with BPM
