# Air by WZRD — landing page

Native Next.js landing page for [air.wzrd.tech](https://air.wzrd.tech): a private creative-assistant preview built around iMessage.

The public product story is deliberately bounded: one text becomes a curated first visual, Tapbacks direct a deterministic interface preview, and the matching Golden Gate study continues to a storyboard and eight-second first cut. Storyboard-only directions are labeled as such; the page does not imply live browser generation or a guaranteed latency.

## Local development

```bash
npm install
npm run dev
```

The preorder form uses an in-memory store only in local development when `DATABASE_URL` is absent. It never unlocks booking until the server returns a durable-success contract with `stored: true` and a receipt.

## Required checks

```bash
npm run check
```

The check runs the unit suite, strict TypeScript, versioned-media verification, and the production Next build. Asset provenance is documented in [`assets/PROVENANCE.md`](assets/PROVENANCE.md).

## Runtime contracts

- `POST /api/preorder` bounds the body, validates consent/contact fields, rate-limits with an atomic ten-minute bucket, deduplicates the identity, and stores name, email, and iMessage number before booking is revealed.
- Production and Vercel Preview fail closed without a dedicated `DATABASE_URL`, a matching `AIR_DATABASE_ENV`, and a strong `AIR_ID_HASH_SECRET`.
- `GET /api/internal/prune-preorders` is Vercel-Cron bearer protected. It removes preorder records after 12 months and rate-limit records after 30 days in bounded batches.
- `AIR_CINEMATIC` and `AIR_MEMORY_ECHO` are server-only build flags. Both default to `false`; invalid values fail the build.
- Runtime media lives under content-versioned paths. New bytes require a new path version because those URLs are cached as immutable.

The database contract is versioned in [`db/schema.sql`](db/schema.sql).

## Backend parity preview

This landing project is not the Air iMessage backend. `/healthz`, `/webhooks/imessage`, and `/internal/*` return `404` by default in ordinary previews and production.

Only a dedicated access-protected Vercel Preview can enable the narrow parity proxy. It requires all of the following:

- `VERCEL_ENV=preview`
- `AIR_PARITY_PROXY_ENABLED=true`
- Vercel's automation-bypass secret
- an explicit non-production HTTPS `AIR_PARITY_BACKEND_ORIGIN`

The allowlist contains only `GET /healthz`, `POST /webhooks/imessage`, and `POST /internal/drain-inbox`. The webhook preserves exact signed bytes, rejects encoded/query payloads, enforces the backend's 64 KiB guard, and forwards only the required Spectrum headers. Cookies and arbitrary internal routes are never proxied.

Moving `air.wzrd.tech` away from the existing backend project is a separate operational cutover and must not happen until the iMessage webhook has a tested permanent route and rollback rehearsal.

## Environment

See [`.env.example`](.env.example). Preview and production must use separate Neon databases and environment-matching values.
