# Healthcare Privacy Compliance Frontend

Next.js React-based frontend for the healthcare privacy compliance platform.

## Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── providers.tsx       # Session provider
├── globals.css         # Global styles
├── login/
│   └── page.tsx        # Login page
├── register/
│   └── page.tsx        # Register page
├── dashboard/
│   └── page.tsx        # Dashboard page
├── compliance/
│   └── page.tsx        # Compliance page
├── components/         # React components
│   ├── dashboard/
│   │   ├── ComplianceStatus.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── DataFlowVisualization.tsx
│   │   ├── MetricCard.tsx
│   │   └── RiskTable.tsx
│   └── common/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
└── api/               # API utility functions
    └── client.ts      # Axios instance
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
npm run build
```

## Production

```bash
npm start
```

## Key Features

- Real-time compliance monitoring dashboard
- Privacy risk visualization
- Access log analysis
- Audit reporting
- Alert management
- Multi-role authentication

## Environment Variables

See `.env.example` for required environment variables.
