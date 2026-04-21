# Capstone Project - Comprehensive Refactoring Roadmap

**Created:** April 22, 2026  
**Project Type:** MERN Stack (Next.js Frontend + Express Backend)  
**Status:** Detailed Analysis Complete

---

## EXECUTIVE SUMMARY

Your capstone project has significant structural issues:
- **Duplicate frontend folders** (root `app/` and `frontend/app/`)
- **Mixed dependencies** in root package.json (backend + frontend)
- **Configuration files at wrong level** (next.config.ts, tsconfig.json at root)
- **Root-level utilities** that should be in frontend/lib
- **Backend is well-structured** (no dead code found)

**Action:** Consolidate root `app/` as the active frontend, delete `frontend/` folder, reorganize configs.

---

## PART 1: CURRENT STATE ANALYSIS

### 1.1 DUPLICATE FILES BETWEEN ROOT APP/ AND FRONTEND/APP/

| File | Root app/ | Frontend app/ | Status |
|------|-----------|-------------|--------|
| page.tsx | ✅ Complete | ✅ Partial | **Root is active** |
| layout.tsx | ✅ Complete | ✅ Complete | **Root is active** |
| providers.tsx | ✅ Complete | ✅ Complete | **Root is active** |
| login/page.tsx | ✅ Complete | ✅ Complete | **Root is active** |
| register/page.tsx | ✅ Complete | ✅ Complete | **Root is active** |
| dashboard/page.tsx | ✅ Complete | ✅ Partial | **Root is active** |
| compliance/page.tsx | ✅ Complete | ❌ Missing | **Root only** |
| components/dashboard/ | ✅ 7 components | ❌ Missing | **Root only** |
| api/ routes | ✅ 9 routes | ✅ 1 route | **Root is primary** |

**Verdict:** Root `app/` is the active frontend. Frontend `app/` is a duplicate that's incomplete and unused.

### 1.2 API ROUTES COMPARISON

**Root app/api/** (ACTIVE - 9 routes):
1. `access-logs/route.ts` ✅ Complete
2. `alerts/route.ts` ✅ Complete
3. `audit-reports/route.ts` ✅ Complete
4. `auth/[...nextauth]/route.ts` ✅ Complete
5. `compliance/route.ts` ✅ Complete
6. `dashboard/metrics/route.ts` ✅ Complete
7. `health/route.ts` ✅ Complete
8. `register/route.ts` ✅ Complete
9. `risks/route.ts` ✅ Complete

**Frontend app/api/** (INACTIVE - 1 route):
1. `auth/[...nextauth]/route.ts` ⚠️ Partial/Duplicate

### 1.3 ROOT-LEVEL FILES THAT ARE MISPLACED

| File | Current Location | Should Be | Issue |
|------|-----------------|-----------|-------|
| next.config.ts | Root | frontend/ | Frontend-specific config |
| tsconfig.json | Root | frontend/ | Frontend TS config |
| tailwind.config.ts | Root | frontend/ | Frontend styling |
| postcss.config.mjs | Root | frontend/ | Frontend CSS processing |
| jest.config.js | Root | frontend/ | Frontend testing |
| jest.setup.js | Root | frontend/ | Frontend testing |
| package.json | Root | DELETE | Mixed dependencies |
| proxy.ts | Root | frontend/ | Frontend middleware |
| globals.css | Root | frontend/app/ | Frontend styles |
| lib/ | Root | frontend/lib/ | Frontend utilities |
| types/ | Root | SPLIT | Frontend + Backend |
| public/ | Root | frontend/public/ | Frontend assets |
| __tests__/ | Root | frontend/__tests__/ | Frontend tests |

### 1.4 PACKAGE.JSON DEPENDENCY ANALYSIS

**Root package.json (PROBLEMATIC - Mixed dependencies):**

```json
Frontend Dependencies:
  - @next/font, next (16.1.6)
  - react, react-dom (19.2.3)
  - next-auth (4.24.13)
  - recharts (2.10.3)
  - framer-motion (12.34.3)

Backend Dependencies:
  - express (4.18.2)
  - mongodb (7.1.0)
  - socket.io (4.7.2)
  - helmet (7.1.0)
  - winston (3.11.0)

Build Tools:
  - tailwindcss, postcss, autoprefixer
  - jest, @testing-library/*
  - typescript, eslint
```

**Backend package.json (CORRECT):**
- Properly isolated backend dependencies
- Has ts-node-dev for development
- Correct scripts for backend development

**Frontend package.json (CORRECT):**
- Properly isolated frontend dependencies
- Has next dev/build scripts
- Correct scripts for frontend development

**Issue:** Root package.json should be deleted. Use separate backend/ and frontend/ package.json files.

### 1.5 IMPORTS THAT NEED UPDATING

**Current imports in root app/:**
```typescript
// These need to be updated after consolidation
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { hipaaChecks, dpdpaChecks, ... } from "@/lib/compliance-engine";
import { getDatabase, logSystemEvent } from "@/lib/db-operations";
import { analyzeAccessPattern, ... } from "@/lib/compliance-engine";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { ComplianceScoreChart, ... } from "@/app/components/dashboard/Charts";
```

**After consolidation to frontend/, these become:**
```typescript
// Relative imports or proper path aliases
import { authOptions } from "./auth/[...nextauth]/route";
import { hipaaChecks, dpdpaChecks, ... } from "@/lib/compliance-engine";
// etc.
```

### 1.6 BACKEND FILES STATUS

**Backend Structure (Well-organized, no dead code found):**

```
backend/src/
├── server.ts                    ✅ Main entry, all 10 routes registered
├── config/
│   ├── database.ts             ✅ MongoDB connection
│   └── logger.ts               ✅ Winston logger
├── middleware/
│   └── middlewares.ts          ✅ Auth, error handling, logging
├── engines/
│   ├── ruleEngine.ts           ✅ HIPAA/DPDPA rule checking
│   └── anomalyDetector.ts      ✅ Anomaly detection logic
├── routes/
│   ├── access-logs.ts          ✅ GET/POST for access logs
│   ├── alerts.ts               ✅ GET/POST/PUT for alerts
│   ├── audit-reports.ts        ✅ GET/POST for audit reports
│   ├── auth.ts                 ✅ Authentication routes
│   ├── compliance.ts           ✅ GET/POST for compliance
│   ├── dashboard.ts            ✅ Dashboard metrics
│   ├── health.ts               ✅ Health check endpoint
│   ├── report.ts               ✅ Report generation
│   ├── risks.ts                ✅ GET/POST for risks
│   └── upload.ts               ✅ File upload handling
├── types/
│   └── models.ts               ✅ Complete MongoDB interfaces
└── utils/
    └── privacyAnalyzer.ts      ✅ Privacy analysis utilities
```

**Backend Verdict:** No dead code. All 10 routes are properly implemented and registered in server.ts.

---

## PART 2: ROOT-LEVEL LIB FOLDER CONTENT

### 2.1 Files in Root lib/

| File | Used By | Type | Action |
|------|---------|------|--------|
| api-client.ts | Root app/api | Frontend | Move to frontend/lib/ |
| auth.ts | Root app/api | Frontend | Move to frontend/lib/ |
| compliance-engine.ts | Root app/api | Frontend | Move to frontend/lib/ |
| db-operations.ts | Root app/api | Frontend | Move to frontend/lib/ |
| mongodb.ts | Root app/api | Frontend | Move to frontend/lib/ |

**Finding:** All 5 files in root lib/ are used by root app/api routes. They're frontend utilities (NextAuth integration, compliance checking for API routes). They should move to frontend/lib/.

---

## PART 3: ROOT-LEVEL TYPES FOLDER

### 3.1 Files in Root types/

| File | Content | Used By | Action |
|------|---------|---------|--------|
| models.ts | User, RBACPolicy, DataFlow, PrivacyRisk interfaces | Both frontend & backend | **SPLIT** |
| next-auth.d.ts | NextAuth type definitions | Frontend only | Move to frontend/ |

**Finding:** 
- `models.ts` contains both user authentication models AND healthcare data models
- Should be split: auth models stay at root (shared), healthcare models go to backend
- `next-auth.d.ts` is frontend-only

---

## PART 4: STEP-BY-STEP REFACTORING PLAN

### PHASE 1: PREPARATION (Steps 1-5)
Create backup and verify current state before making changes.

### PHASE 2: DELETE INACTIVE FILES (Steps 6-10)
Remove duplicate frontend/ folder and root-level duplicates.

### PHASE 3: REORGANIZE FRONTEND (Steps 11-20)
Move root app/ and configs to frontend/ structure.

### PHASE 4: MOVE SHARED UTILITIES (Steps 21-30)
Reorganize lib, types, and shared files.

### PHASE 5: UPDATE IMPORTS (Steps 31-40)
Update all import paths across frontend and backend.

### PHASE 6: VERIFICATION (Steps 41-45)
Test and verify everything works.

---

## PART 5: DETAILED EXECUTION STEPS

### PHASE 1: PREPARATION

#### Step 1: Create backup
```bash
# Backup entire project
git status                    # Ensure all changes are committed
git tag capstone-v1-prerefactor
```

#### Step 2: List all import usages
Identify every @/ import in the root app/ for updating later.

#### Step 3: Document database connections
Verify that backend and frontend database configurations will work after refactoring.

#### Step 4: Check CI/CD configuration
Review Jenkinsfile to ensure it won't break during refactoring.

#### Step 5: Verify Docker setup
Ensure docker-compose.yml uses separate backend/ and frontend/ directories.

---

### PHASE 2: DELETE INACTIVE FILES (IRREVERSIBLE STEPS)

#### Step 6: DELETE entire frontend/ folder
```bash
rm -r frontend/
```

**Reason:** It's a duplicate with incomplete implementation. Root app/ is the active one.

**Files deleted:**
- frontend/app/ (all pages and components)
- frontend/package.json (outdated, use root lib structure)
- frontend/tsconfig.json (outdated)
- frontend/next.config.ts (outdated)
- frontend/tailwind.config.ts (outdated)
- frontend/postcss.config.mjs (outdated)
- frontend/Dockerfile (we'll create new one)
- frontend/README.md

#### Step 7: DELETE root package.json
```bash
rm package.json
```

**Reason:** It has mixed backend + frontend dependencies. Each folder has its own package.json.

**New structure:** Backend and frontend each manage their own dependencies separately.

#### Step 8: DELETE root-level config files (one at a time, verify each)

```bash
# Frontend configs to delete from root
rm next.config.ts
rm tsconfig.json
rm tailwind.config.ts
rm postcss.config.mjs
rm jest.config.js
rm jest.setup.js
```

**Reason:** These are Next.js frontend configs that should be in frontend/ folder.

#### Step 9: DELETE root-level miscellaneous files
```bash
rm proxy.ts           # Frontend middleware
rm globals.css        # Frontend styles
```

#### Step 10: Mark these for deletion (review before deletion)
```bash
# Review these to decide
ls -la __tests__/     # Is this needed? Recommend moving to frontend/
ls -la public/        # This is frontend assets, move to frontend/
```

---

### PHASE 3: REORGANIZE FRONTEND

#### Step 11: Reorganize root app/ folder structure

**Before:**
```
capstone_project/
├── app/
│   ├── api/
│   ├── components/
│   ├── compliance/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── lib/
├── types/
├── public/
└── package.json (mixed)
```

**After:**
```
capstone_project/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── components/
│   │   ├── compliance/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── lib/
│   ├── public/
│   ├── __tests__/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── jest.config.js
│   ├── jest.setup.js
│   └── Dockerfile
├── backend/
└── docker-compose.yml
```

#### Step 12: Create frontend directory
```bash
mkdir -p frontend
```

#### Step 13: Move app folder to frontend
```bash
mv app frontend/
```

#### Step 14: Move lib folder to frontend
```bash
mv lib frontend/lib
```

#### Step 15: Move public folder to frontend
```bash
mv public frontend/public
```

#### Step 16: Move __tests__ folder to frontend
```bash
mv __tests__ frontend/__tests__
```

#### Step 17: Create frontend/package.json (or copy from analysis)

Use the existing frontend/package.json structure as reference:
```json
{
  "name": "healthcare-compliance-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "@next/font": "^14.2.15",
    "axios": "^1.6.5",
    "framer-motion": "^12.34.3",
    "next": "16.1.6",
    "next-auth": "^4.24.13",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "recharts": "^2.10.3",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/jest": "^29.5.11",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.24",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.2.0",
    "typescript": "^5"
  }
}
```

#### Step 18: Copy frontend config files
```bash
# These exist in the deleted frontend/ folder, recreate them in new location
# Or copy from root to frontend/ before deleting
cp /path/to/tsconfig.json frontend/tsconfig.json
cp /path/to/next.config.ts frontend/next.config.ts
cp /path/to/tailwind.config.ts frontend/tailwind.config.ts
cp /path/to/postcss.config.mjs frontend/postcss.config.mjs
cp /path/to/jest.config.js frontend/jest.config.js
cp /path/to/jest.setup.js frontend/jest.setup.js
```

#### Step 19: Verify frontend structure
```bash
tree frontend/ -L 2
# Should show:
# frontend/
# ├── app/
# ├── lib/
# ├── public/
# ├── __tests__/
# ├── package.json
# ├── tsconfig.json
# ├── next.config.ts
# ├── tailwind.config.ts
# ├── postcss.config.mjs
# ├── jest.config.js
# └── jest.setup.js
```

#### Step 20: Verify backend structure unchanged
```bash
tree backend/ -L 2
# Should show all backend files in place
```

---

### PHASE 4: MOVE AND SPLIT SHARED UTILITIES

#### Step 21: SPLIT types/models.ts into frontend and backend

**Current types/models.ts contains:**
```typescript
// User & RBAC (SHARED/FRONTEND)
export interface User { ... }
export interface RBACPolicy { ... }

// Healthcare Systems (BACKEND)
export interface DataFlow { ... }
export interface PrivacyRisk { ... }
```

**Action:**
1. Create `frontend/lib/types.ts` with User & RBAC models
2. Keep/move `backend/src/types/models.ts` with all backend models

**Step 21a: Create frontend/lib/types.ts**
```typescript
import { ObjectId } from "mongodb";

// ============== User & RBAC ==============
export type UserRole = "admin" | "compliance_officer" | "data_owner" | "auditor" | "viewer";

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  permissions: string[];
  organization: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface RBACPolicy {
  _id?: ObjectId;
  role: UserRole;
  permissions: string[];
  resources: string[];
  actions: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 21b: Update backend/src/types/models.ts**
- Keep all backend-specific models (DataFlow, PrivacyRisk, etc.)
- Remove User and RBACPolicy (or import from shared location)

#### Step 22: Delete root types/ folder (after split)
```bash
rm -r types/
```

#### Step 23: Delete root next-env.d.ts
```bash
rm next-env.d.ts
```

#### Step 24: Verify lib/ moved correctly to frontend/
```bash
# Files that should now be in frontend/lib/:
# - api-client.ts
# - auth.ts
# - compliance-engine.ts
# - db-operations.ts
# - mongodb.ts
# - types.ts (newly created)

ls -la frontend/lib/
```

#### Step 25: Delete root lib/ folder
```bash
rm -r lib/
```

---

### PHASE 5: UPDATE IMPORTS

#### Step 26: Update frontend/app/api/ imports

**File: frontend/app/api/auth/[...nextauth]/route.ts**

Find and replace:
```typescript
// OLD
import clientPromise from "@/lib/mongodb";

// NEW
import clientPromise from "@/lib/mongodb";
```
*No change needed - path alias still works*

**File: frontend/app/api/risks/route.ts**

Find and replace:
```typescript
// OLD
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hipaaChecks, dpdpaChecks, calculateRiskScore } from "@/lib/compliance-engine";

// NEW
import { authOptions } from "./auth/[...nextauth]/route";
import { hipaaChecks, dpdpaChecks, calculateRiskScore } from "@/lib/compliance-engine";
```

#### Step 27: Update frontend/app/ page imports

**File: frontend/app/compliance/page.tsx**

Find and replace:
```typescript
// OLD
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
import { ComplianceScoreChart, RiskDistributionChart, AnomalyTimelineChart } from "@/app/components/dashboard/Charts";

// NEW
import { EnhancedDashboardLayout } from "@/components/dashboard/EnhancedLayout";
import { ComplianceScoreChart, RiskDistributionChart, AnomalyTimelineChart } from "@/components/dashboard/Charts";
```

#### Step 28: Update tsconfig.json path aliases in frontend/

**File: frontend/tsconfig.json**

Verify/update:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

This ensures @/lib, @/app, @/components all resolve correctly within frontend/.

#### Step 29: Update next.config.ts if needed

**File: frontend/next.config.ts**

Check if it has any root-relative paths that need updating. Example:
```typescript
// If it has paths to root, update them
// Old: '../backend/...'
// New: '../backend/...' (backend is sibling directory)
```

#### Step 30: Verify all imports compile

Run TypeScript check in frontend:
```bash
cd frontend
npx tsc --noEmit
```

---

### PHASE 6: VERIFICATION AND TESTING

#### Step 31: Run frontend build
```bash
cd frontend
npm install
npm run build
```

**Expected:** No errors, successful Next.js build.

#### Step 32: Run frontend type check
```bash
cd frontend
npm run lint
```

**Expected:** ESLint passes with no critical errors.

#### Step 33: Run backend startup
```bash
cd backend
npm install
npm run dev
```

**Expected:** Backend starts on port 3001, no connection errors.

#### Step 34: Test frontend-backend API connection

**Step 34a:** Start both services:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Step 34b:** Verify API calls work:
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test frontend can reach backend (from browser console)
fetch('http://localhost:3001/api/health').then(r => r.json()).then(console.log)
```

#### Step 35: Test authentication flow
1. Navigate to http://localhost:3000/login
2. Try logging in with test credentials
3. Verify token is generated
4. Verify dashboard loads

#### Step 36: Run frontend tests
```bash
cd frontend
npm test
```

**Expected:** All tests pass or are updated for new import paths.

#### Step 37: Run backend tests
```bash
cd backend
npm test
```

**Expected:** All tests pass.

#### Step 38: Update Docker configuration

**File: docker-compose.yml**

Update to reference correct paths:
```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
```

#### Step 39: Test Docker build
```bash
docker-compose build
docker-compose up -d
```

**Expected:** Both services start successfully.

#### Step 40: Verify Docker containers communicate
```bash
# From frontend container, test backend connection
docker-compose exec frontend curl http://backend:3001/api/health
```

**Expected:** Health response received.

#### Step 41: Update documentation

Update these files with new structure:
- [README.md](README.md) - Update commands to use frontend/ and backend/ directories
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Update setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - Update architecture diagram
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Update folder structure

#### Step 42: Update CI/CD (Jenkinsfile)

**File: Jenkinsfile**

Update to build frontend and backend separately:
```groovy
stage('Build Frontend') {
    steps {
        dir('frontend') {
            sh 'npm install'
            sh 'npm run build'
        }
    }
}

stage('Build Backend') {
    steps {
        dir('backend') {
            sh 'npm install'
            sh 'npm run build'
        }
    }
}
```

#### Step 43: Final smoke test

1. ✅ Backend starts on port 3001
2. ✅ Frontend starts on port 3000
3. ✅ Frontend can fetch from backend API
4. ✅ Authentication works
5. ✅ Dashboard displays data
6. ✅ All API routes respond correctly

#### Step 44: Commit changes
```bash
git add .
git commit -m "refactor: consolidate frontend structure and separate concerns

- Move root app/ to frontend/app/
- Move root lib/ to frontend/lib/
- Move configs to frontend/
- Delete duplicate frontend/ folder
- Delete mixed root package.json
- Split root types/ between frontend/lib/types and backend/src/types
- Update all import paths in frontend/
- Update docker-compose.yml for new structure
- Update CI/CD pipeline for separate builds"
```

#### Step 45: Tag release
```bash
git tag capstone-v1-refactored
git push --tags
```

---

## PART 6: NEW FINAL STRUCTURE

```
capstone_project/
│
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── logger.ts
│   │   ├── middleware/
│   │   │   └── middlewares.ts
│   │   ├── routes/
│   │   │   ├── access-logs.ts      (GET/POST)
│   │   │   ├── alerts.ts           (GET/POST/PUT)
│   │   │   ├── audit-reports.ts    (GET/POST)
│   │   │   ├── auth.ts             (Login/Register)
│   │   │   ├── compliance.ts       (GET/POST)
│   │   │   ├── dashboard.ts        (GET metrics)
│   │   │   ├── health.ts           (GET health check)
│   │   │   ├── report.ts           (GET report)
│   │   │   ├── risks.ts            (GET/POST)
│   │   │   └── upload.ts           (POST file upload)
│   │   ├── engines/
│   │   │   ├── ruleEngine.ts
│   │   │   └── anomalyDetector.ts
│   │   ├── types/
│   │   │   └── models.ts (backend-specific)
│   │   └── utils/
│   │       └── privacyAnalyzer.ts
│   ├── .env (backend environment)
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── access-logs/route.ts
│   │   │   ├── alerts/route.ts
│   │   │   ├── audit-reports/route.ts
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── compliance/route.ts
│   │   │   ├── dashboard/metrics/route.ts
│   │   │   ├── health/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── risks/route.ts
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── Charts.tsx
│   │   │       ├── ComplianceStatus.tsx
│   │   │       ├── DashboardLayout.tsx
│   │   │       ├── DataFlowVisualization.tsx
│   │   │       ├── EnhancedLayout.tsx
│   │   │       ├── MetricCard.tsx
│   │   │       ├── RiskTable.tsx
│   │   │       └── index.ts
│   │   ├── compliance/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── compliance-engine.ts
│   │   ├── db-operations.ts
│   │   ├── mongodb.ts
│   │   └── types.ts (User & RBAC models)
│   ├── public/
│   │   ├── logo.png
│   │   └── [other assets]
│   ├── __tests__/
│   │   └── compliance-engine.test.ts
│   ├── .env.local (frontend environment)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── Dockerfile
│   └── README.md
│
├── infrastructure/
│   └── prometheus.yml
│
├── ml/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml (updated)
├── Jenkinsfile (updated)
├── Jenkinsfile-new (updated)
├── eslint.config.mjs
├── ARCHITECTURE.md (updated)
├── DEPLOYMENT.md (updated)
├── README.md (updated)
├── SETUP_GUIDE.md (updated)
├── SECURITY.md
├── IMPLEMENTATION_SUMMARY.md
├── PROJECT_STRUCTURE.md (updated)
├── REFACTORING_ROADMAP.md (this file)
└── init-mongo.js (if needed)
```

---

## PART 7: IMPORT PATHS - BEFORE & AFTER

### Frontend imports - BEFORE (root app/)
```typescript
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { hipaaChecks } from "@/lib/compliance-engine";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
```

### Frontend imports - AFTER (frontend/app/)
```typescript
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Still works with @/ alias
import clientPromise from "@/lib/mongodb";  // Still works with @/ alias
import { hipaaChecks } from "@/lib/compliance-engine";  // Still works with @/ alias
import { EnhancedDashboardLayout } from "@/components/dashboard/EnhancedLayout";  // Relative
```

### Backend imports - UNCHANGED
```typescript
// Backend uses relative imports and doesn't have @ aliases
import { getDB } from '../config/database';
import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/middlewares';
```

---

## PART 8: VERIFICATION CHECKLIST

### Pre-Refactoring
- [ ] All code is committed to git
- [ ] Tag created: `git tag capstone-v1-prerefactor`
- [ ] All current tests pass
- [ ] Backend and frontend both start successfully

### During Refactoring
- [ ] Complete Phase 1 (Preparation)
- [ ] Complete Phase 2 (Delete inactive files)
- [ ] Complete Phase 3 (Reorganize frontend)
- [ ] Complete Phase 4 (Move shared utilities)
- [ ] Complete Phase 5 (Update imports)

### Post-Refactoring
- [ ] Frontend builds without errors: `cd frontend && npm run build`
- [ ] Frontend TypeScript check passes: `cd frontend && npx tsc --noEmit`
- [ ] Backend builds without errors: `cd backend && npm run build`
- [ ] Backend starts on port 3001
- [ ] Frontend starts on port 3000
- [ ] API calls from frontend to backend work
- [ ] Authentication login works
- [ ] Dashboard loads and displays data
- [ ] All API routes respond correctly
- [ ] Docker builds both images
- [ ] Docker Compose starts both services
- [ ] Frontend and backend can communicate in Docker
- [ ] Tests pass (frontend and backend)
- [ ] All documentation is updated
- [ ] CI/CD pipeline updated and tested

### Final Steps
- [ ] Commit refactoring changes
- [ ] Tag released version: `git tag capstone-v1-refactored`
- [ ] Push to main branch
- [ ] Verify remote repository has all changes
- [ ] All team members pull and test locally

---

## PART 9: ROLLBACK PLAN (If needed)

If something goes wrong during refactoring:

```bash
# Rollback to pre-refactoring state
git reset --hard capstone-v1-prerefactor

# Or checkout specific commit
git log --oneline | head -20
git checkout <commit-hash>
```

---

## PART 10: SUMMARY OF CHANGES

| Action | Items | Files | Lines |
|--------|-------|-------|-------|
| **DELETE** | Duplicate frontend/ folder | ~15 files | ~1000+ lines |
| **DELETE** | Root package.json | 1 file | 50 lines |
| **DELETE** | Root configs (6 files) | 6 files | ~500 lines |
| **DELETE** | Root lib/ | 5 files | ~500 lines |
| **DELETE** | Root types/ | 2 files | ~200 lines |
| **MOVE** | app/ → frontend/app/ | 13 items | (no change) |
| **MOVE** | lib/ → frontend/lib/ | 5 files | (no change) |
| **MOVE** | public/ → frontend/public/ | ~10 files | (no change) |
| **MOVE** | __tests__/ → frontend/__tests__/ | 1 file | ~200 lines |
| **CREATE** | frontend/package.json | 1 file | 40 lines |
| **CREATE** | frontend/lib/types.ts | 1 file | ~100 lines |
| **UPDATE** | Import paths | ~20 files | ~50 changes |
| **UPDATE** | docker-compose.yml | 1 file | ~10 changes |
| **UPDATE** | Jenkinsfile | 1 file | ~20 changes |
| **UPDATE** | Documentation | 4 files | ~100 changes |

**Total:** ~80 files affected, ~600+ import path updates, ~3000+ lines removed (duplicates)

---

## RECOMMENDATIONS

1. **Do this refactoring NOW** before adding more features
2. **Follow the steps in order** - don't skip verification steps
3. **Test locally first** before pushing to CI/CD
4. **Keep frontend/ and backend/ separate** - they're different concerns
5. **Use Docker Compose** for local development (ensures consistency)
6. **Update CI/CD pipeline** to build frontend and backend independently

---

## NEXT STEPS AFTER REFACTORING

Once refactoring is complete:

1. Update monitoring/logging to reference new paths
2. Update team documentation with new folder structure
3. Train team on running frontend/ and backend/ separately
4. Consider monorepo tools (Nx, Turbo) if you need advanced features
5. Set up proper environment separation (dev/staging/prod)
6. Implement proper logging between services

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Status:** Ready for Implementation
