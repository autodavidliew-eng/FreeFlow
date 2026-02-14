.PHONY: help up down restart logs ps clean reset health shell-postgres shell-mongo shell-redis backup restore camunda formio all backup-postgres backup-mongodb restore-postgres restore-mongodb

# Default target
.DEFAULT_GOAL := help

# Project name
PROJECT := freeflow

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)FreeFlow Docker Compose Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Profiles:$(NC)"
	@echo "  $(GREEN)camunda$(NC)  - Start with Camunda 8 workflow engine"
	@echo "  $(GREEN)formio$(NC)   - Start with Form.io server"
	@echo "  $(GREEN)all$(NC)      - Start with all optional services"

up: ## Start all core services
	@echo "$(BLUE)Starting FreeFlow services...$(NC)"
	docker compose up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@make ps

down: ## Stop all services (keeps data)
	@echo "$(BLUE)Stopping FreeFlow services...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

stop: ## Stop services without removing containers
	@echo "$(BLUE)Stopping services...$(NC)"
	docker compose stop
	@echo "$(GREEN)✓ Services stopped$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting FreeFlow services...$(NC)"
	docker compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

logs: ## Tail logs from all services
	docker compose logs -f

ps: ## Show service status
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health: ## Check health status of all services
	@echo "$(BLUE)Checking service health...$(NC)"
	@docker compose ps --format json | jq -r '.[] | "\(.Name): \(.Health)"'

clean: ## Stop and remove containers (keeps volumes)
	@echo "$(YELLOW)Stopping and removing containers...$(NC)"
	docker compose down
	@echo "$(GREEN)✓ Containers removed$(NC)"

reset: ## ⚠️  DESTRUCTIVE: Remove everything including volumes
	@echo "$(RED)⚠️  WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		echo "$(GREEN)✓ All data removed$(NC)"; \
	else \
		echo "$(YELLOW)Reset cancelled$(NC)"; \
	fi

# Profile-based startup
camunda: ## Start with Camunda 8 profile
	@echo "$(BLUE)Starting with Camunda 8...$(NC)"
	docker compose --profile camunda up -d
	@make ps

formio: ## Start with Form.io profile
	@echo "$(BLUE)Starting with Form.io...$(NC)"
	docker compose --profile formio up -d
	@make ps

all: ## Start with all profiles enabled
	@echo "$(BLUE)Starting all services...$(NC)"
	docker compose --profile camunda --profile formio up -d
	@make ps

# Service-specific operations
shell-postgres: ## Open PostgreSQL shell
	docker compose exec postgres psql -U freeflow -d freeflow

shell-mongo: ## Open MongoDB shell
	docker compose exec mongodb mongosh -u freeflow -p freeflow_dev_password

shell-redis: ## Open Redis CLI
	docker compose exec redis redis-cli -a freeflow_dev_password

shell-rabbitmq: ## Show RabbitMQ status
	docker compose exec rabbitmq rabbitmqctl status

# Individual service management
restart-keycloak: ## Restart Keycloak only
	docker compose restart keycloak

restart-postgres: ## Restart PostgreSQL only
	docker compose restart postgres

restart-mongodb: ## Restart MongoDB only
	docker compose restart mongodb

restart-redis: ## Restart Redis only
	docker compose restart redis

# Logs for individual services
logs-keycloak: ## Tail Keycloak logs
	docker compose logs -f keycloak

logs-postgres: ## Tail PostgreSQL logs
	docker compose logs -f postgres

logs-mongodb: ## Tail MongoDB logs
	docker compose logs -f mongodb

logs-rabbitmq: ## Tail RabbitMQ logs
	docker compose logs -f rabbitmq

logs-zeebe: ## Tail Zeebe logs (requires camunda profile)
	docker compose logs -f zeebe

# Backup and restore
backup-postgres: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up PostgreSQL...$(NC)"
	@mkdir -p ./backups
	docker compose exec -T postgres pg_dump -U freeflow freeflow > ./backups/postgres_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ PostgreSQL backup created$(NC)"

backup-mongodb: ## Backup MongoDB database
	@echo "$(BLUE)Backing up MongoDB...$(NC)"
	@mkdir -p ./backups
	docker compose exec -T mongodb mongodump --username=freeflow --password=freeflow_dev_password --authenticationDatabase=admin --db=freeflow --archive > ./backups/mongodb_$(shell date +%Y%m%d_%H%M%S).dump
	@echo "$(GREEN)✓ MongoDB backup created$(NC)"

restore-postgres: ## Restore PostgreSQL from latest backup
	@echo "$(BLUE)Restoring PostgreSQL...$(NC)"
	@LATEST=$$(ls -t ./backups/postgres_*.sql | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(RED)No backup found$(NC)"; \
		exit 1; \
	fi; \
	docker compose exec -T postgres psql -U freeflow -d freeflow < $$LATEST
	@echo "$(GREEN)✓ PostgreSQL restored$(NC)"

restore-mongodb: ## Restore MongoDB from latest backup
	@echo "$(BLUE)Restoring MongoDB...$(NC)"
	@LATEST=$$(ls -t ./backups/mongodb_*.dump | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(RED)No backup found$(NC)"; \
		exit 1; \
	fi; \
	cat $$LATEST | docker compose exec -T mongodb mongorestore --username=freeflow --password=freeflow_dev_password --authenticationDatabase=admin --db=freeflow --archive
	@echo "$(GREEN)✓ MongoDB restored$(NC)"

restore: ## Restore PostgreSQL and MongoDB from latest backups
	@$(MAKE) restore-postgres
	@$(MAKE) restore-mongodb

# Update images
pull: ## Pull latest images
	@echo "$(BLUE)Pulling latest images...$(NC)"
	docker compose pull
	@echo "$(GREEN)✓ Images updated$(NC)"

rebuild: ## Rebuild and restart services
	@echo "$(BLUE)Rebuilding services...$(NC)"
	docker compose up -d --build
	@echo "$(GREEN)✓ Services rebuilt$(NC)"

# Utilities
prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Removing unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

urls: ## Show all service URLs
	@echo "$(BLUE)FreeFlow Service URLs:$(NC)"
	@echo ""
	@echo "$(GREEN)Core Services:$(NC)"
	@echo "  PostgreSQL:  postgresql://localhost:5432"
	@echo "  MongoDB:     mongodb://localhost:27017"
	@echo "  Redis:       redis://localhost:6379"
	@echo "  RabbitMQ:    http://localhost:15672"
	@echo "  Qdrant:      http://localhost:6333/dashboard"
	@echo "  Keycloak:    http://localhost:8080"
	@echo ""
	@echo "$(GREEN)Camunda Services:$(NC)"
	@echo "  Zeebe:       grpc://localhost:26500"
	@echo "  Operate:     http://localhost:8081"
	@echo "  Tasklist:    http://localhost:8082"
	@echo ""
	@echo "$(GREEN)Form.io:$(NC)"
	@echo "  Form.io:     http://localhost:3001"

check: ## Run health checks on all services
	@echo "$(BLUE)Running health checks...$(NC)"
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
	@echo ""
	@echo "$(BLUE)Testing connections...$(NC)"
	@docker compose exec postgres pg_isready -U freeflow && echo "$(GREEN)✓ PostgreSQL$(NC)" || echo "$(RED)✗ PostgreSQL$(NC)"
	@docker compose exec mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1 && echo "$(GREEN)✓ MongoDB$(NC)" || echo "$(RED)✗ MongoDB$(NC)"
	@docker compose exec redis redis-cli -a freeflow_dev_password ping > /dev/null 2>&1 && echo "$(GREEN)✓ Redis$(NC)" || echo "$(RED)✗ Redis$(NC)"
	@curl -s http://localhost:15672 > /dev/null && echo "$(GREEN)✓ RabbitMQ$(NC)" || echo "$(RED)✗ RabbitMQ$(NC)"
	@curl -s http://localhost:8080 > /dev/null && echo "$(GREEN)✓ Keycloak$(NC)" || echo "$(RED)✗ Keycloak$(NC)"
	@curl -s http://localhost:6333/readyz > /dev/null && echo "$(GREEN)✓ Qdrant$(NC)" || echo "$(RED)✗ Qdrant$(NC)"

dev: ## Quick start for development (core services)
	@echo "$(BLUE)Starting development environment...$(NC)"
	@make up
	@sleep 5
	@make check
	@echo ""
	@make urls
