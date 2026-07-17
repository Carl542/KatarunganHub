# KatarunganHub

Next.js + Express + Supabase rebuild of the KatarunganHub barangay case tracking system, following the Katarungang Pambarangay Law workflow.

- `apps/web` — Next.js (App Router, Tailwind CSS)
- `backend` — Express REST API
- `supabase/` — schema migrations

See `docs/superpowers/plans/` in the sibling `frontend` repo (`c:\Users\User\Downloads\frontend`) for the milestone plan and detailed task plans this build follows.

## Dev setup

```bash
npm install
npm run dev
```

Requires `backend/.env` and `apps/web/.env.local` — see the `.example` files in each app.
