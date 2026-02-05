# UzSecure API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "RESEARCHER"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "researcher1",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Programs

### List Programs
```http
GET /programs?status=ACTIVE&limit=20
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "id": "uuid",
      "name": "Program Name",
      "description": "...",
      "minReward": 100,
      "maxReward": 5000,
      "status": "ACTIVE"
    }
  ]
}
```

### Create Program (Company only)
```http
POST /programs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Bug Bounty Program",
  "description": "Find vulnerabilities in our platform",
  "scope": "*.example.com",
  "minReward": 100,
  "maxReward": 10000,
  "status": "ACTIVE"
}
```

## Reports

### Submit Report (Researcher only)
```http
POST /reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "programId": "uuid",
  "title": "XSS Vulnerability in Login Form",
  "description": "Detailed description...",
  "severity": "HIGH",
  "stepsToReproduce": "1. Go to...",
  "impact": "Attacker can steal credentials"
}
```

### List Reports
```http
GET /reports?programId=uuid&status=PENDING
Authorization: Bearer <token>
```

### Update Report Status (Company only)
```http
PATCH /reports/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED",
  "reward": 500
}
```

## Invitations

### Create Invitation (Company only)
```http
POST /invitations
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "researcher@example.com",
  "role": "RESEARCHER",
  "maxUses": 1,
  "expiresAt": "2024-12-31T23:59:59Z"
}

Response:
{
  "id": "uuid",
  "code": "ABC123DEF456...",
  "email": "researcher@example.com",
  "maxUses": 1,
  "usedCount": 0,
  "isActive": true
}
```

### Validate Invitation
```http
POST /invitations/validate
Content-Type: application/json

{
  "code": "ABC123DEF456...",
  "email": "researcher@example.com"
}
```

## Achievements

### Get Available Achievements
```http
GET /achievements/available

Response:
{
  "data": [
    {
      "type": "FIRST_BLOOD",
      "title": "First Blood",
      "description": "Submitted your first accepted vulnerability report",
      "iconUrl": "/achievements/first-blood.svg"
    }
  ]
}
```

### Get User Achievements
```http
GET /achievements/user/:userId
Authorization: Bearer <token>
```

### Check Achievements (triggers auto-detection)
```http
POST /achievements/user/:userId/check
Authorization: Bearer <token>

Response:
{
  "awarded": ["FIRST_BLOOD", "VERIFIED"]
}
```

## Leaderboard

### Get Leaderboard
```http
GET /leaderboard?period=all-time&limit=100

Response:
{
  "data": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "researcher1",
      "reputationScore": 1500,
      "totalEarnings": 25000,
      "validReports": 45
    }
  ]
}
```

### Get User Rank
```http
GET /leaderboard/user/:userId?period=all-time
Authorization: Bearer <token>
```

## GraphQL

### Endpoint
```
http://localhost:3001/graphql
```

### Example Query
```graphql
query {
  platformStats {
    totalBountiesPaid
    activePrograms
    totalResearchers
    vulnerabilitiesFixed
  }
  
  leaderboard(limit: 10) {
    rank
    username
    reputationScore
    totalEarnings
    validReports
  }
  
  programs(status: "ACTIVE", limit: 20) {
    id
    name
    description
    minReward
    maxReward
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Rate Limiting

Default limits:
- **Global**: 100 requests per minute
- **Auth endpoints**: 10 requests per minute
- **File uploads**: 5 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## File Uploads

### Upload Report Attachment
```http
POST /storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
type: "report-attachment"

Response:
{
  "url": "https://...",
  "key": "uploads/...",
  "size": 1024000
}
```

Limits:
- Max file size: 50MB
- Allowed types: Images, PDF, Text, ZIP
- Magic byte validation enabled

## Pagination

List endpoints support pagination:
```http
GET /programs?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Response includes metadata:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

## Search

### Elasticsearch Search
```http
GET /search/programs?q=security&filters[status]=ACTIVE

Response:
{
  "results": [
    {
      "id": "uuid",
      "score": 0.95,
      "name": "Security Program",
      "description": "..."
    }
  ]
}
```

Supports:
- Fuzzy matching
- Multi-field search
- Filtering by status, severity, etc.

## Webhooks (Coming Soon)

Subscribe to events:
- `report.created`
- `report.status_changed`
- `payment.completed`
- `achievement.earned`

---

For interactive API documentation, visit:
- **Swagger UI**: http://localhost:3001/api
- **GraphQL Playground**: http://localhost:3001/graphql
