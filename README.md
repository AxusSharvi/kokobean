# kokobean

Todo-list app with categories, points for completing todos, and a points shop with admin-managed rewards.

## Stack

- Nuxt 4 (Vue 3 + TypeScript) — frontend and backend (Nitro server API routes) in one app
- PostgreSQL — running locally via Docker Compose
- Drizzle ORM — schema + migrations (`server/database/schema.ts`)
- nuxt-auth-utils — session/cookie auth
- Tailwind CSS — styling

## First-time setup

```bash
npm install
cp .env.example .env   # then edit NUXT_SESSION_PASSWORD to a random string
docker compose up -d   # starts Postgres
npm run db:push        # creates tables from the schema
npm run dev            # http://localhost:3000
```

## Everyday use

```bash
docker compose up -d   # start the database (if not already running)
npm run dev            # start the app
```

## Database commands

- `npm run db:push` — sync the schema straight to the database (fast, good for early development)
- `npm run db:generate` — generate a migration file from schema changes
- `npm run db:migrate` — apply generated migrations
- `npm run db:studio` — open Drizzle Studio, a GUI to browse/edit table data

## Project layout

- `app/` — pages, components (Vue/Nuxt frontend)
- `server/api/` — backend API routes (Nitro)
- `server/database/schema.ts` — database tables
- `server/utils/db.ts` — database client (auto-imported as `db` in server code)
