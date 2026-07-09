# Deployment

## Quick Deploy (Docker)

```bash
docker run -p 3001:3001 altrugenix/cms
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure JWT secret (`JWT_SECRET`)
- [ ] Set database URL (`DATABASE_URL`)
- [ ] Configure storage backend (local/S3/R2)
- [ ] Set up reverse proxy (nginx/Caddy)
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CI/CD pipeline

## Supported Deployments

- **Docker** — Single container with multi-stage build
- **Docker Compose** — CMS + PostgreSQL + nginx
- **PM2** — Process manager for Node.js
- **Serverless** — Vercel, Netlify (API only)
- **VPS** — Direct deployment on any Linux server

See the full Deployment Guide in the repository for detailed instructions.
