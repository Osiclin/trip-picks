# Trip Picks

A full-stack travel planning feature for Lagos. Browse recommended activities, save your favourites, and build a simple day plan.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Environment Setup](#environment-setup)
6. [Postgres Setup](#postgres-setup)
7. [Running the Project](#running-the-project)
8. [API Documentation](#api-documentation)
9. [Running Tests](#running-tests)
10. [Assumptions & Tradeoffs](#assumptions--tradeoffs)

---

## Project Overview

Trip Picks helps users:
- **Browse** recommended activities across Lagos (Nike Art Gallery, Lekki Conservation Centre, Tarkwa Bay, and more)
- **Filter & search** by category, area, or title
- **Save** activities to a personal list persisted in localStorage
- **Plan** a day by creating and editing a plan with chosen activities

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · React Redux · react-paginate · Sonner |
| **Backend** | Node.js · Express 4 · TypeScript · Zod |
| **Database** | PostgreSQL via Prisma ORM |
| **Validation** | Zod (backend) · React Hook Form + Zod (frontend) |

---

## Prerequisites

- **Node.js** ≥ 20 (LTS)
- **npm** ≥ 10
- **PostgreSQL** ≥ 14 running locally (or a hosted connection string)

---

## Project Structure

```
trip-picks/
├── backend/          # Node.js + Express REST API
│   ├── prisma/       # Schema, migrations, seed
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/         # Prisma client, error helpers
│   │   ├── middleware/  # Error handler, Morgan logger
│   │   ├── routes/
│   │   └── validators/  # Zod schemas
│   └── docs/api.md
├── frontend/         # Next.js App Router frontend
│   └── src/
│       ├── app/         # Pages (App Router)
│       ├── components/  # Shared + ui (shadcn) components
│       ├── lib/         # API client, utilities
│       ├── store/       # Redux slices
│       └── types/       # Shared TypeScript types
└── README.md
```

---

## Environment Setup

### Backend — `backend/.env`

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trip_picks"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

Copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Postgres Setup

```bash
# 1. Open the Postgres interactive terminal
# On macOS (Homebrew default — username is your macOS login name):
psql -U $USER postgres

# On Linux or if you have a postgres superuser:
# psql -U postgres
```

Then inside the psql prompt, create the database and exit:

```sql
CREATE DATABASE trip_picks;
\q
```

```bash
# 2. Navigate to backend
cd backend

# 3. Install dependencies
npm install

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed the database (7 activities + 1 sample plan)
npm run prisma:seed

# Optional: Open Prisma Studio to inspect data
npm run prisma:studio
```

---

## Running the Project

### Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:3000
```

Both servers must be running simultaneously for the full experience.

---

## API Documentation

Full endpoint reference → [`backend/docs/api.md`](backend/docs/api.md)

**Quick reference:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/activities` | List activities (search, filter, paginate) |
| `GET` | `/activities/:id` | Get single activity |
| `POST` | `/plans` | Create a plan |
| `GET` | `/plans/:id` | Get a plan with activities |
| `PATCH` | `/plans/:id` | Update a plan |
| `GET` | `/health` | Health check |

---

## Running Tests

### Backend integration tests

```bash
cd backend
# Ensure the DB is seeded first
npm run prisma:seed
npm test
```

Tests cover `POST /plans` validation (missing fields, invalid dates, non-existent activity IDs, successful creation).

### Frontend unit tests

```bash
cd frontend
npm test
```

Tests cover the `savedActivitiesSlice` reducer (save, unsave, deduplication, rehydrate).

---

## Assumptions & Tradeoffs

### 1. Saved activities stored as full objects in Redux (not just IDs)

**Decision:** The `savedActivities` Redux slice stores full `Activity` objects, not just IDs.

**Rationale:**
- The spec says "array of saved activity IDs", but storing only IDs means the `/saved` page must re-fetch every activity from the API on each visit.
- Storing full objects lets the Saved page render immediately without a network round-trip.
- Optimistic save/unsave works without needing the activity data to already be in a separate cache.
- **Tradeoff:** More data in localStorage (~1–2 KB per activity). For 7–50 activities this is negligible. A large-scale version should normalise state with `createEntityAdapter` and persist only IDs + a TTL-based cache.

---

### 2. Client-side save persistence (no backend save endpoint)

**Decision:** Saved activities are stored in Redux + localStorage only; there is no `/saves` backend endpoint.

**Rationale:** The spec does not define a saves API, and the evaluation criteria focus on the list → detail → save → plan flow. A backend save endpoint would require authentication (to associate saves with a user) which is out of scope.

**Tradeoff:** Saves do not survive clearing localStorage or switching browsers. A production version would persist saves server-side behind auth.

---

### 3. Form validation: React Hook Form + Zod (frontend)

**Decision:** Used React Hook Form with `@hookform/resolvers/zod` for the create/edit plan forms.

**Rationale:** Provides uncontrolled form performance, typed validation errors aligned with the same Zod schemas used on the backend, and declarative field-level error display — without needing to write manual `onChange` handlers.
