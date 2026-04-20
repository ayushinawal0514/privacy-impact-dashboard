# Healthcare Privacy Compliance System - Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                 │
│  Dashboard • Risk Analytics • Compliance Reporting • Alerts │
└────────┬────────────────────────────────────────────────────┘
         │
┌────────▼────────────────────────────────────────────────────┐
│          API Layer (Next.js Routes + Middleware)            │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ Auth Routes  │ Risk APIs    │ Compliance   │             │
│  ├──────────────┼──────────────┼──────────────┤             │
│  │ Access Logs  │ Alerts       │ Audit        │             │
│  │ Dashboard    │ ML Integration              │             │
│  └──────────────┴──────────────┴──────────────┘             │
└────────┬────────────────────────────────────────────────────┘
         │
    ┌────┴─────────────────────────┬────────────────┐
    │                              │                │
┌───▼────────────┐      ┌─────────▼──────┐   ┌───▼──────────┐
│  MongoDB       │      │  Redis Cache   │   │ ML Service   │
│  ├─ Users      │      │  (Real-time)   │   │ (Python)     │
│  ├─ Systems    │      │  ├─ Sessions   │   │ ├─ Training  │
│  ├─ Risks      │      │  ├─ Alerts     │   │ ├─ Inference │
│  ├─ Logs       │      │  └─ Cache      │   │ └─ Scoring   │
│  └─ Reports    │      └────────────────┘   └──────────────┘
└────────────────┘
    │
    ├─────────────────────────────────────────────────┐
    │                                                 │
┌───▼────────────────┐                ┌──────────────▼────┐
│ Observability      │                │  Backups & Recovery
│ ├─ Elasticsearch   │                │  ├─ Daily Backups
│ ├─ Kibana          │                │  ├─ Geo-redundant
│ ├─ Prometheus      │                │  └─ 30-day Retention
│ └─ Grafana         │                └───────────────────┘
└────────────────────┘
```

## Component Architecture

### Frontend Layer (React 19.2 + Next.js 16)

**Dashboard Components**:
- `EnhancedLayout` - Main dashboard shell with navigation
- `RiskDistributionChart` - Risk severity visualization
- `ComplianceScoreChart` - Compliance score gauge
- `AnomalyTimelineChart` - Access anomaly trends
- `MetricCard` - KPI cards with trends
- Real-time alert notifications

**Pages**:
- `/dashboard` - Overview & metrics
- `/dashboard/compliance` - Compliance assessment
- `/dashboard/risks` - Risk management
- `/dashboard/access-logs` - Access log review
- `/dashboard/alerts` - Alert center
- `/login` - Authentication
- `/register` - User registration

### Backend Layer (Next.js Routes)

**API Structure**:
```
/api
├── /auth
│   ├── /signin - POST
│   ├── /signup - POST
│   └── /signout - POST
├── /risks
│   ├── GET, POST
│   └── /:id - PATCH
├── /compliance
│   ├── GET - compliance assessment
│   └── POST - run checks
├── /access-logs
│   ├── GET - fetch logs
│   ├── POST - log access
│   └── /anomalies - GET
├── /audit-reports
│   ├── GET - fetch reports
│   └── POST - generate report
├── /alerts
│   ├── GET - fetch alerts
│   └── POST - acknowledge/create
├── /dashboard
│   └── /metrics - dashboard data
└── /health - service health
```

### Database Layer (MongoDB)

**Collections**:
- `users` - User accounts, authentication
- `rbac_policies` - Role definitions
- `healthcare_systems` - Registered systems
- `data_flows` - Data movement tracking
- `access_logs` - User access records
- `privacy_risks` - Identified risks
- `compliance_violations` - Violations detected
- `compliance_scores` - Assessment results
- `audit_reports` - Compliance reports
- `alerts` - Real-time alerts
- `anomaly_records` - ML detection results
- `system_logs` - Application logs
- `audit_trails` - Change tracking

### ML Service (Python/Flask)

**Endpoints**:
- `POST /api/train` - Train anomaly model
- `POST /api/predict` - Score access for anomaly
- `POST /api/analyze` - Analyze access patterns
- `GET /api/status` - Model status
- `GET /health` - Service health

**ML Components**:
- Isolation Forest (contamination=0.1)
- StandardScaler for feature normalization
- Baseline calculation for time-series patterns
- Feature engineering (temporal, volumetric, behavioral)
- Risk indicators (bulk access, off-hours, sensitive actions)

### Security Layer

**Authentication**:
- NextAuth.js with OAuth2/OIDC
- JWT tokens (RS256)
- Session management
- MFA support

**Authorization**:
- 5-tier RBAC model
- Permission-based access control
- Endpoint ACL validation
- Resource-level permissions

**Encryption**:
- AES-256 at rest
- TLS 1.3 in transit
- Key rotation quarterly
- HSM support for production

### Observability Stack

**Metrics** (Prometheus):
- API response times
- Request rates
- Error rates
- ML model performance
- Database queries
- Cache hit rates

**Logging** (ELK):
- Centralized log collection
- Real-time log analysis
- Audit trail tracking
- Alerting on patterns

**Dashboards** (Grafana):
- System health
- Compliance trends
- Alert metrics
- ML model performance

## Data Flow

### Privacy Risk Detection Flow
```
Access Event
    │
    ▼
[Access Log API]
    │
    ├─→ [Database] - Store log
    │       │
    │       └─→ [ML Service] - Score anomaly
    │               │
    │               ▼
    │           [Anomaly Detected?]
    │               │
    │               ├─ Yes ──→ [Create Alert]
    │               │              │
    │               │              └─→ [RealTimeAlert API]
    │               │
    │               └─ No ──→ [Continue]
    │
    └─→ [Compliance Engine]
            │
            ├─→ HIPAA Checks
            ├─→ DPDPA Checks
            │
            ▼
        [Calculate Risk]
        [Store Risk]
        [Create Alert if Critical]
        [Update Metrics]
```

### Compliance Assessment Flow
```
[Compliance API] POST
    │
    ├─→ [Authorization Check]
    │
    ├─→ [Run HIPAA Checks]
    │   ├─ Encryption status
    │   ├─ Access controls
    │   └─ Audit logging
    │
    ├─→ [Run DPDPA Checks]
    │   ├─ Consent management
    │   ├─ Data minimization
    │   └─ Retention policies
    │
    ├─→ [Calculate Score]
    │
    ├─→ [Store Results]
    │
    └─→ [Generate Recommendations]
```

### Anomaly Detection Flow
```
[Access Event] 
    │
    ├─→ [Feature Extraction]
    │   ├─ Duration, Volume
    │   ├─ Time of day
    │   └─ Day of week
    │
    ├─→ [Get Baseline]
    │   ├─ 30-day history
    │   └─ Normal patterns
    │
    ├─→ [Calculate Z-Score]
    │   └─ Volume & Time deviation
    │
    ├─→ [Isolation Forest]
    │   └─ Predict: Anomaly or Normal
    │
    └─→ [Score Result]
        ├─ Score: 0-1
        └─ Threshold: 0.7
```

## Deployment Architecture

### Docker Compose (Development/Staging)
```
docker-compose.yml
├── frontend (port 3000)
├── mongodb (port 27017)
├── redis (port 6379)
├── ml-service (port 5000)
├── elasticsearch (port 9200)
├── kibana (port 5601)
├── prometheus (port 9090)
└── grafana (port 3001)
```

### Kubernetes (Production)
```
healthcare-compliance namespace
├── Deployments
│   ├── frontend (replicas: 3)
│   ├── ml-service (replicas: 2)
│   └── elasticsearch (statefulset)
├── StatefulSets
│   ├── mongodb
│   └── redis
├── Services
│   ├── frontend-service (LoadBalancer)
│   ├── api-service (ClusterIP)
│   └── internal-services
├── ConfigMaps
│   └── application-config
├── Secrets
│   ├── database-credentials
│   ├── oauth-secrets
│   └── encryption-keys
└── Ingress
    └── traffic-routing
```

### CI/CD Pipeline (Jenkins)

**Stages**:
1. Initialize workspace
2. Verify environment
3. Install dependencies
4. Code quality checks (ESLint)
5. Security scanning (npm audit, secret detection)
6. Unit & integration tests
7. Build application
8. Build Docker image
9. Security scanning (Trivy)
10. Push to registry
11. Deploy to environment
12. Health checks
13. Smoke tests
14. Approval workflow
15. Post-deployment verification

## Performance Optimization

### Frontend
- Code splitting with Next.js
- Image optimization
- CSS-in-JS (Tailwind)
- Lazy loading components
- Client-side caching

### Backend
- Connection pooling (MongoDB)
- Redis caching
- Query optimization with indexes
- Request deduplication
- Gzip compression

### Database
- Strategic indexing
- Query optimization
- Aggregation pipelines
- Sharding capability
- Replication

### Monitoring
- Real-time dashboards
- Automated alerting
- Performance trending
- Capacity planning
- Cost tracking

## Disaster Recovery

**RTO**: 4 hours
**RPO**: 1 hour

### Backup Strategy
- Daily incremental backups
- Weekly full backups
- Monthly archives
- Geo-redundant storage
- 30-day retention minimum

### Recovery Procedures
1. Detect failure/disaster
2. Activate recovery team
3. Restore from backup
4. Verify data integrity
5. Perform smoke tests
6. Restore to production
7. Monitor and validate

## Compliance Mapping

### HIPAA
- ✓ Technical Safeguards (encryption, audit controls)
- ✓ Administrative Safeguards (access management, training)
- ✓ Physical Safeguards (facility controls)
- ✓ Breach notification procedures
- ✓ Audit logging (6+ years)

### DPDPA
- ✓ Consent collection & management
- ✓ Purpose limitation
- ✓ Data minimization
- ✓ Right to access/deletion
- ✓ Data retention policies
- ✓ Privacy impact assessments
- ✓ Audit trail

---

**Last Updated**: January 19, 2024
**Version**: 1.0.0
