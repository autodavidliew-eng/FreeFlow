-- FreeFlow PostgreSQL Initialization Script
-- This script runs on first container startup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create additional databases if needed
-- CREATE DATABASE IF NOT EXISTS camunda;
-- CREATE DATABASE IF NOT EXISTS keycloak;

-- Create schemas for FreeFlow
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION freeflow;
CREATE SCHEMA IF NOT EXISTS auth AUTHORIZATION freeflow;
CREATE SCHEMA IF NOT EXISTS workflow AUTHORIZATION freeflow;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA app TO freeflow;
GRANT ALL PRIVILEGES ON SCHEMA auth TO freeflow;
GRANT ALL PRIVILEGES ON SCHEMA workflow TO freeflow;

-- Create sample tables (customize as needed)
CREATE TABLE IF NOT EXISTS app.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON app.users(username);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON app.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON app.audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_metadata ON app.audit_log USING gin(metadata);

-- Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON app.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (for development only)
INSERT INTO app.users (email, username)
VALUES
    ('admin@freeflow.dev', 'admin'),
    ('user@freeflow.dev', 'testuser')
ON CONFLICT (email) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'FreeFlow database initialization completed successfully';
END $$;
