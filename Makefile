.PHONY: help install up down restart logs ps health reset clean seed test dev prod status backup restore

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
CYAN := \033[0;36m
NC := \033[0m # No Color

# Project info
PROJECT_NAME := FreeFlow
COMPOSE_DIR := infra/compose

help: ## Show this help message
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║$(NC)  $(CYAN)$(PROJECT_NAME) - Developer Commands$(NC)                      $(BLUE)║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  $(GREEN)make install$(NC)  - Install dependencies"
	@echo "  $(GREEN)make dev$(NC)      - Start development environment"
	@echo "  $(GREEN)make logs$(NC)     - View logs"
	@echo ""
	@echo "$(YELLOW)Available Commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-12s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Infrastructure Profiles:$(NC)"
	@echo "  $(GREEN)make up-camunda$(NC)   - Start with Camunda workflow engine"
	@echo "  $(GREEN)make up-formio$(NC)    - Start with Form.io server"
	@echo "  $(GREEN)make up-all$(NC)       - Start everything"
	@echo ""
	@echo "$(YELLOW)More Commands:$(NC)"
	@echo "  Run '$(GREEN)make -C infra/compose help$(NC)' for infrastructure commands"
	@echo ""

# ============================================================================
# Installation & Setup
# ============================================================================

install: ## Install all dependencies
	@echo "$(BLUE)Installing FreeFlow dependencies...$(NC)"
	@pnpm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

setup: install ## Full setup (install + start infrastructure)
	@echo "$(BLUE)Setting up FreeFlow development environment...$(NC)"
	@$(MAKE) up
	@echo ""
	@echo "$(GREEN)✓ Setup complete!$(NC)"
	@echo ""
	@$(MAKE) status

# ============================================================================
# Development Commands
# ============================================================================

dev: ## Start development environment (infrastructure + apps)
	@echo "$(BLUE)Starting FreeFlow development environment...$(NC)"
	@$(MAKE) up
	@echo ""
	@echo "$(BLUE)Starting application servers...$(NC)"
	@pnpm dev

up: ## Start infrastructure services
	@echo "$(BLUE)Starting infrastructure services...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) up
	@echo ""
	@$(MAKE) status

up-camunda: ## Start with Camunda workflow engine
	@echo "$(BLUE)Starting infrastructure with Camunda...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) camunda
	@echo ""
	@$(MAKE) status

up-formio: ## Start with Form.io server
	@echo "$(BLUE)Starting infrastructure with Form.io...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) formio
	@echo ""
	@$(MAKE) status

up-all: ## Start all services (including optional)
	@echo "$(BLUE)Starting all services...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) all
	@echo ""
	@$(MAKE) status

down: ## Stop all services (keeps data)
	@echo "$(BLUE)Stopping services...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

# ============================================================================
# Monitoring & Logs
# ============================================================================

logs: ## Tail logs from all services
	@cd $(COMPOSE_DIR) && docker compose logs -f

logs-app: ## View application logs only
	@pnpm run logs

logs-infra: ## View infrastructure logs only
	@cd $(COMPOSE_DIR) && docker compose logs -f

logs-postgres: ## View PostgreSQL logs
	@cd $(COMPOSE_DIR) && $(MAKE) logs-postgres

logs-mongodb: ## View MongoDB logs
	@cd $(COMPOSE_DIR) && $(MAKE) logs-mongodb

logs-rabbitmq: ## View RabbitMQ logs
	@cd $(COMPOSE_DIR) && $(MAKE) logs-rabbitmq

logs-keycloak: ## View Keycloak logs
	@cd $(COMPOSE_DIR) && $(MAKE) logs-keycloak

ps: ## Show service status
	@cd $(COMPOSE_DIR) && docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health: ## Check health of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) health
	@echo ""
	@$(MAKE) status

status: ## Show service URLs and status
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║$(NC)  $(CYAN)FreeFlow Service Status$(NC)                              $(BLUE)║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Core Services:$(NC)"
	@echo "  PostgreSQL:      $(GREEN)postgresql://localhost:5432$(NC)"
	@echo "  MongoDB:         $(GREEN)mongodb://localhost:27017$(NC)"
	@echo "  Redis:           $(GREEN)redis://localhost:6379$(NC)"
	@echo "  RabbitMQ:        $(GREEN)http://localhost:15672$(NC) (freeflow/freeflow_dev_password)"
	@echo "  Qdrant:          $(GREEN)http://localhost:6333/dashboard$(NC)"
	@echo "  Keycloak:        $(GREEN)http://localhost:8080$(NC) (admin/admin)"
	@echo ""
	@echo "$(YELLOW)Applications:$(NC)"
	@echo "  Web App:         $(GREEN)http://localhost:3000$(NC)"
	@echo "  API:             $(GREEN)http://localhost:3001$(NC)"
	@echo ""
	@echo "$(YELLOW)Optional Services:$(NC)"
	@echo "  Camunda Operate: $(GREEN)http://localhost:8081$(NC) (if running)"
	@echo "  Camunda Tasklist:$(GREEN)http://localhost:8082$(NC) (if running)"
	@echo "  Form.io:         $(GREEN)http://localhost:3001$(NC) (if running)"
	@echo ""

# ============================================================================
# Database Operations
# ============================================================================

seed: ## Seed databases with sample data (placeholder)
	@echo "$(BLUE)Seeding databases...$(NC)"
	@echo "$(YELLOW)⚠️  Seeding not yet implemented$(NC)"
	@echo ""
	@echo "To seed databases manually:"
	@echo "  1. PostgreSQL: psql -U freeflow -d freeflow -f scripts/seed.sql"
	@echo "  2. MongoDB: mongosh --eval 'load(\"scripts/seed.js\")'"
	@echo ""
	@echo "Or implement seeding in your application:"
	@echo "  $(GREEN)pnpm run seed$(NC)"

seed-postgres: ## Seed PostgreSQL (placeholder)
	@echo "$(BLUE)Seeding PostgreSQL...$(NC)"
	@echo "$(YELLOW)⚠️  Not yet implemented$(NC)"
	@echo "Sample data is already included in init scripts."

seed-mongodb: ## Seed MongoDB (placeholder)
	@echo "$(BLUE)Seeding MongoDB...$(NC)"
	@echo "$(YELLOW)⚠️  Not yet implemented$(NC)"
	@echo "Sample data is already included in init scripts."

backup: ## Backup databases
	@echo "$(BLUE)Backing up databases...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) backup-postgres
	@cd $(COMPOSE_DIR) && $(MAKE) backup-mongodb
	@echo "$(GREEN)✓ Backups created in infra/compose/backups/$(NC)"

restore: ## Restore databases from latest backups
	@echo "$(BLUE)Restoring databases...$(NC)"
	@cd $(COMPOSE_DIR) && $(MAKE) restore
	@echo "$(GREEN)✓ Databases restored$(NC)"

# ============================================================================
# Database Shells
# ============================================================================

db-postgres: ## Open PostgreSQL shell
	@cd $(COMPOSE_DIR) && $(MAKE) shell-postgres

db-mongodb: ## Open MongoDB shell
	@cd $(COMPOSE_DIR) && $(MAKE) shell-mongo

db-redis: ## Open Redis CLI
	@cd $(COMPOSE_DIR) && $(MAKE) shell-redis

# ============================================================================
# Reset & Clean
# ============================================================================

reset: ## Reset all data (⚠️ DESTRUCTIVE)
	@echo "$(RED)⚠️  WARNING: This will delete ALL data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)Resetting infrastructure...$(NC)"; \
		cd $(COMPOSE_DIR) && docker compose down -v; \
		echo "$(GREEN)✓ All data removed$(NC)"; \
		echo ""; \
		echo "Run '$(GREEN)make up$(NC)' to start fresh."; \
	else \
		echo "$(YELLOW)Reset cancelled$(NC)"; \
	fi

clean: ## Clean build artifacts and caches
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf node_modules/.cache
	@rm -rf apps/*/node_modules/.cache
	@rm -rf apps/*/.next
	@rm -rf apps/*/dist
	@pnpm run clean || true
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-all: clean ## Clean everything including node_modules
	@echo "$(BLUE)Removing node_modules...$(NC)"
	@rm -rf node_modules
	@rm -rf apps/*/node_modules
	@rm -rf packages/*/node_modules
	@echo "$(GREEN)✓ All cleaned$(NC)"
	@echo "Run '$(GREEN)make install$(NC)' to reinstall dependencies."

# ============================================================================
# Testing
# ============================================================================

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@pnpm test

test-unit: ## Run unit tests
	@pnpm test:unit

test-e2e: ## Run end-to-end tests
	@pnpm test:e2e

test-watch: ## Run tests in watch mode
	@pnpm test:watch

# ============================================================================
# Code Quality
# ============================================================================

lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	@pnpm lint

lint-fix: ## Fix linting issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	@pnpm lint:fix

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	@pnpm format

format-check: ## Check code formatting
	@pnpm format:check

typecheck: ## Run TypeScript type checking
	@echo "$(BLUE)Type checking...$(NC)"
	@pnpm typecheck

# ============================================================================
# Build & Deploy
# ============================================================================

build: ## Build all applications
	@echo "$(BLUE)Building applications...$(NC)"
	@pnpm build

build-web: ## Build web app only
	@pnpm --filter web build

build-api: ## Build API only
	@pnpm --filter api build

prod: ## Start in production mode
	@echo "$(BLUE)Starting in production mode...$(NC)"
	@pnpm start

# ============================================================================
# Utilities
# ============================================================================

urls: ## Show all service URLs
	@$(MAKE) status

check: health ## Alias for health check

prune: ## Remove unused Docker resources
	@echo "$(BLUE)Removing unused Docker resources...$(NC)"
	@docker system prune -f
	@echo "$(GREEN)✓ Docker cleanup complete$(NC)"

update: ## Update dependencies
	@echo "$(BLUE)Updating dependencies...$(NC)"
	@pnpm update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

outdated: ## Check for outdated dependencies
	@pnpm outdated

# ============================================================================
# Documentation
# ============================================================================

docs: ## Open documentation
	@echo "$(BLUE)Documentation:$(NC)"
	@echo "  Setup:        docs/dev-setup.md"
	@echo "  Compose:      infra/compose/README.md"
	@echo "  Database:     infra/db/README.md"
	@echo "  Keycloak:     infra/keycloak/README.md"
	@echo "  RabbitMQ:     infra/rabbitmq/README.md"

# ============================================================================
# Advanced
# ============================================================================

shell-postgres: db-postgres ## Alias for db-postgres
shell-mongodb: db-mongodb ## Alias for db-mongodb
shell-redis: db-redis ## Alias for db-redis

restart-postgres: ## Restart PostgreSQL only
	@cd $(COMPOSE_DIR) && $(MAKE) restart-postgres

restart-mongodb: ## Restart MongoDB only
	@cd $(COMPOSE_DIR) && $(MAKE) restart-mongodb

restart-keycloak: ## Restart Keycloak only
	@cd $(COMPOSE_DIR) && $(MAKE) restart-keycloak

# ============================================================================
# Quick shortcuts
# ============================================================================

start: up ## Alias for up
stop: down ## Alias for down
