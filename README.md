# Air by WZRD — landing page

Native Next.js landing page for [air.wzrd.tech](https://air.wzrd.tech): a creative assistant that works through iMessage.

## Local development

```bash
npm install
npm run dev
```

The preorder form uses a dedicated Neon Postgres project. In local development without `DATABASE_URL`, it uses an in-memory store so the full interaction can be tested without writing real leads.

## Production contract

- `POST /api/preorder` validates, rate-limits, deduplicates, and stores name, email, and iMessage number before revealing the Cal booking embed.
- `/healthz`, `/webhooks/imessage`, and `/internal/*` pass through byte-for-byte to the dedicated pre-landing Air backend project. This keeps signed iMessage ingress and the operator control plane available during the homepage migration.
- Signed webhook bodies are stream-limited to 64 KiB before proxying, matching the backend ingress guard.
- `AIR_BACKEND_ORIGIN` can replace the pinned default when the backend is moved to a permanent dedicated hostname.

The database contract is versioned in [`db/schema.sql`](db/schema.sql).

## Environment

See [`.env.example`](.env.example). Production requires `DATABASE_URL` and `AIR_ID_HASH_SECRET`.
