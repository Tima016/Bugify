# UzSecure - Bug Bounty Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> Uzbekistan's first comprehensive bug bounty platform connecting security researchers with companies.

## 🚀 Features

### Core Platform
- **Bug Bounty Programs** - Companies create and manage vulnerability disclosure programs
- **Report Submission** - Researchers submit security findings with rich text and attachments
- **Payment Processing** - Automated bounty payments and payout requests
- **Leaderboard System** - Period-based rankings (monthly, quarterly, all-time)
- **Achievement System** - 12 achievement types with auto-detection
- **Invitation System** - Code-based user invitations with usage tracking

### Security & Infrastructure
- **Authentication** - JWT-based with refresh tokens
- **Authorization** - CASL role-based permissions (Admin/Researcher/Company)
- **Security Headers** - Helmet with CSP
- **CSRF Protection** - Token-based protection
- **XSS Prevention** - DOMPurify sanitization
- **Rate Limiting** - Configurable throttling

### Technical Features
- **Full-Text Search** - Elasticsearch with fuzzy matching
- **File Storage** - S3/MinIO with validation and magic byte checking
- **Email System** - 6 professional templates with background processing
- **Caching** - Redis for sessions and API responses
- **Background Jobs** - BullMQ for async processing
- **GraphQL API** - Apollo Server with auto-schema generation
- **Localization** - Uzbek (default), English, Russian (450+ strings)

### Developer Experience
- **Docker Deployment** - One-command setup with 6 services
- **API Documentation** - Swagger/OpenAPI
- **Type Safety** - Full TypeScript coverage
- **Testing** - Jest + Supertest infrastructure
- **Database Migrations** - Prisma ORM

## 📊 Project Status

**Completion**: 58% (26/45 tasks)  
**Production Ready**: Staging/Demo ✅ | Production ⚠️ (requires testing)

### Completed Phases
- ✅ Phase 1: Mock Data Removal (100%)
- ✅ Phase 2: Critical Infrastructure (100%)
- ✅ Phase 3: Security Hardening (100%)
- ✅ Phase 4: Database & Business Logic (100%)
- ✅ Phase 5: Localization (100%)
- 🔄 Phase 6: Frontend Features (40%)
- 🔄 Phase 8: Testing (25%)
- 🔄 Phase 9: DevOps (17%)

## 🏗️ Architecture

### Tech Stack

**Backend**:
- NestJS 10
- PostgreSQL 15
- Prisma ORM
- Redis 7
- Elasticsearch 8
- GraphQL (Apollo)

**Frontend**:
- Next.js 14
- React 18
- TypeScript
- TipTap (Rich Text)
- React Dropzone

**Infrastructure**:
- Docker & Docker Compose
- MinIO (S3-compatible)
- BullMQ
- NodeMailer

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Bbuz-anti
```

### 2. Environment Setup
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp uzsecure/.env.example uzsecure/.env.local
# Edit uzsecure/.env.local
```

### 3. Start with Docker
```bash
docker-compose up -d
```

### 4. Run Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api
- **GraphQL**: http://localhost:3001/graphql

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Docker setup, production deployment
- [API Documentation](http://localhost:3001/api) - Swagger/OpenAPI docs
- [GraphQL Playground](http://localhost:3001/graphql) - Interactive GraphQL IDE

## 🔑 Key Features Detail

### Invitation System
Companies can generate invitation codes with:
- Email-specific invitations
- Usage limits (single-use or multi-use)
- Expiration dates
- Role assignment

```typescript
// Create invitation
POST /invitations
{
  "email": "researcher@example.com",
  "role": "RESEARCHER",
  "maxUses": 1,
  "expiresAt": "2024-12-31"
}
```

### Achievement System
12 achievement types including:
- First Blood (first accepted report)
- Critical Hunter (5 critical vulnerabilities)
- Bounty Hunter ($1,000+ earned)
- Elite Hunter ($10,000+ earned)
- 7-Day/30-Day Streaks
- Top 10 Leaderboard

Auto-detection triggers on user actions with notifications.

### Leaderboard
Period-based rankings:
- Monthly
- Quarterly
- All-time

Persistent storage with bulk update capabilities.

## 🌍 Localization

Supported languages:
- **Uzbek (uz)** - Default
- **English (en)**
- **Russian (ru)**

450+ translated strings covering:
- Common UI elements
- Authentication flows
- Landing page
- Programs & Reports
- Dashboard & Profile
- Notifications

## 🧪 Testing

```bash
# Unit tests
cd backend
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

**Current Coverage**: ~5%  
**Target**: 80%

## 📈 API Overview

### REST Endpoints (100+)
- `/auth/*` - Authentication (5 endpoints)
- `/users/*` - User management (8 endpoints)
- `/programs/*` - Bug bounty programs (10 endpoints)
- `/reports/*` - Vulnerability reports (12 endpoints)
- `/invitations/*` - Invitation codes (5 endpoints)
- `/achievements/*` - Achievement system (4 endpoints)
- `/leaderboard/*` - Rankings (4 endpoints)
- `/payments/*` - Payment processing (8 endpoints)
- `/admin/*` - Admin operations (15 endpoints)

### GraphQL Queries
- `programs` - List programs with filters
- `reports` - List reports with filters
- `platformStats` - Platform statistics
- `leaderboard` - Top researchers
- `user` - User profile

## 🔒 Security

- **Helmet** - Security headers and CSP
- **CSRF** - Token-based protection
- **XSS** - DOMPurify sanitization
- **CASL** - Role-based authorization
- **Rate Limiting** - 100 req/min default
- **Input Validation** - Class-validator
- **File Validation** - Magic byte checking
- **JWT** - Secure authentication

## 🐳 Docker Services

The `docker-compose.yml` includes:
1. **PostgreSQL** - Primary database (port 5432)
2. **Redis** - Caching & sessions (port 6379)
3. **Elasticsearch** - Search engine (port 9200)
4. **MinIO** - File storage (port 9000, console 9001)
5. **Backend** - NestJS API (port 3001)
6. **Frontend** - Next.js app (port 3000)

All services include health checks and persistent volumes.

## 🛠️ Development

### Local Development (without Docker)
```bash
# Install dependencies
cd backend && npm install
cd ../uzsecure && npm install

# Start PostgreSQL, Redis, Elasticsearch, MinIO separately

# Run migrations
cd backend
npx prisma migrate dev

# Start backend
npm run start:dev

# Start frontend (new terminal)
cd uzsecure
npm run dev
```

### Database Management
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
ELASTICSEARCH_NODE=http://localhost:9200
S3_ENDPOINT=http://localhost:9000
SMTP_HOST=smtp.gmail.com
# ... see .env.example for full list
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- UI powered by [Next.js](https://nextjs.org/)
- Database by [PostgreSQL](https://www.postgresql.org/)
- Search by [Elasticsearch](https://www.elastic.co/)

## 📞 Support

- **Issues**: [GitHub Issues](<repository-url>/issues)
- **Email**: support@uzsecure.uz
- **Documentation**: [Full Docs](<docs-url>)

---

**Made with ❤️ for the Uzbekistan security community**
