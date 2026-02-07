# Changelog

All notable changes to the FreeFlow Docker Compose infrastructure will be documented in this file.

## [1.0.0] - 2026-02-07

### Added

#### Core Infrastructure
- **Docker Compose configuration** with multi-service orchestration
- **Named volumes** for data persistence across all services
- **Healthchecks** for all services with appropriate intervals
- **Unified networking** with custom bridge network

#### Core Services
- **PostgreSQL 16** - Primary relational database
  - Multi-database initialization support
  - Custom schema creation (app, auth, workflow)
  - Sample tables and indexes
  - UUID and pgcrypto extensions enabled
- **MongoDB 7** - Document database
  - JSON schema validation
  - Collections: users, documents, workflows, forms
  - Full-text search indexes
  - Sample data for development
- **Redis 7** - In-memory cache and session store
  - Password authentication
  - AOF persistence enabled
  - Slow log monitoring
- **RabbitMQ 3.13** - Message broker
  - Management UI enabled (port 15672)
  - Custom virtual host (/freeflow)
  - Connection and channel limits configured
- **Qdrant 1.7.4** - Vector database
  - HTTP and gRPC APIs exposed
  - Dashboard UI available
  - Telemetry disabled for development
- **Keycloak 23.0** - Identity and access management
  - PostgreSQL backend
  - Realm import support
  - Pre-configured FreeFlow realm with sample users
  - OAuth2/OIDC client configurations

#### Optional Services (Profiles)

**Camunda 8 Profile** (`--profile camunda`)
- **Zeebe 8.4.0** - Workflow orchestration engine
  - Gateway API on port 26500
  - Elasticsearch exporter configured
- **Operate 8.4.0** - Workflow monitoring UI (port 8081)
- **Tasklist 8.4.0** - User task management UI (port 8082)
- **Elasticsearch 8.11.0** - Required by Camunda components

**Form.io Profile** (`--profile formio`)
- **Form.io Enterprise** - Dynamic form server (port 3001)
  - MongoDB integration
  - REST API for form management
  - Default admin credentials configured

#### Configuration Files
- **docker-compose.yml** - Main service definitions
- **docker-compose.override.yml** - Development-specific overrides
  - Enhanced logging for debugging
  - Debug ports exposed
  - Volume mounts for configuration
- **.env.example** - Environment variable template
- **.gitignore** - Prevents committing secrets and data

#### Initialization Scripts
- **PostgreSQL** - Database and schema initialization
  - Extension setup (uuid-ossp, pgcrypto, pg_trgm)
  - Schema creation (app, auth, workflow)
  - Sample tables with proper constraints
  - Triggers for updated_at timestamps
- **MongoDB** - Collections and indexes
  - Schema validation rules
  - Text search indexes
  - Sample user data

#### Service Configurations
- **Keycloak Realm** - Pre-configured FreeFlow realm
  - Two OAuth2 clients (freeflow-web, freeflow-api)
  - Roles: admin, user, manager
  - Two test users with credentials
- **RabbitMQ** - Custom configuration
  - Memory and disk limits
  - Connection pooling
  - Logging configuration

#### Documentation
- **README.md** - Comprehensive usage guide
  - Quick start instructions
  - Service descriptions and port mappings
  - Common operations (start, stop, logs, reset)
  - Troubleshooting guide
  - Health check procedures
- **Makefile** - Convenient command shortcuts
  - Service management commands
  - Profile-based startup
  - Backup and restore utilities
  - Health check automation
- **CHANGELOG.md** - Version history (this file)

#### Developer Experience
- **Makefile targets** for common operations:
  - `make up` - Start core services
  - `make camunda` - Start with Camunda
  - `make formio` - Start with Form.io
  - `make all` - Start everything
  - `make logs` - Tail all logs
  - `make health` - Check service health
  - `make reset` - Clean slate (destructive)
  - `make backup-postgres` - Database backup
  - `make urls` - Show all service URLs
- Color-coded output for better readability
- Interactive confirmations for destructive operations

### Configuration Defaults

All services use development-friendly defaults:
- **Passwords**: Simple, documented, easy to remember
- **Ports**: Standard ports where possible
- **Logging**: Info level with debug available
- **Resources**: Optimized for local development
- **Security**: Relaxed for development (SSL disabled)

⚠️ **Warning**: These defaults are NOT suitable for production use.

### Network Architecture

All services run on a custom bridge network (`freeflow_network`) allowing:
- Service-to-service communication via service names
- DNS resolution between containers
- Isolation from other Docker networks

### Volume Strategy

Named volumes with descriptive names:
- `freeflow_postgres_data` - PostgreSQL data
- `freeflow_mongodb_data` - MongoDB data
- `freeflow_redis_data` - Redis persistence
- `freeflow_rabbitmq_data` - RabbitMQ queues
- `freeflow_qdrant_data` - Vector embeddings
- `freeflow_keycloak_data` - Keycloak configuration
- `freeflow_elasticsearch_data` - Camunda search index
- `freeflow_zeebe_data` - Workflow instances

### Port Mappings Reference

| Service | Host Port | Container Port | Protocol |
|---------|-----------|----------------|----------|
| PostgreSQL | 5432 | 5432 | TCP |
| MongoDB | 27017 | 27017 | TCP |
| Redis | 6379 | 6379 | TCP |
| RabbitMQ AMQP | 5672 | 5672 | TCP |
| RabbitMQ Management | 15672 | 15672 | HTTP |
| Qdrant API | 6333 | 6333 | HTTP |
| Qdrant gRPC | 6334 | 6334 | gRPC |
| Keycloak | 8080 | 8080 | HTTP |
| Zeebe Gateway | 26500 | 26500 | gRPC |
| Zeebe Monitoring | 9600 | 9600 | HTTP |
| Operate | 8081 | 8080 | HTTP |
| Tasklist | 8082 | 8080 | HTTP |
| Elasticsearch | 9200, 9300 | 9200, 9300 | HTTP |
| Form.io | 3001 | 3001 | HTTP |

### Known Limitations

- Form.io uses enterprise image (may require license for production)
- Elasticsearch configured for single-node (not production-ready)
- All services use development credentials
- No TLS/SSL configured
- No external secrets management
- Resource limits not set

### Compatibility

- **Docker**: 24.0+
- **Docker Compose**: 2.20+
- **OS**: Linux, macOS, Windows (with WSL2)
- **Architecture**: AMD64, ARM64 (some images)

### Testing

Infrastructure tested with:
- ✅ Docker Desktop 4.25+ (macOS, Windows)
- ✅ Docker Engine 24.0+ (Linux)
- ✅ Podman 4.0+ (experimental)

## Future Considerations

### Planned Improvements
- [ ] Production-ready configurations
- [ ] External secrets management integration
- [ ] Monitoring stack (Prometheus, Grafana)
- [ ] Log aggregation (ELK stack)
- [ ] Resource limits and quotas
- [ ] TLS/SSL certificate generation
- [ ] Traefik reverse proxy
- [ ] Backup automation scripts
- [ ] CI/CD integration examples
- [ ] Performance tuning guides

### Under Consideration
- [ ] Additional database options (CockroachDB, TimescaleDB)
- [ ] Additional message brokers (Kafka, NATS)
- [ ] Additional caching layers (Memcached)
- [ ] Service mesh integration (Istio, Linkerd)
- [ ] Observability tools (Jaeger, Zipkin)

---

**Note**: This is an initial release focused on development experience. Production deployments should follow security best practices and use proper infrastructure management tools (Kubernetes, Terraform, etc.).
