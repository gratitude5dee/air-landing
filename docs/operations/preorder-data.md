# Preorder data operations

This runbook covers the personal data collected by `POST /api/preorder`: name,
email address, iMessage number, consent state, and an opaque UUID receipt. It also
covers the HMAC-derived identity and rate-limit records used to protect the form.

## Environment and access boundaries

- Preview and production must use separate Neon databases, not two schemas or
  two roles in one database. Their `DATABASE_URL` values and credentials must be
  different, and each deployment must set `AIR_DATABASE_ENV` to the exact
  Vercel environment (`preview` or `production`). The application fails closed
  when these values do not agree.
- Never copy production preorder rows into preview. Seed preview with synthetic
  contacts only, and destroy temporary preview databases when the preview is no
  longer needed.
- Keep the schema-owner/migration credential out of Vercel. The deployed role
  needs `USAGE` on the application schema and only `SELECT`, `INSERT`, `UPDATE`,
  and `DELETE` on `air_preorders` and `air_preorder_rate_limits`. `DELETE` is
  required by the retention job. It does not need `CREATE`, role-management,
  replication, or access to unrelated tables.
- Prefer a separate, short-lived operator credential with `SELECT` and `DELETE`
  on `air_preorders` when processing a deletion request. Supply that credential
  to the utility as `DATABASE_URL`; do not save it in a committed env file.
- Limit Vercel environment-variable access to the smallest operating group,
  rotate credentials after suspected exposure, and keep contact fields out of
  command output, tickets, analytics, and application logs.

Example grants for an existing role, run by the database owner after replacing
the role and schema names:

```sql
GRANT CONNECT ON DATABASE air_production TO air_runtime;
GRANT USAGE ON SCHEMA public TO air_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.air_preorders, public.air_preorder_rate_limits
  TO air_runtime;
```

Apply equivalent grants to a different role in the preview database. Do not
reuse the production role or connection string.

## Retention

The daily Vercel Cron calls the bearer-protected retention route. Each call
removes, in bounded batches:

- preorder rows whose `updated_at` is older than 12 months; and
- rate-limit attempt rows whose `window_started_at` is older than 30 days.

Monitor successful cron responses. A response with `hasMore: true` means another
authorized invocation is required to finish an unusually large backlog. Treat a
missed run as an operations incident and run the protected route until it reports
`hasMore: false`; do not export rows to prune them manually.

## Receipt-based deletion request

The receipt is a record locator, not proof of identity. Before touching the
database, verify the requester through the same contact channel collected at
signup or another approved identity-verification process. Do not put their name,
email address, or phone number in the command line or the operations ticket.

1. Select the correct isolated environment and obtain a short-lived scoped
   connection. Confirm `AIR_DATABASE_ENV` and the intended database inventory
   entry before proceeding.
2. Run a count-only lookup:

   ```bash
   npm run data:delete-preorder -- \
     --receipt 00000000-0000-4000-8000-000000000000 \
     --environment preview \
     --dry-run
   ```

3. After identity and environment checks are recorded, perform the deletion by
   replacing the example receipt and environment. The confirmation word is
   deliberately exact and case-sensitive:

   ```bash
   npm run data:delete-preorder -- \
     --receipt 00000000-0000-4000-8000-000000000000 \
     --environment production \
     --confirm DELETE
   ```

4. Repeat the dry run. Completion requires `matched=0`. Record only the request
   reference, environment, deletion timestamp, and aggregate result; the utility
   intentionally prints no receipt or contact data.

The receipt cannot identify a rate-limit row because IP values are separately
HMAC-derived. Those records expire through the 30-day retention rule.

## Backups and final expiry

A row deletion removes live application data but does not rewrite existing Neon
backups or point-in-time recovery history. For each database, document the
provider's configured backup/PITR retention window and calculate the final expiry
date from the deletion time. Restrict restore access during that window. If a
backup is restored, rerun every still-active deletion request before exposing the
restored database to the application.

Close the request only after live deletion is verified and the expected backup
expiry date is recorded. Do not claim irreversible erasure until the provider's
retention window has elapsed. If legal hold or provider policy prevents normal
expiry, escalate it rather than silently extending retention.
