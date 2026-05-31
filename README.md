# FlowTrack — Task & Time Tracking App

A full-stack productivity app built with React, Node.js, Express, PostgreSQL, and Prisma.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18 + Vite + Tailwind CSS v3   |
| Charts       | Recharts                            |
| HTTP Client  | Axios                               |
| Backend      | Node.js + Express                   |
| Database     | PostgreSQL via Prisma ORM           |
| Auth         | JWT + HTTP-only cookies + bcrypt    |
| Logging      | Winston                             |
| Validation   | Zod                                 |
| AI Suggest   | Anthropic Claude API (optional)     |

---

## Project Structure

```
flowtrack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── config/       db.js, schemas.js
│       ├── controllers/  auth, task, timeLog, summary
│       ├── middleware/   auth, error, validate
│       ├── routes/       auth, task, timeLog, summary
│       ├── services/     auth, task, timeLog, summary, audit, ai
│       ├── utils/        logger, AppError, formatTime, response
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/   Layout, TaskCard, TaskModal, FilterBar, ...
        ├── context/      AuthContext, ThemeContext, TimerContext
        ├── hooks/        useDebounce, useLocalStorage, useTasks
        ├── pages/        Dashboard, Tasks, TaskDetails, TimeLogs, Summary, Settings
        ├── services/     api, authApi, taskApi, timeLogApi, summaryApi
        └── utils/        formatTime, constants
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Neon/Supabase cloud)

### 1 — Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2 — Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/flowtrack?sslmode=require"
JWT_SECRET="run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
AI_API_KEY=""
```

### 3 — Database setup

```bash
cd backend
npm run db:generate   # generate Prisma client
npm run db:push       # push schema to DB
npm run db:seed       # seed demo data
```

### 4 — Frontend environment

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000
```

### 5 — Run both servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3000/health
- Demo:     demo@example.com / password123

---

## Deployment

### Database — Neon (free)
1. Create project at neon.tech
2. Copy the connection string → `DATABASE_URL`

### Backend — Render
- Root: `backend/`
- Build: `npm install && npm run db:generate && npx prisma migrate deploy`
- Start: `npm start`
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=https://your-app.vercel.app`

### Frontend — Vercel
- Root: `frontend/`
- Build: `npm run build`
- Output: `dist`
- Env vars: `VITE_API_URL=https://your-backend.onrender.com`

---

## Key Design Decisions

**Timer** — Backend stores only start/stop events. Frontend runs the clock with `setInterval`. On refresh, `GET /api/time-logs/active` returns `startTime` and the timer resumes from `Date.now() - startTime`.

**Authorization** — Every DB query filters by `userId: req.user.id`. Users can never access each other's data.

**Soft Delete** — Tasks set `deletedAt` instead of being removed. Time log history is preserved for accurate summaries.

**Audit Logs** — Written with no `await` so they never block the API response. Failures are swallowed and logged to Winston only.

**Summary queries** — Computed dynamically from `TimeLog` aggregations. No separate summary table needed.

---

## Security
- bcrypt passwords (saltRounds 12)
- JWT in HTTP-only cookies (no localStorage)
- All routes behind `authenticate` middleware
- Every query scoped to `req.user.id`
- Zod validation on all inputs
- CORS restricted to `CLIENT_URL`
- 10KB request body limit
