# Healthcare Privacy Compliance Backend

Express.js-based REST API backend for the healthcare privacy compliance platform.

## Structure

```
src/
├── server.ts           # Express app entry point
├── config/
│   ├── database.ts     # MongoDB connection & initialization
│   └── logger.ts       # Winston logger configuration
├── middleware/
│   └── middlewares.ts  # Auth, logging, error handling
├── routes/
│   ├── auth.ts         # Authentication endpoints
│   ├── risks.ts        # Privacy risks endpoints
│   ├── access-logs.ts  # Access logging endpoints
│   ├── compliance.ts   # Compliance assessment endpoints
│   ├── audit-reports.ts # Audit reporting endpoints
│   ├── alerts.ts       # Alert management endpoints
│   ├── dashboard.ts    # Dashboard metrics endpoints
│   └── health.ts       # Health check endpoints
├── types/
│   └── models.ts       # TypeScript interfaces
├── utils/
│   └── helpers.ts      # Utility functions
└── engines/
    └── compliance-engine.ts # Compliance validation logic
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## API Endpoints

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Risks**: `GET /api/risks`, `POST /api/risks`, `PUT /api/risks/:id`, `DELETE /api/risks/:id`
- **Access Logs**: `GET /api/access-logs`, `POST /api/access-logs`, `GET /api/access-logs/analytics`
- **Compliance**: `GET /api/compliance`, `POST /api/compliance/generate-report`, `GET /api/compliance/history`
- **Audit Reports**: `GET /api/audit-reports`, `POST /api/audit-reports`
- **Alerts**: `GET /api/alerts`, `POST /api/alerts`, `PUT /api/alerts/:id/resolve`
- **Dashboard**: `GET /api/dashboard/metrics`, `GET /api/dashboard/activity`, `GET /api/dashboard/compliance-timeline`
- **Health**: `GET /api/health`

## Environment Variables

See `.env.example` for required environment variables.
