# frontend/

Next.js web app — assessment flow, course browsing, and the streaming chat UI.

**Stack:** Next.js 15.3 (App Router) · React 19 · TypeScript · Tailwind ·
PostgreSQL via `pg`.

> Note: database access is **raw `node-postgres`**, not Prisma. Schema and seed
> logic live in `scripts/`.

## Layout

```
src/app/          App Router pages and API routes
src/components/   assessment/, courses/, dashboard/, profile/, chat
src/lib/          db access, models, types
src/middleware.ts auth/route gating
scripts/          setup-postgres.sh, seed.js, seed-courses.js, reset-db.js
```

## Running

```bash
npm install
cp .env.example .env        # DATABASE_URL, agent endpoint
npm run setup:postgres      # create schema
npm run seed:courses        # load course content
npm run dev                 # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run setup:postgres` | Provision schema |
| `npm run db:seed` | Seed base data |
| `npm run seed:courses` | Load course content |

## How it talks to the agent

The chat UI consumes **Server-Sent Events**. The Python agent emits typed chunks —
`text`, `reasoning`, `img_gen`, `mermaid_gen`, `error` — and the frontend
reconstructs the message stream from them, rendering reasoning traces inline and
Mermaid blocks as diagrams.

Protocol details: [`../agent/docs/API_INTEGRATION.md`](../agent/docs/API_INTEGRATION.md).

**Not wired end-to-end in this repo.** Frontend and agent ran as separate services
during development; no compose file is included.
