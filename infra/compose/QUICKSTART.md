# FreeFlow Docker Compose - Quick Start Guide

## 🚀 Get Started in 30 Seconds

```bash
cd infra/compose

# Start core services
make up

# Or use docker compose directly
docker compose up -d
```

Visit:
- **Keycloak**: http://localhost:8080 (admin/admin)
- **RabbitMQ**: http://localhost:15672 (freeflow/freeflow_dev_password)
- **Qdrant**: http://localhost:6333/dashboard

## 📦 What's Included

### Core Services (Always Running)
✅ PostgreSQL - Database
✅ MongoDB - Document store
✅ Redis - Cache
✅ RabbitMQ - Message broker
✅ Qdrant - Vector database
✅ Keycloak - Auth & IAM

### Optional Services (via Profiles)
🔧 Camunda 8 - Workflow engine
📝 Form.io - Form management

## 🎯 Common Commands

```bash
# Start with workflow engine
make camunda
# OR
docker compose --profile camunda up -d

# Start with forms
make formio
# OR
docker compose --profile formio up -d

# Start everything
make all
# OR
docker compose --profile camunda --profile formio up -d

# View logs
make logs
# OR
docker compose logs -f

# Check health
make health
# OR
docker compose ps

# Stop (keeps data)
make down

# Reset everything (⚠️ deletes data)
make reset
```

## 🔧 Useful Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make up` | Start core services |
| `make down` | Stop all services |
| `make logs` | Tail all logs |
| `make ps` | Show service status |
| `make health` | Check health status |
| `make urls` | Show all service URLs |
| `make shell-postgres` | Open PostgreSQL shell |
| `make shell-mongo` | Open MongoDB shell |
| `make backup-postgres` | Backup PostgreSQL |
| `make check` | Run health checks |
| `make dev` | Quick dev startup |

## 🔑 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | freeflow | freeflow_dev_password |
| MongoDB | freeflow | freeflow_dev_password |
| Redis | - | freeflow_dev_password |
| RabbitMQ | freeflow | freeflow_dev_password |
| Keycloak | admin | admin |
| Form.io | admin@example.com | admin |

## 🔌 Port Reference

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | postgresql://localhost:5432 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |
| RabbitMQ | 15672 | http://localhost:15672 |
| Qdrant | 6333 | http://localhost:6333 |
| Keycloak | 8080 | http://localhost:8080 |
| Zeebe | 26500 | grpc://localhost:26500 |
| Operate | 8081 | http://localhost:8081 |
| Tasklist | 8082 | http://localhost:8082 |
| Form.io | 3001 | http://localhost:3001 |

## 🩺 Troubleshooting

### Services won't start?
```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :8080  # Keycloak

# View error logs
docker compose logs <service-name>

# Reset and try again
make reset
make up
```

### Out of memory?
```bash
# Check Docker resources
docker system df

# Prune unused resources
make prune

# Start only needed services
docker compose up -d postgres mongodb redis
```

### Need a clean slate?
```bash
# ⚠️ This deletes ALL data
make reset

# Then start fresh
make up
```

## 📚 More Information

- Full documentation: [README.md](README.md)
- Configuration details: [docker-compose.yml](docker-compose.yml)
- Dev overrides: [docker-compose.override.yml](docker-compose.override.yml)
- Change history: [CHANGELOG.md](CHANGELOG.md)

## ⚠️ Important Notes

1. **Development Only** - These configs are NOT production-ready
2. **Change Passwords** - Default credentials are insecure
3. **Data Persistence** - Use named volumes, data survives restarts
4. **Profiles** - Optional services only start when profile is active
5. **Healthchecks** - Services wait for dependencies to be healthy

## 🎓 Examples

### Full-stack development setup
```bash
# Start core + workflow engine
make camunda

# Watch logs in separate terminal
make logs

# Open PostgreSQL shell
make shell-postgres
```

### Form-heavy application
```bash
# Start core + forms
make formio

# Check all services are healthy
make health

# View Form.io logs
docker compose logs -f formio
```

### Working with Keycloak
```bash
# Start services
make up

# Wait for Keycloak to be ready (check logs)
make logs-keycloak

# Access Keycloak admin console
open http://localhost:8080

# View imported realm
# Login: admin/admin
# Realm: freeflow
```

### Database operations
```bash
# Connect to PostgreSQL
make shell-postgres
# Then: SELECT * FROM app.users;

# Connect to MongoDB
make shell-mongo
# Then: db.users.find()

# Backup databases
make backup-postgres
make backup-mongodb

# Backups stored in ./backups/
```

## 🚧 Need Help?

1. Check [README.md](README.md) troubleshooting section
2. Review logs: `make logs`
3. Check service health: `make health`
4. Reset if needed: `make reset && make up`

## 🎉 You're Ready!

Your FreeFlow infrastructure is ready for development. Happy coding! 🚀
