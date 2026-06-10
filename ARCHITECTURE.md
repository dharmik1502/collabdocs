# Architecture Notes

## What I Built and Why

### Framework: Next.js 16 (App Router)

Chose Next.js with the App Router because it collapses frontend, backend, and auth into a single deployable unit. For a 4–6 hour scope, eliminating a separate API server meaningfully reduces complexity without sacrificing production-readiness.

### Rich Text Editor: Tiptap

Tiptap was the clearest choice:
- **MIT license** — no runtime cost for reviewers to test
- **Headless** — I own all the UI, no visual lock-in
- **Extension model** — bolt-on Underline and Placeholder in two lines
- **Tiptap JSON** — serializes to a versioned, diff-friendly format (stored as JSON strings in SQLite)

Rejected Quill (older, harder to extend) and Slate (API complexity disproportionate to this scope).

### Database: Prisma 7 + SQLite (local) / PostgreSQL (prod)

Prisma 7 with the `better-sqlite3` driver adapter for local development. The schema is provider-agnostic — switching to PostgreSQL for production only requires changing the datasource provider and `DATABASE_URL`. Zero cost for local development; Neon free tier for deployment.

**Breaking change encountered:** Prisma 7 moved database URLs out of `schema.prisma` into `prisma.config.ts` and requires a driver adapter constructor argument. This took ~15 minutes to diagnose and fix.

### Auth: Custom JWT with `jose`

Chose custom JWT over NextAuth for two reasons:
1. NextAuth v5 beta compatibility with Next.js 16 was uncertain given the rapid release cadence
2. For a demo with 3 seeded users, custom JWT is more transparent and easier to explain

Implementation: `jose` signs HS256 tokens stored in `httpOnly` cookies. The `proxy.ts` (Next.js 16's renamed middleware) verifies the token on every non-public request.

### File Parsing: `mammoth`

`mammoth` converts `.docx` to clean HTML, which Tiptap can render directly via `setContent(html)`. Plain text and Markdown are parsed manually (no dependency needed).

**Supported:** `.txt`, `.md`, `.docx`  
**Not supported:** Images inside documents, `.pdf`, `.odt`

---

## Prioritization Decisions

### In scope
| Feature | Priority | Reason |
|---------|----------|--------|
| Rich text editing (Tiptap) | P0 | Core product value |
| Auto-save | P0 | Table stakes for a doc editor |
| Document CRUD | P0 | Required |
| File upload (.txt/.md/.docx) | P1 | Required; docx via mammoth |
| Sharing (view/edit) | P1 | Required |
| Dashboard with owned/shared sections | P1 | Required |
| JWT auth + seeded users | P1 | Enables sharing demo |
| Vitest integration tests | P2 | Required |

### Out of scope (deliberately cut)
| Feature | Why cut |
|---------|---------|
| Real-time collaboration | Requires WebSockets + CRDT (y.js) — far exceeds 4–6h timebox |
| OAuth / email verification | Not necessary for seeded-user demo |
| PDF export | Nice-to-have; cut to protect core editor quality |
| Version history | Requires event sourcing or snapshot model — out of scope |
| Image upload in documents | Requires object storage (S3/R2) — out of scope |
| Comments | Not required by spec |

---

## Data Model

```
User
  id, email, name, password (bcrypt)

Document
  id, title, content (Tiptap JSON string), ownerId, createdAt, updatedAt

DocumentShare
  id, documentId, userId, permission ("view" | "edit"), createdAt
  Unique: (documentId, userId)
```

Content is stored as a serialized Tiptap JSON string. This preserves all formatting without requiring a separate column per format attribute.

---

## Auth Flow

```
Login form → POST /api/auth/login
  → bcrypt.compare(password, hash)
  → signJWT({ userId, email, name }) → HS256, 7d TTL
  → Set-Cookie: collabdocs-token=<token> (httpOnly, SameSite=lax)

Subsequent requests:
  proxy.ts verifies cookie on every non-public route
  getSession() in Server Components reads + verifies the cookie
```

---

## What I'd Build Next (2–4 more hours)

1. **Real delete UI** — document delete button on dashboard with confirmation
2. **Export to Markdown** — serialize Tiptap JSON → `.md` file download
3. **Document version snapshots** — periodic snapshots in a `DocumentVersion` table
4. **Better mobile layout** — editor toolbar wrapping on small screens
5. **PostgreSQL + Neon for production** — already architected; just env var swap
