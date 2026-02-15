-- ============================================================================
-- FreeFlow PostgreSQL Initialization Script
-- ============================================================================
-- This script runs automatically on first container startup via Docker's
-- /docker-entrypoint-initdb.d/ directory.
--
-- ⚠️  DEV ONLY: Uses simple credentials. NEVER use these in production!
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram matching for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN index support for btree types
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- GIST index support for btree types

\echo '✓ PostgreSQL extensions enabled'

-- ============================================================================
-- CREATE DATABASES
-- ============================================================================

-- Application database (if not already created by POSTGRES_DB env var)
-- This is the main FreeFlow application database
SELECT 'CREATE DATABASE freeflow' WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'freeflow'
)\gexec

-- Keycloak database
-- Separate database for Keycloak to isolate authentication data
SELECT 'CREATE DATABASE keycloak' WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'keycloak'
)\gexec

-- Camunda database (optional, for workflow engine)
-- Only needed if using Camunda profile
SELECT 'CREATE DATABASE camunda' WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'camunda'
)\gexec

-- OpenFGA database
SELECT 'CREATE DATABASE openfga' WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'openfga'
)\gexec

\echo '✓ Databases created'

-- ============================================================================
-- CREATE USERS
-- ============================================================================

-- Check if user exists before creating
DO
$$
BEGIN
    -- Application user
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'freeflow') THEN
        CREATE USER freeflow WITH PASSWORD 'freeflow_dev_password';
        RAISE NOTICE '✓ User "freeflow" created';
    ELSE
        RAISE NOTICE '→ User "freeflow" already exists';
    END IF;

    -- Keycloak user (can use same credentials for dev)
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'keycloak_user') THEN
        CREATE USER keycloak_user WITH PASSWORD 'keycloak_dev_password';
        RAISE NOTICE '✓ User "keycloak_user" created';
    ELSE
        RAISE NOTICE '→ User "keycloak_user" already exists';
    END IF;

    -- Camunda user (optional)
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'camunda_user') THEN
        CREATE USER camunda_user WITH PASSWORD 'camunda_dev_password';
        RAISE NOTICE '✓ User "camunda_user" created';
    ELSE
        RAISE NOTICE '→ User "camunda_user" already exists';
    END IF;

    -- OpenFGA user (optional)
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'openfga_user') THEN
        CREATE USER openfga_user WITH PASSWORD 'openfga_dev_password';
        RAISE NOTICE '✓ User "openfga_user" created';
    ELSE
        RAISE NOTICE '→ User "openfga_user" already exists';
    END IF;
END
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant all privileges on databases to respective users
GRANT ALL PRIVILEGES ON DATABASE freeflow TO freeflow;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO freeflow; -- Allow app to read keycloak data if needed
GRANT ALL PRIVILEGES ON DATABASE camunda TO camunda_user;
GRANT ALL PRIVILEGES ON DATABASE openfga TO openfga_user;
GRANT ALL PRIVILEGES ON DATABASE openfga TO freeflow;

\echo '✓ Permissions granted'

-- ============================================================================
-- CONNECT TO FREEFLOW DATABASE AND SET UP SCHEMAS
-- ============================================================================

\c freeflow

-- Create schemas for application
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION freeflow;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION freeflow;
CREATE SCHEMA IF NOT EXISTS workflow AUTHORIZATION freeflow;
CREATE SCHEMA IF NOT EXISTS audit AUTHORIZATION freeflow;

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA app TO freeflow;
GRANT ALL PRIVILEGES ON SCHEMA auth TO freeflow;
GRANT ALL PRIVILEGES ON SCHEMA workflow TO freeflow;
GRANT ALL PRIVILEGES ON SCHEMA audit TO freeflow;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA workflow GRANT ALL ON TABLES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA workflow GRANT ALL ON SEQUENCES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON TABLES TO freeflow;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON SEQUENCES TO freeflow;

\echo '✓ Schemas created in freeflow database'

-- ============================================================================
-- CREATE CORE TABLES (OPTIONAL - REMOVE IF USING ORM MIGRATIONS)
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS app.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Organizations table
CREATE TABLE IF NOT EXISTS app.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Organization relationship
CREATE TABLE IF NOT EXISTS app.user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'Admin', 'Operator', 'Viewer'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

\echo '✓ Core tables created'

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON app.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON app.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON app.users(is_active) WHERE is_active = true;

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON app.organizations USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON app.organizations(is_active) WHERE is_active = true;

-- User-Organizations indexes
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_id ON app.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org_id ON app.user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_role ON app.user_organizations(role);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit.logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit.logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit.logs USING gin(metadata);

\echo '✓ Indexes created'

-- ============================================================================
-- CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log changes to audit table
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.logs (
        action,
        resource_type,
        resource_id,
        metadata
    ) VALUES (
        TG_OP,
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Utility functions created'

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON app.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON app.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON app.organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

\echo '✓ Triggers created'

-- ============================================================================
-- INSERT SAMPLE DATA (DEV ONLY)
-- ============================================================================

-- Sample users
INSERT INTO app.users (email, username, full_name, is_active, is_verified)
VALUES
    ('admin@freeflow.dev', 'admin', 'Admin User', true, true),
    ('operator@freeflow.dev', 'operator', 'Operator User', true, true),
    ('viewer@freeflow.dev', 'viewer', 'Viewer User', true, true)
ON CONFLICT (email) DO NOTHING;

-- Sample organization
INSERT INTO app.organizations (name, slug, description, is_active)
VALUES
    ('FreeFlow Demo', 'freeflow-demo', 'Demo organization for testing', true),
    ('ACME Corporation', 'acme-corp', 'Sample corporate organization', true)
ON CONFLICT (slug) DO NOTHING;

-- Link users to organizations
INSERT INTO app.user_organizations (user_id, organization_id, role)
SELECT
    u.id,
    o.id,
    CASE u.username
        WHEN 'admin' THEN 'Admin'
        WHEN 'operator' THEN 'Operator'
        WHEN 'viewer' THEN 'Viewer'
    END as role
FROM app.users u
CROSS JOIN app.organizations o
WHERE o.slug = 'freeflow-demo'
ON CONFLICT (user_id, organization_id) DO NOTHING;

\echo '✓ Sample data inserted'

-- ============================================================================
-- DISPLAY SUMMARY
-- ============================================================================

\echo ''
\echo '============================================================================'
\echo '  PostgreSQL Initialization Complete!'
\echo '============================================================================'
\echo ''
\echo 'Databases created:'
\echo '  • freeflow  - Main application database'
\echo '  • keycloak  - Authentication service database'
\echo '  • camunda   - Workflow engine database (optional)'
\echo ''
\echo 'Users created:'
\echo '  • freeflow         (password: freeflow_dev_password)'
\echo '  • keycloak_user    (password: keycloak_dev_password)'
\echo '  • camunda_user     (password: camunda_dev_password)'
\echo ''
\echo 'Schemas in freeflow database:'
\echo '  • app       - Application core tables'
\echo '  • auth      - Authentication/authorization data'
\echo '  • workflow  - Workflow-related tables'
\echo '  • audit     - Audit trails and logs'
\echo ''
\echo '⚠️  WARNING: These credentials are for DEVELOPMENT ONLY!'
\echo '   Change all passwords before production deployment.'
\echo ''
\echo 'Connection strings:'
\echo '  postgresql://freeflow:freeflow_dev_password@localhost:5432/freeflow'
\echo '  postgresql://keycloak_user:keycloak_dev_password@localhost:5432/keycloak'
\echo ''
\echo '============================================================================'
