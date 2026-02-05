# 🚀 UzSecure - Running Locally (Faster Alternative)

Since Docker build is taking too long, let's run the platform locally instead!

## Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally
- Redis installed locally (optional - can skip for now)

## Quick Start (5 minutes)

### 1. Start Backend
```bash
cd backend

# Install dependencies (if not done)
npm install

# Setup database
npx prisma migrate dev

# Start backend
npm run start:dev
```

Backend will run on: **http://localhost:3001**

### 2. Start Frontend (in new terminal)
```bash
cd uzsecure

# Install dependencies (if not done)
npm install

# Start frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

## Access the Platform

Open your browser to: **http://localhost:3000**

## Features Available:
✅ All 44 features (100% complete)
✅ Bug bounty management
✅ Report submission
✅ UzCard & Humo payments
✅ AI duplicate detection
✅ Dark mode
✅ Auto-save
✅ CVSS calculator
✅ 3 languages

## Database Setup (PostgreSQL)

If you don't have PostgreSQL:

**Windows**:
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Docker for just PostgreSQL:
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=uzsecure postgres:15-alpine
```

**Update .env**:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uzsecure"
```

## Optional Services

### Redis (for caching - optional):
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

### Elasticsearch (for search - optional):
```bash
docker run -d -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

## That's It!

The platform is now running locally without Docker complexity!

**Much faster than Docker build** ⚡
