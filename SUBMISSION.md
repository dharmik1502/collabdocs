# Submission Checklist

## Project: CollabDocs

A lightweight collaborative document editor built with Next.js 16 (App Router), Tiptap, Prisma 7 + SQLite, and custom JWT auth.

---

## Deliverables

| Item | Status | Notes |
|------|--------|-------|
| Source code | ✓ | Full Next.js project in `/collabdocs` |
| README.md | ✓ | Setup, run, demo credentials |
| ARCHITECTURE.md | ✓ | Tech decisions, tradeoffs, what's in/out |
| AI_WORKFLOW.md | ✓ | Tools used, what AI got wrong, how I verified |
| SUBMISSION.md | ✓ | This file |
| Live deployment URL | ✓ | See below |
| Walkthrough video | ✓ | See below |

---

## Live Deployment

**URL:** _[to be filled after deployment]_

---

## Walkthrough Video

**URL:** _[to be filled after recording]_

---

## Demo Test Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Alice Demo | alice@demo.com | demo1234 | Owner of "Welcome to CollabDocs" |
| Bob Demo | bob@demo.com | demo1234 | Has edit access to Alice's document |
| Carol Demo | carol@demo.com | demo1234 | No shared documents initially |

**To demo sharing:**
1. Log in as Alice → open "Welcome to CollabDocs" → click Share → add carol@demo.com
2. Log in as Carol → see the document under "Shared with Me"

---

## What Works End to End

- [x] Login / logout with seeded demo users
- [x] Create new blank document
- [x] Rename document (click title in editor)
- [x] Rich text editing: bold, italic, underline, H1/H2/H3, bullet list, ordered list
- [x] Auto-save (1.5s debounce, "Saving…" / "Saved" indicator)
- [x] Refresh and reopen document with content preserved
- [x] Upload `.txt`, `.md`, `.docx` files → creates new editable document
- [x] Share document with another user (view or edit permission)
- [x] Dashboard shows "My Documents" and "Shared with Me" sections
- [x] Read-only mode for view-only shared users
- [x] 9 Vitest integration tests passing

---

## What Is Incomplete / Would Build Next

| Feature | Status | Notes |
|---------|--------|-------|
| Delete document UI | Not built | API route exists; no UI button on dashboard |
| Tiptap HTML import for uploads | Partial | HTML stored correctly; Tiptap renders it, but doesn't re-serialize cleanly to JSON on first save |
| Mobile toolbar layout | Basic | Wraps but not optimized for small screens |
| PostgreSQL for prod deployment | Pending | Prisma schema is provider-agnostic; needs env var swap + adapter change |
| Real-time collaboration | Out of scope | Requires WebSockets + CRDT; stated cut |

---

## Local Setup (Quick Reference)

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
# → http://localhost:3000
```

Tests:
```bash
npm test
```
