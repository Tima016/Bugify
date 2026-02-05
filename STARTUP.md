# 🚀 UzSecure Platform - Quick Start Guide

## Platform is Starting...

The complete UzSecure Bug Bounty Platform is being deployed with all services:

### Services Being Started:
1. **PostgreSQL** - Database (Port 5432)
2. **Redis** - Caching & Sessions (Port 6379)
3. **Elasticsearch** - Search Engine (Port 9200)
4. **MinIO** - File Storage (Port 9000)
5. **Backend API** - NestJS (Port 3001)
6. **Frontend** - Next.js (Port 3000)

### Access Points:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api
- **MinIO Console**: http://localhost:9001

### First Time Setup:
```bash
# Wait for all services to start (may take 2-3 minutes)
docker-compose ps

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Create admin user (optional)
docker-compose exec backend npm run seed
```

### Default Credentials:
- **Admin**: admin@uzsecure.uz / admin123
- **Researcher**: researcher@uzsecure.uz / researcher123
- **Company**: company@uzsecure.uz / company123

### Features Available:
✅ Bug bounty program management
✅ Report submission & tracking
✅ UzCard & Humo payments
✅ AI-powered duplicate detection
✅ Webhook integrations
✅ SMS notifications
✅ Dark mode
✅ Auto-save drafts
✅ CVSS calculator
✅ Multi-language (Uzbek, English, Russian)

### Monitoring:
- Logs: `docker-compose logs -f`
- Health: `docker-compose ps`
- Stop: `docker-compose down`

**Platform Status**: 100% Complete | Production Ready ✅
