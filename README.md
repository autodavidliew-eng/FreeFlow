# FreeFlow

Modern monorepo with Next.js frontend and NestJS microservices.

## 🏗️ Architecture

```
apps/
├── web/        Next.js 15 frontend (TypeScript)
└── api/        NestJS REST API microservice

packages/
├── config/     Shared ESLint, TypeScript configs
├── types/      Shared TypeScript types
└── ui/         Shared React components

infra/
├── docker/     Docker configs & compose
└── k8s/        Kubernetes manifests (optional)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- pnpm 9+
- Docker & Docker Compose

### Installation

```bash
# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Start with Docker
pnpm docker:up
```

## 📜 Scripts

| Command              | Description                           |
|---------------------|---------------------------------------|
| `pnpm dev`          | Start all apps in dev mode           |
| `pnpm build`        | Build all apps                       |
| `pnpm test`         | Run all tests                        |
| `pnpm lint`         | Lint all packages                    |
| `pnpm format`       | Format code with Prettier            |
| `pnpm format:check` | Check formatting                     |
| `pnpm docker:up`    | Start Docker services                |
| `pnpm docker:down`  | Stop Docker services                 |

## 🏃 Development

### Web (Next.js)
```bash
pnpm --filter web dev
# → http://localhost:3000
```

### API (NestJS)
```bash
pnpm --filter api dev
# → http://localhost:4000
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific app tests
pnpm --filter web test
pnpm --filter api test
```

## 🐳 Docker

```bash
# Start all services
pnpm docker:up

# View logs
docker compose -f infra/docker/docker-compose.yml logs -f

# Stop services
pnpm docker:down
```

## 📦 Adding Dependencies

```bash
# Add to specific app
pnpm --filter web add package-name
pnpm --filter api add package-name

# Add to root (dev dependency)
pnpm add -Dw package-name
```

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, Prisma (optional)
- **Monorepo**: Turborepo, pnpm workspaces
- **Tooling**: ESLint, Prettier, Husky
- **DevOps**: Docker, Docker Compose

## 📝 Code Style

- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Conventional commits recommended

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push and create PR: `git push origin feature/my-feature`

## 📄 License

MIT
