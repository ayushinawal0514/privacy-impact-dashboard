# Deployment Guide - Healthcare Privacy Compliance System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Production Checklist](#production-checklist)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- CPU: 4+ cores
- RAM: 8GB+ (development), 16GB+ (production)
- Disk: 50GB+ (with historical data)
- OS: Linux, macOS, or Windows with Docker

### Software Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 22+ (for local development)
- Python 3.11+ (for ML service)
- MongoDB 7.0+
- Git 2.30+

### Cloud Platforms
- **AWS**: EC2, RDS, ECS, EKS, ALB
- **Azure**: VMs, AKS, Cosmos DB, Application Gateway
- **GCP**: GCE, GKE, Cloud SQL, Cloud Load Balancing

## Local Development

### Quick Start
```bash
# 1. Clone repository
git clone <repo-url>
cd capstone_project

# 2. Configure environment
cp .env.example .env.local

# 3. Install dependencies
npm ci

# 4. Start all services
docker-compose up -d

# 5. Access application
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
# ML Service: http://localhost:5000
# Kibana: http://localhost:5601
# Grafana: http://localhost:3001
```

### Individual Service Management
```bash
# Start only frontend
docker-compose up frontend

# Start only database
docker-compose up mongodb

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## Docker Deployment

### Build Production Image
```bash
# Build with security scanning
docker build \
  --label "version=1.0.0" \
  --label "environment=production" \
  -t healthcare-compliance:1.0.0 \
  -t healthcare-compliance:latest \
  .

# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image healthcare-compliance:latest
```

### Push to Registry
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag healthcare-compliance:1.0.0 yourregistry/healthcare-compliance:1.0.0

# Push image
docker push yourregistry/healthcare-compliance:1.0.0
```

### Run Single Container
```bash
docker run -d \
  --name healthcare-compliance \
  --env-file .env.production \
  -p 3000:3000 \
  -v mongodb_data:/data/db \
  healthcare-compliance:latest
```

### Docker Stack (Swarm Mode)
```bash
# Deploy stack
docker stack deploy -c docker-compose.yml healthcare

# List services
docker service ls

# View logs
docker service logs healthcare_frontend

# Scale service
docker service scale healthcare_frontend=3

# Remove stack
docker stack rm healthcare
```

## Kubernetes Deployment

### Prerequisites
- kubectl configured
- Kubernetes cluster (1.24+)
- Helm 3.0+ (optional)

### Create Namespace
```bash
kubectl create namespace healthcare-compliance
kubectl label namespace healthcare-compliance environment=production
```

### Deploy with manifests
```bash
# Create secrets
kubectl create secret generic healthcare-secrets \
  --from-file=.env.production \
  -n healthcare-compliance

# Deploy MongoDB
kubectl apply -f k8s/mongodb.yaml -n healthcare-compliance

# Deploy Redis
kubectl apply -f k8s/redis.yaml -n healthcare-compliance

# Deploy ML Service
kubectl apply -f k8s/ml-service.yaml -n healthcare-compliance

# Deploy Frontend/Backend
kubectl apply -f k8s/frontend.yaml -n healthcare-compliance

# Deploy Elasticsearch
kubectl apply -f k8s/elasticsearch.yaml -n healthcare-compliance

# Deploy Prometheus
kubectl apply -f k8s/prometheus.yaml -n healthcare-compliance

# Deploy Grafana
kubectl apply -f k8s/grafana.yaml -n healthcare-compliance
```

### Check Deployments
```bash
# View all resources
kubectl get all -n healthcare-compliance

# Check pod status
kubectl get pods -n healthcare-compliance

# View logs
kubectl logs -f deployment/frontend -n healthcare-compliance

# Port forward for debugging
kubectl port-forward svc/frontend 3000:3000 -n healthcare-compliance
```

### Helm Deployment (Optional)
```bash
# Create Helm chart
helm create healthcare-compliance

# Deploy with Helm
helm install healthcare-compliance ./healthcare-compliance \
  -n healthcare-compliance \
  -f values.yaml

# Upgrade release
helm upgrade healthcare-compliance ./healthcare-compliance \
  -n healthcare-compliance

# Rollback to previous version
helm rollback healthcare-compliance 1
```

## Production Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing (unit, integration, security)
- [ ] Database migrations tested
- [ ] Backup strategy verified
- [ ] Disaster recovery plan documented
- [ ] SSL/TLS certificates provisioned
- [ ] Environment variables secured in vault
- [ ] DNS configured and verified

### Infrastructure
- [ ] Load balancer configured
- [ ] Auto-scaling policies set
- [ ] Network security groups configured
- [ ] Database replication enabled
- [ ] Backup schedules configured
- [ ] Logging centralized (ELK/CloudWatch)
- [ ] Monitoring alerts configured
- [ ] APM (Application Performance Monitoring) enabled

### Security
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API key rotation scheduled
- [ ] Secrets encrypted at rest
- [ ] Audit logging enabled
- [ ] Security patches applied
- [ ] Compliance checklist passed

### Performance
- [ ] Database indexes optimized
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)
- [ ] Load testing completed
- [ ] Response times within SLA
- [ ] Error rates monitored
- [ ] Resource usage optimized

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring dashboards active
- [ ] Alert notifications working
- [ ] Smoke tests passed
- [ ] User acceptance testing complete
- [ ] Documentation updated
- [ ] On-call rotation established
- [ ] Incident response plan ready

## Monitoring & Maintenance

### Daily Checks
```bash
# Check service health
curl http://your-domain/api/health

# Monitor logs for errors
grep ERROR /var/log/healthcare-compliance.log

# Check disk space
df -h /data/mongodb

# Verify backup completion
ls -lh /backups/healthcare-compliance/
```

### Weekly Tasks
- [ ] Review security logs
- [ ] Check backup integrity
- [ ] Verify SSL certificate expiration
- [ ] Review performance metrics
- [ ] Check for pending updates

### Monthly Tasks
- [ ] Security audit
- [ ] Compliance review
- [ ] Cost optimization
- [ ] Capacity planning
- [ ] Disaster recovery drill

### Backup & Restore

#### Automated Backup
```bash
# MongoDB backup via docker
docker-compose exec mongodb mongodump \
  --uri "mongodb://admin:password@localhost:27017/healthcare_compliance" \
  --out /backup/$(date +%Y%m%d)

# Compress backup
tar -czf backup-$(date +%Y%m%d).tar.gz /backup/$(date +%Y%m%d)
```

#### Restore from Backup
```bash
# Extract backup
tar -xzf backup-20240119.tar.gz

# Restore MongoDB
docker-compose exec mongodb mongorestore \
  --uri "mongodb://admin:password@localhost:27017" \
  /backup/20240119
```

### Database Maintenance
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh

# Check database stats
db.stats()

# Rebuild indexes
db.collection_name.reIndex()

# Cleanup old logs (keep last 30 days)
db.system_logs.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 30*24*60*60*1000) }
})
```

## Troubleshooting

### Common Issues

#### Services not starting
```bash
# Check Docker system
docker system df
docker system prune

# View detailed logs
docker-compose logs --tail=100 frontend

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d
```

#### Database connection errors
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check connection string in logs
docker-compose logs frontend | grep MONGODB_URI

# Verify network connectivity
docker network inspect capstone_project_healthcare-network
```

#### Memory issues
```bash
# Check container memory usage
docker stats

# Limit container memory
docker update --memory 2g container_name

# Monitor application
docker-compose exec frontend npm ls
```

#### SSL/Certificate issues
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/domain.crt -noout -dates

# Renew Let's Encrypt (if applicable)
certbot renew --dry-run

# Update certificate in application
docker-compose restart frontend
```

### Performance Debugging

```bash
# Check slow queries (MongoDB)
docker-compose exec mongodb mongosh
> db.setProfilingLevel(1, { slowms: 100 })
> db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()

# Monitor Node.js
docker exec <container> node --inspect=0.0.0.0:9229

# Check Redis
docker-compose exec redis redis-cli
> INFO stats
> DBSIZE
```

### Emergency Procedures

#### Service Recovery
```bash
# Kill zombie processes
docker-compose kill
docker-compose rm -f

# Restart from scratch
docker-compose up -d
```

#### Database Corruption
```bash
# Backup current database
mongodump --uri="mongodb://admin:password@localhost:27017/healthcare_compliance"

# Repair database
mongod --repairs

# Restore from backup
mongorestore --uri="mongodb://admin:password@localhost:27017" dump/
```

## Scaling

### Horizontal Scaling
```bash
# Docker Compose - scale frontend
docker-compose up -d --scale frontend=3

# Kubernetes - scale deployment
kubectl scale deployment frontend --replicas=5 -n healthcare-compliance
```

### Vertical Scaling
```yaml
# Kubernetes resource limits
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## Cost Optimization

- Use reserved instances for base load
- Implement auto-scaling based on metrics
- Optimize database queries
- Use CDN for static assets
- Archive old logs to cheaper storage
- Right-size container resources

---

**For additional support, see the main README.md or contact your DevOps team.**
