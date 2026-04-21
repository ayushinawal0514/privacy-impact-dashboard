# Capstone Refactoring - Quick Reference & Command Guide

**For detailed information, see:** [REFACTORING_ROADMAP.md](REFACTORING_ROADMAP.md)

---

## QUICK DECISION MATRIX

| Item | Current | Keep? | Reason |
|------|---------|-------|--------|
| Root `app/` | Active | ❌ MOVE | Move to `frontend/app/` |
| `frontend/app/` | Duplicate | ❌ DELETE | Inactive, incomplete copy |
| Root `package.json` | Mixed deps | ❌ DELETE | Use separate backend/frontend |
| Root configs (6 files) | Frontend | ❌ MOVE | Move to `frontend/` |
| Root `lib/` | Frontend utils | ❌ MOVE | Move to `frontend/lib/` |
| Root `types/` | Mixed | ⚠️ SPLIT | Auth→frontend, Data→backend |
| Root `public/` | Frontend assets | ❌ MOVE | Move to `frontend/public/` |
| Root `__tests__/` | Tests | ❌ MOVE | Move to `frontend/__tests__/` |
| `backend/` | Backend code | ✅ KEEP | Already correct |
| `docker-compose.yml` | Docker | ✅ UPDATE | Change paths for new structure |
| `Jenkinsfile` | CI/CD | ✅ UPDATE | Build frontend and backend separately |

---

## PHASE-BY-PHASE EXECUTION

### Phase 1: Preparation (5 minutes)
```bash
# Ensure everything is committed
git status
git add .
git commit -m "pre-refactoring checkpoint"

# Create backup tag
git tag capstone-v1-prerefactor
```

### Phase 2: Delete Inactive Files (2 minutes)
```bash
# DELETE entire frontend/ folder
rm -r frontend/

# DELETE root package.json
rm package.json

# DELETE root configs
rm next.config.ts
rm tsconfig.json
rm tailwind.config.ts
rm postcss.config.mjs
rm jest.config.js
rm jest.setup.js

# DELETE root files
rm proxy.ts
rm globals.css
rm next-env.d.ts
```

### Phase 3: Reorganize Frontend (5 minutes)
```bash
# Create frontend directory
mkdir -p frontend

# Move app folder
mv app frontend/

# Move lib folder
mv lib frontend/lib

# Move public folder
mv public frontend/public

# Move tests folder
mv __tests__ frontend/__tests__

# Delete types folder (will recreate split version)
rm -r types/
```

### Phase 4: Copy Frontend Configs (3 minutes)
```bash
# Copy from backup or recreate
# IMPORTANT: These files should exist in deleted frontend/ folder
# Option 1: If you have them saved, copy them
cp /backup/frontend/package.json frontend/
cp /backup/frontend/tsconfig.json frontend/
cp /backup/frontend/next.config.ts frontend/
cp /backup/frontend/tailwind.config.ts frontend/
cp /backup/frontend/postcss.config.mjs frontend/
cp /backup/frontend/jest.config.js frontend/
cp /backup/frontend/jest.setup.js frontend/
cp /backup/frontend/Dockerfile frontend/

# Option 2: Use from original root (if configs are duplicated there)
# Create new ones with correct settings for frontend/
```

### Phase 5: Split Types (2 minutes)
```bash
# Create frontend types
mkdir -p frontend/lib
# Create frontend/lib/types.ts with User/RBAC models
# (See REFACTORING_ROADMAP.md Part 4 Step 21a for content)

# Backend types already exist at backend/src/types/models.ts
# Just verify it has the data models (DataFlow, PrivacyRisk, etc.)
```

### Phase 6: Verify Structure (1 minute)
```bash
# Check new structure
tree -L 2 frontend/
tree -L 2 backend/

# Expected:
# frontend/
# ├── app/
# ├── lib/
# ├── public/
# ├── __tests__/
# ├── package.json
# ├── tsconfig.json
# └── ... configs

# backend/
# ├── src/
# ├── package.json
# ├── tsconfig.json
# └── Dockerfile
```

### Phase 7: Update Imports (10 minutes)
```bash
# Use find and replace in your editor or:
# Search in frontend/ for imports that need updating
grep -r "@/app/" frontend/
grep -r "@/lib/" frontend/

# Common replacements needed in frontend/app/api/routes:
# OLD: import { authOptions } from "@/app/api/auth/[...nextauth]/route";
# NEW: import { authOptions } from "./auth/[...nextauth]/route";
```

### Phase 8: Build & Test (10 minutes)
```bash
# Test frontend
cd frontend
npm install
npm run build
npm run lint
cd ..

# Test backend  
cd backend
npm install
npm run build
npm run lint
cd ..

# Run both services
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Test in browser: http://localhost:3000
```

### Phase 9: Update Docker (2 minutes)
```bash
# Edit docker-compose.yml - update context paths
# OLD: context: .
# NEW: context: ./frontend or ./backend

docker-compose build
docker-compose up -d
```

### Phase 10: Commit & Tag (1 minute)
```bash
git add .
git commit -m "refactor: consolidate frontend structure and separate concerns"
git tag capstone-v1-refactored
```

---

## CRITICAL FILES TO CHECK

### After moving frontend/lib/types.ts
```bash
# Verify imports work in:
frontend/app/api/auth/[...nextauth]/route.ts
frontend/app/api/risks/route.ts
backend/src/routes/risks.ts
backend/src/routes/compliance.ts
```

### After moving app/ to frontend/
```bash
# Verify these files exist and have correct imports:
frontend/app/api/access-logs/route.ts      ✅ Must exist
frontend/app/api/alerts/route.ts           ✅ Must exist
frontend/app/api/compliance/route.ts       ✅ Must exist
frontend/app/compliance/page.tsx           ✅ Must exist
frontend/app/dashboard/page.tsx            ✅ Must exist
frontend/app/components/dashboard/*.tsx    ✅ Must all exist
```

### After updating imports
```bash
# Run type check to catch import errors
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```

---

## IMPORT PATH QUICK REFERENCE

### Frontend TypeScript Alias (in frontend/tsconfig.json)
```json
"paths": {
  "@/*": ["./*"]
}
```

This allows:
- `@/app` → points to `frontend/app`
- `@/lib` → points to `frontend/lib`
- `@/components` → points to `frontend/components`

### Example Import Changes

**Before (root app/):**
```typescript
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";
import { EnhancedDashboardLayout } from "@/app/components/dashboard/EnhancedLayout";
```

**After (frontend/app/):**
```typescript
import { authOptions } from "@/app/api/auth/[...nextauth]/route";  // ✅ Still works
import clientPromise from "@/lib/mongodb";                          // ✅ Still works
import { EnhancedDashboardLayout } from "@/components/dashboard/EnhancedLayout";  // ✅ Works
```

**OR use relative imports:**
```typescript
import { authOptions } from "./auth/[...nextauth]/route";
import { EnhancedDashboardLayout } from "../../../components/dashboard/EnhancedLayout";
```

---

## ROLLBACK (If something breaks)

```bash
# Rollback to pre-refactoring state
git reset --hard capstone-v1-prerefactor

# Or if you need to see what changed
git diff capstone-v1-prerefactor..HEAD
```

---

## VERIFICATION CHECKLIST

**After each major phase, verify:**

- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] ESLint passes: `npm run lint`
- [ ] Builds complete: `npm run build`
- [ ] Backend starts: `npm run dev` (on port 3001)
- [ ] Frontend starts: `npm run dev` (on port 3000)
- [ ] API calls work: Test in browser console
- [ ] Authentication works: Try login
- [ ] Dashboard loads: Navigate to /dashboard

---

## TESTING API CONNECTIVITY

After both services are running:

```bash
# 1. Test backend is up
curl http://localhost:3001/api/health

# 2. Test from frontend (in browser console)
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)

# 3. Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

---

## DOCKER TESTING

```bash
# Build both images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Test from frontend container
docker-compose exec frontend curl http://backend:3001/api/health

# Stop services
docker-compose down
```

---

## FINAL STRUCTURE TREE

```
capstone_project/
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/              [10 routes, all used]
│   │   ├── engines/             [ruleEngine, anomalyDetector]
│   │   ├── config/              [database, logger]
│   │   ├── middleware/
│   │   ├── types/               [data models]
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── app/
│   │   ├── api/                 [9 API routes]
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
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   ├── compliance-engine.ts
│   │   ├── db-operations.ts
│   │   ├── mongodb.ts
│   │   └── types.ts             [User & RBAC models]
│   ├── public/
│   ├── __tests__/
│   ├── .env.local
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
├── docker-compose.yml          [UPDATED]
├── Jenkinsfile                 [UPDATED]
├── eslint.config.mjs
├── REFACTORING_ROADMAP.md      [THIS PLAN]
├── ARCHITECTURE.md             [UPDATE]
├── DEPLOYMENT.md               [UPDATE]
├── SETUP_GUIDE.md              [UPDATE]
├── SECURITY.md
├── IMPLEMENTATION_SUMMARY.md
├── PROJECT_STRUCTURE.md        [UPDATE]
└── README.md                   [UPDATE]
```

---

## TIME ESTIMATE

| Phase | Duration | Steps |
|-------|----------|-------|
| 1. Preparation | 5 min | 1-5 |
| 2. Delete files | 2 min | 6-10 |
| 3. Reorganize | 5 min | 11-20 |
| 4. Move utilities | 2 min | 21-30 |
| 5. Update imports | 10 min | 31-40 |
| 6. Test & verify | 15 min | 41-45 |
| **TOTAL** | **40 min** | **45 steps** |

---

## HELPFUL COMMANDS

```bash
# Find all import statements
grep -r "import.*@/" frontend/

# Count import statements
grep -r "import.*@/" frontend/ | wc -l

# Replace imports in bulk (use carefully!)
find frontend -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/app/|./|g'

# Verify no circular imports
npx madge --circular frontend/

# Check bundle size
npx next build && du -sh frontend/.next

# Run all tests
npm test --workspace=frontend --workspace=backend
```

---

## COMMON MISTAKES TO AVOID

❌ **DON'T:**
- Delete files without backup/git tag
- Update imports before moving files
- Mix backend and frontend dependencies
- Keep duplicate folders
- Run both Next.js and backend from root

✅ **DO:**
- Follow phases in order
- Test after each phase
- Use git tags to mark progress
- Keep frontend and backend completely separate
- Use path aliases (@/) consistently

---

## NEED HELP?

1. **Import errors?** → Check frontend/tsconfig.json paths
2. **Modules not found?** → Verify file was moved to frontend/
3. **API not responding?** → Check backend is running on 3001
4. **Build fails?** → Run `npm install` in the failing directory
5. **Docker issues?** → Rebuild images: `docker-compose build --no-cache`

---

**Document Created:** April 22, 2026  
**For Full Details:** See [REFACTORING_ROADMAP.md](REFACTORING_ROADMAP.md)
