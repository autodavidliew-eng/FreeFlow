# FreeFlow Docker Compose Infrastructure

Complete local development infrastructure for FreeFlow using Docker Compose.

## Table of Contents

- [Services Overview](#services-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Service Profiles](#service-profiles)
- [Port Mappings](#port-mappings)
- [Common Operations](#common-operations)
- [Service Management](#service-management)
- [Troubleshooting](#troubleshooting)

## Services Overview

### Core Services (Always Running)

- **PostgreSQL** - Relational database for application data
- **MongoDB** - Document database for flexible data storage
- **Redis** - In-memory cache and session store
- **RabbitMQ** - Message broker with management UI
- **Qdrant** - Vector database for AI/ML features
- **Keycloak** - Identity and access management with realm import support

### Optional Services (Profile-based)

- **Camunda 8** - Workflow orchestration platform
  - Zeebe (workflow engine)
  - Operate (workflow monitoring)
  - Tasklist (user task management)
  - Elasticsearch (required dependency)
- **Form.io** - Form management and rendering server

## Prerequisites

- Docker 24.0+ and Docker Compose 2.20+
- At least 8GB RAM available for Docker
- 20GB free disk space

Check your versions:

```bash
docker --version
docker compose version
```

## Quick Start

### Start Core Services Only

```bash
# From the project root
cd infra/compose

# Start all core services
docker compose up -d

# View logs
docker compose logs -f

# Check service health
docker compose ps
```

### Start with Optional Services

```bash
# Start with Camunda 8
docker compose --profile camunda up -d

# Start with Form.io
docker compose --profile formio up -d

# Start with both Camunda and Form.io
docker compose --profile camunda --profile formio up -d
```

## Service Profiles

Profiles allow you to start optional services on-demand:

| Profile | Services | Use Case |
|---------|----------|----------|
| `camunda` | Zeebe, Operate, Tasklist, Elasticsearch | Workflow orchestration and BPM |
| `formio` | Form.io Server | Dynamic form management |

### Examples

```bash
# Core services only
docker compose up -d

# Core + Camunda
docker compose --profile camunda up -d

# Core + Form.io
docker compose --profile formio up -d

# Everything
docker compose --profile camunda --profile formio up -d
```

## Port Mappings

### Core Services

| Service | Port(s) | Access URL | Credentials |
|---------|---------|------------|-------------|
| PostgreSQL | 5432 | `postgresql://localhost:5432` | `freeflow` / `freeflow_dev_password` |
| MongoDB | 27017 | `mongodb://localhost:27017` | `freeflow` / `freeflow_dev_password` |
| Redis | 6379 | `redis://localhost:6379` | Password: `freeflow_dev_password` |
| RabbitMQ | 5672, 15672 | http://localhost:15672 | `freeflow` / `freeflow_dev_password` |
| Qdrant | 6333, 6334 | http://localhost:6333/dashboard | No auth (dev mode) |
| Keycloak | 8080 | http://localhost:8080 | `admin` / `admin` |

### Camunda Services (Profile: `camunda`)

| Service | Port(s) | Access URL | Notes |
|---------|---------|------------|-------|
| Zeebe | 26500, 9600 | `grpc://localhost:26500` | Gateway API |
| Operate | 8081 | http://localhost:8081 | Workflow monitoring |
| Tasklist | 8082 | http://localhost:8082 | User tasks |
| Elasticsearch | 9200, 9300 | http://localhost:9200 | Camunda dependency |

### Form.io (Profile: `formio`)

| Service | Port | Access URL | Credentials |
|---------|------|------------|-------------|
| Form.io | 3001 | http://localhost:3001 | `admin@example.com` / `admin` |

## Common Operations

### Starting Services

```bash
# Start in background
docker compose up -d

# Start with logs in foreground
docker compose up

# Start specific services
docker compose up -d postgres mongodb redis

# Start with profiles
docker compose --profile camunda up -d
```

### Stopping Services

```bash
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps data)
docker compose down

# Stop specific services
docker compose stop keycloak rabbitmq
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 -f

# Since last 10 minutes
docker compose logs --since 10m

# Multiple services
docker compose logs -f postgres mongodb redis
```

### Health Checks

```bash
# Check service status and health
docker compose ps

# Detailed service inspection
docker compose ps --format json | jq '.'

# Check specific service
docker inspect freeflow-postgres --format='{{.State.Health.Status}}'
```

## Service Management

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart postgres

# Restart with rebuild
docker compose up -d --force-recreate postgres
```

### Reset Data (⚠️ Destructive)

```bash
# Stop and remove everything including volumes
docker compose down -v

# Remove only specific volumes
docker volume rm freeflow_postgres_data
docker volume rm freeflow_mongodb_data

# Nuclear option - remove all FreeFlow volumes
docker volume ls | grep freeflow | awk '{print $2}' | xargs docker volume rm

# Then restart fresh
docker compose up -d
```

### Update Images

```bash
# Pull latest images
docker compose pull

# Rebuild and restart
docker compose up -d --build
```

### Access Service Shells

```bash
# PostgreSQL
docker compose exec postgres psql -U freeflow -d freeflow

# MongoDB
docker compose exec mongodb mongosh -u freeflow -p freeflow_dev_password

# Redis
docker compose exec redis redis-cli -a freeflow_dev_password

# RabbitMQ
docker compose exec rabbitmq rabbitmqctl status

# Shell access
docker compose exec postgres bash
```

## Configuration

### Keycloak Realm Import

To import a Keycloak realm on startup:

1. Create realm export JSON file
2. Place in `infra/compose/keycloak/realms/`
3. Restart Keycloak:

```bash
mkdir -p keycloak/realms
# Copy your realm-export.json to keycloak/realms/
docker compose restart keycloak
```

### RabbitMQ Custom Configuration

Create `config/rabbitmq/rabbitmq.conf`:

```bash
mkdir -p config/rabbitmq
cat > config/rabbitmq/rabbitmq.conf << 'EOF'
# Logging
log.console.level = info

# Memory and disk thresholds
vm_memory_high_watermark.relative = 0.6
disk_free_limit.relative = 1.0

# Connection limits
connection_max = 1000
channel_max = 128
EOF

docker compose restart rabbitmq
```

### Database Initialization Scripts

Create initialization scripts that run on first start:

```bash
# PostgreSQL
mkdir -p init-scripts/postgres
cat > init-scripts/postgres/01-init.sql << 'EOF'
-- Your initialization SQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

# MongoDB
mkdir -p init-scripts/mongodb
cat > init-scripts/mongodb/01-init.js << 'EOF'
// Your initialization JavaScript
db.createCollection('users');
EOF
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs for errors
docker compose logs

# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Keycloak

# Verify Docker resources
docker system df
docker system prune
```

### Keycloak Fails to Connect to PostgreSQL

```bash
# Wait for PostgreSQL to be ready
docker compose up -d postgres
docker compose exec postgres pg_isready -U freeflow

# Then start Keycloak
docker compose up -d keycloak
```

### Out of Memory Errors

```bash
# Check Docker memory settings
docker info | grep -i memory

# Increase Docker Desktop memory allocation (recommended: 8GB+)
# Reduce Elasticsearch heap size in docker-compose.yml:
# ES_JAVA_OPTS=-Xms256m -Xmx256m
```

### Permission Errors

```bash
# Fix volume permissions
docker compose down
sudo chown -R $(id -u):$(id -g) ./keycloak ./config

docker compose up -d
```

### Reset Specific Service

```bash
# Example: Reset PostgreSQL
docker compose stop postgres
docker volume rm freeflow_postgres_data
docker compose up -d postgres
```

### Check Service Dependencies

```bash
# Verify service startup order
docker compose config --services

# Check service dependencies
docker compose config | grep -A 5 depends_on
```

## Performance Tips

### Development Mode

For faster startup and lower resource usage:

1. Disable unused services
2. Reduce healthcheck intervals
3. Use fewer Camunda components

### Production Considerations

This setup is for **development only**. For production:

- Change all default passwords
- Use proper secrets management
- Enable TLS/SSL
- Configure proper backups
- Use external volumes for data persistence
- Review and harden security settings
- Set resource limits (CPU/memory)
- Use production-grade images

## Environment Variables

Default credentials (⚠️ **CHANGE IN PRODUCTION**):

```bash
# PostgreSQL
POSTGRES_USER=freeflow
POSTGRES_PASSWORD=freeflow_dev_password

# MongoDB
MONGO_INITDB_ROOT_USERNAME=freeflow
MONGO_INITDB_ROOT_PASSWORD=freeflow_dev_password

# Redis
REDIS_PASSWORD=freeflow_dev_password

# RabbitMQ
RABBITMQ_DEFAULT_USER=freeflow
RABBITMQ_DEFAULT_PASS=freeflow_dev_password

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Form.io
ROOT_EMAIL=admin@example.com
ROOT_PASSWORD=admin
```

## Useful Commands Cheatsheet

```bash
# Quick start
docker compose up -d

# Start with Camunda
docker compose --profile camunda up -d

# View all logs
docker compose logs -f

# Stop everything
docker compose down

# Nuclear reset (⚠️ deletes all data)
docker compose down -v

# Check health
docker compose ps

# Restart one service
docker compose restart postgres

# Update images
docker compose pull && docker compose up -d

# Remove unused resources
docker system prune -a
```

## Support

For issues specific to:
- Docker Compose setup: Check this README
- Service configuration: Refer to official service documentation
- FreeFlow application: Check main project README

## References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Camunda 8 Documentation](https://docs.camunda.io/)
- [Form.io Documentation](https://help.form.io/)
