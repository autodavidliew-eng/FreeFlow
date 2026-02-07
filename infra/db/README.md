# FreeFlow Database Initialization

Comprehensive database initialization scripts for local development environment.

## Overview

This directory contains initialization scripts for all databases used in FreeFlow:

- **PostgreSQL** - Relational database (users, organizations, audit logs)
- **MongoDB** - Document database (documents, workflows, forms)
- **Qdrant** - Vector database (semantic search, embeddings)

## Directory Structure

```
infra/db/
├── README.md              # This file
├── postgres/
│   └── init.sql          # PostgreSQL initialization
├── mongo/
│   └── init.js           # MongoDB initialization
└── qdrant/
    └── README.md         # Qdrant setup guide
```

## How It Works

### Automatic Initialization

When using Docker Compose, these scripts run **automatically on first container startup**:

1. **PostgreSQL**: Scripts in `/docker-entrypoint-initdb.d/` execute once
2. **MongoDB**: Scripts in `/docker-entrypoint-initdb.d/` execute once
3. **Qdrant**: Collections created via application code (see qdrant/README.md)

### Docker Compose Integration

The scripts are already mounted in `infra/compose/docker-compose.yml`:

```yaml
postgres:
  volumes:
    - ../../db/postgres:/docker-entrypoint-initdb.d:ro

mongodb:
  volumes:
    - ../../db/mongo:/docker-entrypoint-initdb.d:ro
```

## Quick Start

### Start Fresh with Initialization

```bash
cd infra/compose

# Start all services
make up

# Or with docker compose directly
docker compose up -d

# Watch initialization logs
docker compose logs -f postgres mongodb
```

The initialization scripts will run automatically when the containers start for the first time.

## PostgreSQL Initialization

### What Gets Created

**Databases:**
- `freeflow` - Main application database
- `keycloak` - Authentication service database
- `camunda` - Workflow engine database (optional)

**Users:**
- `freeflow` (password: `freeflow_dev_password`) - Application user
- `keycloak_user` (password: `keycloak_dev_password`) - Keycloak user
- `camunda_user` (password: `camunda_dev_password`) - Camunda user

**Schemas in `freeflow` database:**
- `app` - Core application tables
- `auth` - Authentication/authorization data
- `workflow` - Workflow-related tables
- `audit` - Audit trails and logs

**Tables:**
- `app.users` - User accounts
- `app.organizations` - Organizations/tenants
- `app.user_organizations` - User-org relationships
- `audit.logs` - Audit trail

**Features:**
- UUID, pgcrypto, and trigram extensions enabled
- Indexes for performance
- Auto-updating timestamps
- Sample data for development

### Connecting to PostgreSQL

```bash
# Via docker compose
make shell-postgres

# Or directly
docker compose exec postgres psql -U freeflow -d freeflow

# Connection string
postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow
```

### Verify Initialization

```sql
-- List databases
\l

-- Connect to freeflow database
\c freeflow

-- List schemas
\dn

-- List tables in app schema
\dt app.*

-- Check sample data
SELECT * FROM app.users;
SELECT * FROM app.organizations;
```

## MongoDB Initialization

### What Gets Created

**Databases:**
- `freeflow` - Main application database
- `formio` - Form.io server database (optional)

**Users:**
- `freeflow_admin` (password: `freeflow_admin_password`) - Admin user
- `freeflow_user` (password: `freeflow_user_password`) - Application user
- `formio_user` (password: `formio_user_password`) - Form.io user

**Collections in `freeflow` database:**
- `users` - User profiles and preferences
- `documents` - Document storage
- `workflows` - Workflow definitions
- `forms` - Form schemas
- `organizations` - Organization data

**Features:**
- JSON schema validation on all collections
- Full-text search indexes
- Compound indexes for performance
- Sample data for development

### Connecting to MongoDB

```bash
# Via docker compose
make shell-mongo

# Or directly
docker compose exec mongodb mongosh -u freeflow_user -p freeflow_user_password

# Connection string
mongodb://freeflow_user:freeflow_user_password@localhost:27017/freeflow
```

### Verify Initialization

```javascript
// List databases
show dbs

// Use freeflow database
use freeflow

// List collections
show collections

// Check sample data
db.users.find().pretty()
db.organizations.find().pretty()

// Check indexes
db.users.getIndexes()
```

## Qdrant Setup

Qdrant does not use initialization scripts. Collections are created programmatically by your application.

See [qdrant/README.md](./qdrant/README.md) for:
- Creating collections via API
- Recommended collection configurations
- Integration examples (NestJS, Next.js)
- Production considerations

### Quick Qdrant Check

```bash
# List collections (should be empty initially)
curl http://localhost:6333/collections

# Access dashboard
open http://localhost:6333/dashboard
```

## Development Credentials

⚠️ **WARNING: These credentials are for DEVELOPMENT ONLY!**

### PostgreSQL

| User | Password | Database | Purpose |
|------|----------|----------|---------|
| freeflow | freeflow_dev_password | freeflow | Application |
| keycloak_user | keycloak_dev_password | keycloak | Keycloak |
| camunda_user | camunda_dev_password | camunda | Camunda |

### MongoDB

| User | Password | Database | Roles |
|------|----------|----------|-------|
| freeflow | freeflow_dev_password | admin | Root (from env) |
| freeflow_admin | freeflow_admin_password | admin | Admin everywhere |
| freeflow_user | freeflow_user_password | freeflow | App database |
| formio_user | formio_user_password | formio | Form.io database |

### Production Security

Before deploying to production:

1. ✅ Change all default passwords
2. ✅ Use strong, randomly generated passwords
3. ✅ Store credentials in a secret manager (AWS Secrets Manager, HashiCorp Vault)
4. ✅ Enable SSL/TLS connections
5. ✅ Restrict network access
6. ✅ Enable audit logging
7. ✅ Regular security updates
8. ✅ Implement backup strategy
9. ✅ Follow principle of least privilege
10. ✅ Enable authentication on Qdrant

## Resetting Databases

### Reset All Data (Nuclear Option)

⚠️ **This deletes ALL data!**

```bash
cd infra/compose

# Stop and remove everything including volumes
make reset

# Or manually
docker compose down -v

# Start fresh (init scripts will run again)
make up
```

### Reset Specific Database

```bash
# Stop services
docker compose stop postgres mongodb

# Remove specific volume
docker volume rm freeflow_postgres_data
docker volume rm freeflow_mongodb_data

# Restart (init scripts will run)
docker compose up -d postgres mongodb
```

### Re-run Init Scripts

Init scripts only run if the data directory is empty. To re-run:

1. Stop the service
2. Remove the volume
3. Start the service

```bash
# Example: Reset PostgreSQL
docker compose stop postgres
docker volume rm freeflow_postgres_data
docker compose up -d postgres
docker compose logs -f postgres
```

## Backup and Restore

### PostgreSQL Backup

```bash
# Backup via Makefile
make backup-postgres

# Or manually
docker compose exec -T postgres pg_dump -U freeflow freeflow > backup.sql

# Backup with compression
docker compose exec -T postgres pg_dump -U freeflow freeflow | gzip > backup.sql.gz
```

### PostgreSQL Restore

```bash
# Restore from backup
docker compose exec -T postgres psql -U freeflow -d freeflow < backup.sql

# Or with gunzip
gunzip -c backup.sql.gz | docker compose exec -T postgres psql -U freeflow -d freeflow
```

### MongoDB Backup

```bash
# Backup via Makefile
make backup-mongodb

# Or manually
docker compose exec -T mongodb mongodump \
  --username=freeflow_user \
  --password=freeflow_user_password \
  --authenticationDatabase=admin \
  --db=freeflow \
  --archive > backup.dump

# Backup specific collection
docker compose exec -T mongodb mongodump \
  --username=freeflow_user \
  --password=freeflow_user_password \
  --authenticationDatabase=admin \
  --db=freeflow \
  --collection=users \
  --archive > users_backup.dump
```

### MongoDB Restore

```bash
# Restore from backup
docker compose exec -T mongodb mongorestore \
  --username=freeflow_user \
  --password=freeflow_user_password \
  --authenticationDatabase=admin \
  --db=freeflow \
  --archive < backup.dump
```

### Qdrant Backup

```bash
# Create snapshot via API
curl -X POST "http://localhost:6333/collections/documents/snapshots"

# List snapshots
curl "http://localhost:6333/collections/documents/snapshots"

# Download snapshot
curl "http://localhost:6333/collections/documents/snapshots/snapshot_name" \
  --output qdrant_backup.tar
```

## Customizing Init Scripts

### Modify PostgreSQL Schema

Edit `postgres/init.sql`:

```sql
-- Add your custom tables
CREATE TABLE IF NOT EXISTS app.custom_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

Then reset the database to apply changes:

```bash
docker compose stop postgres
docker volume rm freeflow_postgres_data
docker compose up -d postgres
```

### Modify MongoDB Collections

Edit `mongo/init.js`:

```javascript
// Add custom collection
db.createCollection('custom_collection', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Add indexes
db.custom_collection.createIndex({ name: 1 }, { unique: true });
```

Then reset MongoDB to apply changes.

## Troubleshooting

### Init Scripts Not Running

**Problem**: Scripts don't execute on container start.

**Solution**: Init scripts only run if the data directory is empty.

```bash
# Reset the database
docker compose stop postgres
docker volume rm freeflow_postgres_data
docker compose up -d postgres
```

### Permission Errors

**Problem**: Can't read/write init scripts.

**Solution**: Check file permissions.

```bash
# Make scripts readable
chmod 644 infra/db/postgres/init.sql
chmod 644 infra/db/mongo/init.js

# Verify mount
docker compose exec postgres ls -la /docker-entrypoint-initdb.d/
```

### Connection Refused

**Problem**: Can't connect to database from host.

**Solution**: Wait for database to be ready.

```bash
# Check health
docker compose ps

# Wait for healthy status
docker compose up -d postgres
sleep 10

# Test connection
docker compose exec postgres pg_isready -U freeflow
```

### Script Errors

**Problem**: Init script fails with errors.

**Solution**: Check logs for details.

```bash
# View initialization logs
docker compose logs postgres
docker compose logs mongodb

# Look for specific errors
docker compose logs postgres | grep ERROR
docker compose logs mongodb | grep error
```

### Database Already Exists

**Problem**: "database already exists" error.

**Solution**: Scripts handle this gracefully with `IF NOT EXISTS` checks. If you see this error, it's safe to ignore - the database is already initialized.

## Testing Database Setup

### Test PostgreSQL

```bash
# Connect and run tests
docker compose exec postgres psql -U freeflow -d freeflow -c "
SELECT
    'Database: ' || current_database() as info
UNION ALL
SELECT
    'User: ' || current_user
UNION ALL
SELECT
    'Schemas: ' || string_agg(schema_name, ', ')
FROM information_schema.schemata
WHERE schema_name IN ('app', 'auth', 'workflow', 'audit');
"
```

### Test MongoDB

```bash
# Connect and run tests
docker compose exec mongodb mongosh -u freeflow_user -p freeflow_user_password --eval "
db = db.getSiblingDB('freeflow');
print('Database:', db.getName());
print('Collections:', db.getCollectionNames().join(', '));
print('User count:', db.users.countDocuments());
"
```

### Test Qdrant

```bash
# Check if Qdrant is accessible
curl http://localhost:6333/collections

# Check health
curl http://localhost:6333/health
```

## Environment Variables

Set these in your application `.env`:

```bash
# PostgreSQL
DATABASE_URL=postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow
KEYCLOAK_DB_URL=postgresql://keycloak_user:keycloak_dev_password@localhost:5432/keycloak

# MongoDB
MONGODB_URL=mongodb://freeflow_user:freeflow_user_password@localhost:27017/freeflow
MONGODB_DATABASE=freeflow

# Qdrant
QDRANT_URL=http://localhost:6333
```

## Next Steps

1. **Start Services**: `cd infra/compose && make up`
2. **Verify Initialization**: Check logs and connect to each database
3. **Run Application**: Connect your app using the connection strings
4. **Create Qdrant Collections**: Use application code or API calls
5. **Test Everything**: Verify data access and operations

## References

- [PostgreSQL Docker Documentation](https://hub.docker.com/_/postgres)
- [MongoDB Docker Documentation](https://hub.docker.com/_/mongo)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Quick Reference

```bash
# Start everything
cd infra/compose && make up

# Connect to databases
make shell-postgres
make shell-mongo

# Reset all data (⚠️ destructive)
make reset

# Backup databases
make backup-postgres
make backup-mongodb

# View logs
docker compose logs -f postgres mongodb

# Check health
docker compose ps
make health
```
