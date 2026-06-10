# AI Workflow Note

## Tools Used

- **Claude Code (Sonnet 4.6)** — primary AI coding assistant used throughout the build
- **Claude Code integrated planning mode** — used to scope features, prioritize the build order, and design the architecture before writing a single line of code

---

## Where AI Materially Sped Up the Work

### 1. Scaffolding and boilerplate (~30 minutes saved)
Claude generated the initial Prisma schema, all API route handlers, JWT auth utilities, and the seed file. Writing these manually would have taken most of the timebox.

### 2. Tiptap integration
The Tiptap editor component, auto-save debounce pattern, and the HTML/JSON content detection logic were all AI-generated on the first attempt and worked without modification. This is an area where knowing the right APIs (`.getJSON()`, `.setContent()`, extension configuration) matters — Claude had it.

### 3. Parallel file creation
Claude Code can write multiple files simultaneously. The API routes (`/documents`, `/documents/[id]`, `/documents/[id]/share`, `/upload`) were all written in a single pass, saving ~20 minutes of sequential writing.

### 4. CSS/Tailwind styling
Tailwind utility classes were generated quickly by AI. The UI is clean and functional without spending time on design decisions.

---

## What AI Got Wrong or I Changed

### 1. Next.js 16 breaking changes — middleware → proxy rename
Claude initially scaffolded a `middleware.ts` file with a `middleware` export, which is the Next.js 14/15 convention. Next.js 16 renamed this to `proxy.ts` with a `proxy` export. This wasn't in Claude's training data (it's a very recent change). I caught it from the AGENTS.md warning in the generated project and the build deprecation warning, then corrected it.

### 2. Prisma 7 driver adapter requirement
Claude generated a standard `new PrismaClient()` singleton, which fails in Prisma 7 because the new architecture requires an explicit driver adapter. I diagnosed this from the error, found `@prisma/adapter-better-sqlite3`, and updated both `lib/prisma.ts` and `prisma/seed.ts` to use `PrismaBetterSqlite3({ url: dbPath })`.

### 3. Prisma 7 schema — URL in config not schema
Claude put `url = env("DATABASE_URL")` in `schema.prisma` (Prisma 5/6 convention). Prisma 7 removed this field entirely — the URL lives in `prisma.config.ts`. Caught this from the migration error message.

### 4. Prisma import path
AI generated `import { PrismaClient } from '@/app/generated/prisma'` but the correct path is `@/app/generated/prisma/client` (no default `index.ts` in the output).

### 5. Dashboard page import ordering
The first dashboard page draft had imports at the bottom of the file (TypeScript/JS doesn't allow this). I rewrote it to move all imports to the top.

---

## How I Verified Correctness

1. **Build check** — `npm run build` after each major change. TypeScript compilation errors surface immediately.

2. **API testing via curl** — tested the full flow manually: login → create doc → share with bob → login as bob → verify shared doc appears. All responses checked manually.

3. **Vitest tests** — 9 integration tests covering document CRUD, sharing, uniqueness constraint, and cascade deletion against an isolated test SQLite database.

4. **Developer judgment** — the AI generates code quickly but doesn't always know about framework changes from the last 6 months. The AGENTS.md file in the scaffolded project was the right signal to check the docs before coding. I read the Next.js 16 route handlers, proxy, and authentication docs before implementing.

---

## AI Usage Philosophy

AI in this build was used as a **fast pair programmer**, not as a replacement for engineering judgment:
- I directed the architecture (what to build, what to cut, why)
- AI generated the implementation rapidly
- I verified everything compiles, runs, and produces correct output
- When AI-generated code hit a framework-specific wall, I read the actual docs and fixed it

The goal was velocity without sacrificing correctness — not outsourcing judgment.
