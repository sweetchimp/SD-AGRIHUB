# FarmOS — S&D AGRIHUB

Professional farm management system for Uganda.

## Tech Stack
- Backend: Node.js + Express
- Database: PostgreSQL + Prisma
- Frontend: React + Vite + Tailwind CSS
- Auth: JWT + HTTP-only cookies
- Validation: Zod

## Setup

1. Clone repo
2. Install: `npm install`
3. Set up `.env` with DATABASE_URL
4. Run: `npm run dev`
5. Backend runs on http://localhost:3000

## API Routes

- `/api/auth` — Login/Register
- `/api/animals` — Cattle, Goats
- `/api/coffee` — Coffee fields, activities, harvests
- `/api/production` — Daily production tracking
- `/api/expenses` — Cost logging
- `/api/sales` — Sales tracking
- `/api/workers` — Worker management
- `/api/inventory` — Inventory tracking
- `/api/products` — Custom products

## Deployment

Configured for Railway.app
