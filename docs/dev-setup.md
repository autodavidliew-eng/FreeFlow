# FreeFlow Developer Setup Guide

Complete step-by-step guide to set up your FreeFlow development environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step-by-Step Setup](#step-by-step-setup)
- [Available Commands](#available-commands)
- [Service URLs](#service-urls)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

Before starting, ensure you have these installed:

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | 20.x+ | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8.x+ | `npm install -g pnpm` |
| **Docker** | 24.0+ | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.20+ | Included with Docker Desktop |
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com/) |

### Optional Tools

- **Make** - For using Makefile commands (usually pre-installed on macOS/Linux)
- **PostgreSQL Client** - For database management (`psql`)
- **MongoDB Client** - For database management (`mongosh`)

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 20GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## Quick Start

If you just want to get started quickly:

```bash
# 1. Clone and navigate to repository
git clone <repository-url>
cd FreeFlow

# 2. Install dependencies
make install
# or: pnpm install

# 3. Start development environment
make dev
# or: pnpm dev

# 4. Access applications
# Web: http://localhost:3000
# API: http://localhost:3001
```

That's it! Skip to [Service URLs](#service-urls) to see what's available.

## Step-by-Step Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd FreeFlow

# Verify you're in the right place
ls -la
# Should see: package.json, Makefile, apps/, packages/, infra/
```

### Step 2: Verify Prerequisites

```bash
# Check Node.js version (should be 20.x or higher)
node --version

# Check pnpm version (should be 8.x or higher)
pnpm --version

# Check Docker version
docker --version
docker compose version

# Check available memory for Docker
docker info | grep -i memory
# Should show at least 8GB
```

### Step 3: Install Dependencies

```bash
# Using Makefile (recommended)
make install

# Or using pnpm directly
pnpm install
```

**What this does:**
- Installs all npm dependencies for all workspaces
- Sets up workspace links
- Prepares development environment

**Expected output:**
```
✓ Dependencies installed
```

**Time:** ~2-5 minutes depending on internet speed

### Step 4: Start Infrastructure Services

```bash
# Start core infrastructure (PostgreSQL, MongoDB, Redis, RabbitMQ, Qdrant, Keycloak)
make up

# Or using npm script
pnpm infra:up
```

**What this does:**
- Starts all Docker containers
- Initializes databases with schemas and sample data
- Imports Keycloak realm configuration
- Loads RabbitMQ topology
- Runs healthchecks

**Expected output:**
```
Starting infrastructure services...
✓ Services started

Service Status:
  PostgreSQL:   http://localhost:5432
  MongoDB:      http://localhost:27017
  Redis:        http://localhost:6379
  RabbitMQ:     http://localhost:15672
  Qdrant:       http://localhost:6333
  Keycloak:     http://localhost:8080
```

**Time:** ~30-60 seconds for first start (includes image pulls and initialization)

### Step 5: Verify Services

```bash
# Check service health
make health

# Or check manually
docker compose -f infra/compose/docker-compose.yml ps
```

**Expected output:**
All services should show "healthy" status.

**If any services are unhealthy:**
1. Wait 30 seconds and check again (some services take time to initialize)
2. Check logs: `make logs`
3. See [Troubleshooting](#troubleshooting) section

### Step 6: Start Application Servers

```bash
# Start both web and API in development mode
make dev

# Or start individually
pnpm --filter web dev    # Web app on port 3000
pnpm --filter api dev    # API on port 3001
```

**What this does:**
- Starts Next.js web application with hot reload
- Starts NestJS API server with hot reload
- Watches for file changes
- Connects to infrastructure services

**Expected output:**
```
Starting FreeFlow development environment...
Starting infrastructure services...
✓ Services started

Starting application servers...
> web:dev: ready - started server on 0.0.0.0:3000
> api:dev: Nest application successfully started
```

### Step 7: Verify Setup

Open your browser and test:

1. **Web Application**: http://localhost:3000
   - Should show FreeFlow home page

2. **API Health**: http://localhost:3001/health
   - Should return `{"status":"ok"}`

3. **Keycloak Admin**: http://localhost:8080
   - Login: `admin` / `admin`
   - Should see Keycloak admin console
   - Switch realm to "freeflow" (top-left dropdown)

4. **RabbitMQ Management**: http://localhost:15672
   - Login: `freeflow` / `freeflow_dev_password`
   - Should see RabbitMQ management UI
   - Check Exchanges and Queues tabs

✅ **You're all set!** Your development environment is ready.

## Available Commands

### Using Makefile

```bash
# Development
make help          # Show all available commands
make install       # Install dependencies
make dev          # Start development environment (infra + apps)
make up           # Start infrastructure only
make down         # Stop all services
make restart      # Restart all services

# Monitoring
make logs         # View all logs
make logs-app     # View application logs only
make logs-infra   # View infrastructure logs only
make ps           # Show service status
make health       # Check service health
make status       # Show service URLs

# Database
make seed         # Seed databases (placeholder)
make backup       # Backup databases
make restore      # Restore databases from latest backups
make db-postgres  # Open PostgreSQL shell
make db-mongodb   # Open MongoDB shell
make db-redis     # Open Redis CLI

# Infrastructure Profiles
make up-camunda   # Start with Camunda workflow engine
make up-formio    # Start with Form.io server
make up-all       # Start everything

# Testing & Quality
make test         # Run all tests
make lint         # Run linter
make format       # Format code
make typecheck    # Type check

# Build
make build        # Build all applications
make build-web    # Build web app only
make build-api    # Build API only

# Cleanup
make reset        # Reset all data (⚠️ destructive)
make clean        # Clean build artifacts
make clean-all    # Clean everything including node_modules
make prune        # Remove unused Docker resources
```

### Using npm Scripts

```bash
# Development
pnpm dev          # Start development mode
pnpm build        # Build all apps
pnpm start        # Start in production mode
pnpm test         # Run tests

# Infrastructure
pnpm infra:up     # Start infrastructure
pnpm infra:down   # Stop infrastructure
pnpm infra:reset  # Reset infrastructure (⚠️ destructive)
pnpm infra:logs   # View infrastructure logs
pnpm infra:health # Check infrastructure health

# Code Quality
pnpm lint         # Run linter
pnpm lint:fix     # Fix linting issues
pnpm format       # Format code
pnpm typecheck    # Type check all packages

# Individual Apps
pnpm --filter web dev      # Start web app
pnpm --filter api dev      # Start API
pnpm --filter web build    # Build web app
pnpm --filter api build    # Build API
```

## Service URLs

### Core Infrastructure

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| PostgreSQL | `postgresql://localhost:5432` | `freeflow` / `freeflow_dev_password` | Relational database |
| MongoDB | `mongodb://localhost:27017` | `freeflow` / `freeflow_dev_password` | Document database |
| Redis | `redis://localhost:6379` | Password: `freeflow_dev_password` | Cache & sessions |
| RabbitMQ UI | http://localhost:15672 | `freeflow` / `freeflow_dev_password` | Message broker |
| Qdrant Dashboard | http://localhost:6333/dashboard | No auth | Vector database |
| Keycloak | http://localhost:8080 | `admin` / `admin` | Auth & IAM |

### Applications

| Service | URL | Description |
|---------|-----|-------------|
| Web App | http://localhost:3000 | Next.js frontend |
| API | http://localhost:3001 | NestJS backend |
| API Docs | http://localhost:3001/api | Swagger documentation |

### Optional Services (Profiles)

| Service | URL | Profile | Credentials |
|---------|-----|---------|-------------|
| Camunda Operate | http://localhost:8081 | `camunda` | - |
| Camunda Tasklist | http://localhost:8082 | `camunda` | - |
| Form.io | http://localhost:3001 | `formio` | `admin@example.com` / `admin` |

To start optional services:
```bash
make up-camunda  # Start with Camunda
make up-formio   # Start with Form.io
make up-all      # Start everything
```

## Common Workflows

### Daily Development

```bash
# Start your day
make up          # Start infrastructure
make dev         # Start applications

# While developing...
make logs        # Check logs if needed
make health      # Verify everything is working

# End of day
make down        # Stop services (keeps data)
# or Ctrl+C to stop applications
```

### Working with Databases

```bash
# PostgreSQL
make db-postgres
# Once in psql:
\c freeflow              # Connect to database
\dt app.*                # List tables
SELECT * FROM app.users; # Query data
\q                       # Quit

# MongoDB
make db-mongodb
# Once in mongosh:
use freeflow
db.users.find()
exit

# Redis
make db-redis
# Once in redis-cli:
KEYS *
GET key_name
exit
```

### Testing Keycloak Authentication

1. **Access Keycloak Admin Console**:
   ```bash
   open http://localhost:8080
   # Login: admin / admin
   ```

2. **Switch to FreeFlow Realm**:
   - Click dropdown in top-left (says "master")
   - Select "freeflow"

3. **Test Users Available**:
   - `admin@freeflow.dev` / `admin` (Admin role)
   - `operator@freeflow.dev` / `operator` (Operator role)
   - `viewer@freeflow.dev` / `viewer` (Viewer role)

4. **Test Authentication in Your App**:
   - Use the `freeflow-web` client
   - Redirect URI: `http://localhost:3000/*`
   - PKCE enabled (S256)

### Working with RabbitMQ

```bash
# Access management UI
open http://localhost:15672
# Login: freeflow / freeflow_dev_password

# Publish test event via CLI
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  publish exchange=freeflow.events routing_key=user.created \
  payload='{"userId":"123","action":"created"}'

# Check queue
rabbitmqadmin -u freeflow -p freeflow_dev_password -V /freeflow \
  list queues name messages
```

### Resetting Everything

```bash
# Stop services
make down

# Reset all data (⚠️ destructive - deletes all database data)
make reset

# Start fresh
make up

# Or do it all at once (with confirmation)
make reset && make up
```

### Running Tests

```bash
# All tests
make test

# Unit tests only
pnpm test:unit

# E2E tests only
pnpm test:e2e

# Watch mode
pnpm test:watch

# Specific workspace
pnpm --filter web test
pnpm --filter api test
```

### Code Quality Checks

```bash
# Before committing
make lint        # Check for linting errors
make format      # Format code
make typecheck   # Check TypeScript types

# Fix issues automatically
pnpm lint:fix
pnpm format

# Run all checks
make lint && make format && make typecheck && make test
```

### Building for Production

```bash
# Build all applications
make build

# Build specific app
make build-web
make build-api

# Or using pnpm
pnpm --filter web build
pnpm --filter api build

# Start in production mode (after building)
make prod
```

## Troubleshooting

### Services Won't Start

**Problem**: `make up` fails or services show as unhealthy.

**Solutions**:

1. **Check if ports are already in use**:
   ```bash
   lsof -i :5432  # PostgreSQL
   lsof -i :8080  # Keycloak
   lsof -i :3000  # Web app
   ```

   Kill processes using those ports or change ports in config.

2. **Check Docker is running**:
   ```bash
   docker info
   ```

   Start Docker Desktop if not running.

3. **Check available memory**:
   ```bash
   docker info | grep -i memory
   ```

   Increase Docker memory allocation to at least 8GB in Docker Desktop settings.

4. **View error logs**:
   ```bash
   make logs
   docker compose -f infra/compose/docker-compose.yml logs
   ```

5. **Try resetting**:
   ```bash
   make down
   make prune
   make up
   ```

### Database Connection Errors

**Problem**: Application can't connect to PostgreSQL/MongoDB.

**Solutions**:

1. **Verify services are running**:
   ```bash
   make ps
   ```

2. **Check connection strings** in `.env` files:
   ```bash
   cat apps/api/.env.example
   ```

3. **Test connection manually**:
   ```bash
   # PostgreSQL
   docker compose -f infra/compose/docker-compose.yml exec postgres \
     pg_isready -U freeflow

   # MongoDB
   docker compose -f infra/compose/docker-compose.yml exec mongodb \
     mongosh --eval "db.adminCommand('ping')"
   ```

4. **Wait for services to be ready** (check logs):
   ```bash
   make logs-postgres
   make logs-mongodb
   ```

### Keycloak Not Loading Realm

**Problem**: FreeFlow realm doesn't appear in Keycloak.

**Solutions**:

1. **Check if definitions file is mounted**:
   ```bash
   docker compose -f infra/compose/docker-compose.yml exec keycloak \
     ls -la /opt/keycloak/data/import/
   ```

2. **Check Keycloak logs**:
   ```bash
   make logs-keycloak | grep -i import
   ```

3. **Manually import realm**:
   - Go to http://localhost:8080
   - Click realm dropdown → "Create Realm"
   - Click "Browse" and select `infra/keycloak/freeflow-realm.json`
   - Click "Create"

### RabbitMQ Topology Not Loading

**Problem**: Exchanges/queues don't appear in RabbitMQ.

**Solutions**:

1. **Check if definitions are loaded**:
   ```bash
   curl -u freeflow:freeflow_dev_password \
     http://localhost:15672/api/exchanges/%2Ffreeflow | jq
   ```

2. **Restart RabbitMQ**:
   ```bash
   make restart-rabbitmq
   ```

3. **Manually import definitions**:
   ```bash
   curl -u freeflow:freeflow_dev_password \
     -H "Content-Type: application/json" \
     -X POST --data @infra/rabbitmq/definitions.json \
     http://localhost:15672/api/definitions/%2Ffreeflow
   ```

### pnpm Install Fails

**Problem**: `pnpm install` errors out.

**Solutions**:

1. **Clear pnpm cache**:
   ```bash
   pnpm store prune
   ```

2. **Delete lock file and try again**:
   ```bash
   rm pnpm-lock.yaml
   pnpm install
   ```

3. **Use Node.js 20.x**:
   ```bash
   node --version  # Should be 20.x or higher
   ```

4. **Check pnpm version**:
   ```bash
   pnpm --version  # Should be 8.x or higher
   pnpm self-update
   ```

### Port Conflicts

**Problem**: "Port already in use" errors.

**Solutions**:

1. **Find what's using the port**:
   ```bash
   lsof -i :3000  # or whatever port
   ```

2. **Kill the process**:
   ```bash
   kill -9 <PID>
   ```

3. **Change port** in configuration:
   - Web: Update `apps/web/.env` or `next.config.js`
   - API: Update `apps/api/.env` or `main.ts`

### Out of Memory

**Problem**: Docker containers crash or services become unresponsive.

**Solutions**:

1. **Increase Docker memory**:
   - Docker Desktop → Settings → Resources
   - Increase memory to 8GB minimum, 16GB recommended

2. **Restart Docker**:
   ```bash
   # macOS/Linux
   docker restart

   # Or restart Docker Desktop
   ```

3. **Clean up Docker**:
   ```bash
   make prune
   docker system prune -a --volumes
   ```

### Hot Reload Not Working

**Problem**: Code changes don't trigger rebuild.

**Solutions**:

1. **Check file watchers** (Linux):
   ```bash
   cat /proc/sys/fs/inotify/max_user_watches
   # Should be at least 524288

   # Increase if needed
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart development server**:
   ```bash
   # Stop with Ctrl+C, then:
   make dev
   ```

3. **Clear Next.js cache** (web app):
   ```bash
   rm -rf apps/web/.next
   ```

## Getting Help

### Documentation

- **Setup**: This file (`docs/dev-setup.md`)
- **Infrastructure**: `infra/compose/README.md`
- **Databases**: `infra/db/README.md`
- **Keycloak**: `infra/keycloak/README.md`
- **RabbitMQ**: `infra/rabbitmq/README.md`

### Commands

```bash
# Show all available commands
make help

# Show infrastructure commands
make -C infra/compose help

# Check service status
make status
```

### Debugging

```bash
# View all logs
make logs

# View specific service logs
make logs-postgres
make logs-mongodb
make logs-rabbitmq
make logs-keycloak

# Check health
make health

# Show service status
make ps
```

## Next Steps

Now that your environment is set up:

1. **Explore the codebase**:
   - `apps/web/` - Next.js frontend
   - `apps/api/` - NestJS backend
   - `packages/` - Shared packages

2. **Check out the documentation**:
   - API documentation: http://localhost:3001/api
   - Storybook (if available): http://localhost:6006

3. **Start developing**:
   - Create a new feature branch
   - Make your changes
   - Run tests: `make test`
   - Lint and format: `make lint && make format`
   - Commit your changes

4. **Learn the architecture**:
   - Read `docs/architecture.md` (if available)
   - Explore service integrations
   - Review database schemas

Happy coding! 🚀
