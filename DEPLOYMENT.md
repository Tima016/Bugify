# UzSecure Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available

### 1. Clone and Setup
```bash
git clone <repository-url>
cd Bbuz-anti
```

### 2. Environment Configuration
Create `.env` files in both `backend/` and `uzsecure/` directories:

**backend/.env**:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/uzsecure
JWT_SECRET=your-super-secret-jwt-key-change-this
REDIS_HOST=redis
REDIS_PORT=6379
ELASTICSEARCH_NODE=http://elasticsearch:9200
S3_ENDPOINT=http://minio:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=uzsecure-uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@uzsecure.uz
```

**uzsecure/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Elasticsearch (port 9200)
- MinIO (port 9000, console 9001)
- Backend API (port 3001)
- Frontend (port 3000)

### 4. Run Database Migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api
- **GraphQL Playground**: http://localhost:3001/graphql
- **MinIO Console**: http://localhost:9001

### 6. Stop Services
```bash
docker-compose down
```

To remove volumes (⚠️ deletes all data):
```bash
docker-compose down -v
```

---

## Development Setup (Without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+
- MinIO or AWS S3

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../uzsecure
npm install
```

### 2. Setup Database
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd uzsecure
npm run dev
```

---

## Testing

### Unit Tests
```bash
cd backend
npm run test
```

### E2E Tests
```bash
cd backend
npm run test:e2e
```

### Test Coverage
```bash
cd backend
npm run test:cov
```

---

## Production Deployment

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd uzsecure
npm run build
```

### Environment Variables (Production)
Ensure all sensitive values are properly set:
- Change `JWT_SECRET` to a strong random value
- Use production database credentials
- Configure real SMTP server
- Use AWS S3 or production MinIO
- Set `NODE_ENV=production`

### Health Checks
- Backend: `GET /health`
- Database: Check PostgreSQL connection
- Redis: Check Redis connection
- Elasticsearch: `GET http://localhost:9200/_cluster/health`

---

## Troubleshooting

### Services Won't Start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart specific service
docker-compose restart backend
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres
```

### Port Conflicts
If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3002:3001"  # Change host port
```

---

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Resource Usage
```bash
docker stats
```

---

## Backup & Restore

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres uzsecure > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U postgres uzsecure < backup.sql
```

### Backup MinIO Data
```bash
docker-compose exec minio mc mirror /data ./minio-backup
```

---

## Security Checklist

- [ ] Change default passwords
- [ ] Set strong JWT_SECRET
- [ ] Configure HTTPS/TLS
- [ ] Enable firewall rules
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Regular security updates

---

## Support

For issues or questions:
- GitHub Issues: <repository-url>/issues
- Documentation: <docs-url>
- Email: support@uzsecure.uz
