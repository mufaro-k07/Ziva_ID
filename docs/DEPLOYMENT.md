# Deployment

Deploying ZivaID to **Vercel** as a single project on a single domain.

> **Status: prepared, not yet deployed.** Everything in this guide is configured
> and verified locally. The deployment itself has not been run, so the Vercel-side
> behaviour (function bundling, rewrite ordering) is unverified in production.
> Treat the first deploy as the real test.

## Final architecture

One Vercel project serves both the frontend and the API from one origin:

```
https://<project>.vercel.app/                    → React SPA (static)
https://<project>.vercel.app/api/auth/*          → Better Auth
https://<project>.vercel.app/api/citizen/*       → Citizen routes
https://<project>.vercel.app/api/admin/*         → Admin routes
https://<project>.vercel.app/openapi             → API documentation
```

```mermaid
flowchart TD
    U[Browser] --> V[Vercel edge]
    V -->|/api/*, /openapi| F[Vercel Function - Bun]
    V -->|everything else| S[Static SPA from client/dist]
    F --> A[Elysia app - app/src/app.ts]
    A --> DB[(Supabase PostgreSQL)]
```

### Why one project matters

Same-origin is not a cosmetic choice. If the SPA and API sat on different
domains, the session cookie would be **cross-site**, requiring
`SameSite=None; Secure`. Worse, two `*.vercel.app` subdomains are still
cross-site — `vercel.app` is on the Public Suffix List, so cookies cannot be
shared across it. Serving both from one origin makes the cookie first-party and
sidesteps the problem entirely.

This is why every API route was moved under `/api/*`.

## Repository configuration

| File | Role |
|---|---|
| `vercel.json` | Runtime, build, and routing configuration |
| `api/index.ts` | Serverless entry — re-exports the Elysia app as a default export |
| `app/src/app.ts` | Builds the app; never calls `.listen()` |
| `app/src/index.ts` | Local server; imports the app and calls `.listen()` |

Vercel requires an exported application — `app.listen()` is not supported. The
split keeps both environments running the identical app instance, so plugin and
middleware order cannot diverge.

### `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "bunVersion": "1.x",
  "installCommand": "cd app && bun install && cd ../client && bun install",
  "buildCommand": "cd client && bun run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/openapi", "destination": "/api" },
    { "source": "/openapi/(.*)", "destination": "/api" },
    { "source": "/((?!api/|openapi|assets/).*)", "destination": "/index.html" }
  ]
}
```

**Rewrite order is critical.** The API rules come first; the SPA fallback is
last and explicitly excludes `api/`, `openapi`, and `assets/`. A catch-all
placed above them would send API calls to `index.html` and every request would
return HTML instead of JSON.

| Setting | Why |
|---|---|
| `bunVersion: "1.x"` | Runs functions on Bun, matching local development. `1.x` is the only accepted value |
| `installCommand` | There is no root `package.json`, so both projects are installed explicitly |
| `buildCommand` / `outputDirectory` | Vite build output |

## Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**.

| Variable | Scope | Value |
|---|---|---|
| `DATABASE_URL` | Production, Preview | Supabase **transaction pooler** URI, port `6543` |
| `BETTER_AUTH_SECRET` | Production, Preview | 32+ chars — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Production | `https://<project>.vercel.app` |
| `CORS_ORIGINS` | Production | `https://<project>.vercel.app` |
| `TRUSTED_ORIGINS` | Production | `https://<project>.vercel.app` |
| `NODE_ENV` | — | Vercel sets `production` automatically |

`VITE_BETTER_AUTH_URL` should be left **unset** in production. The Better Auth
client then defaults to the current origin, which is correct for a same-origin
deployment. `API_BASE` resolves to the relative `/api` on its own.

Do **not** set `PORT` — there is no listener in serverless.

> `env.ts` refuses to boot on an `http://` origin when `NODE_ENV=production`.
> This is intentional. Use `https://`.

## Supabase connection

Serverless functions spawn many short-lived instances, so a direct connection
(port 5432) will exhaust the connection limit. Use the **transaction pooler**:

```
postgresql://USER:PASSWORD@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Find it under **Supabase → Settings → Database → Connection pooling**.

`prepare: false` is already set in `app/src/db/index.ts`, which is exactly what
pgBouncer's transaction mode requires — so no code change is needed, only the
URL.

## Better Auth in production

No cross-site cookie configuration is required, because the deployment is
same-origin. Specifically, do **not** set `sameSite: "none"`, do **not** enable
cross-subdomain cookies, and do **not** disable CSRF or origin checks.

Cookies become `Secure` automatically once `BETTER_AUTH_URL` is `https://`.

### Preview deployments

Preview URLs are generated per deployment, but `BETTER_AUTH_URL`,
`CORS_ORIGINS`, and `TRUSTED_ORIGINS` are fixed strings, and `env.ts` validates
absolute URLs with no wildcard support. **Authentication will therefore fail on
preview deployments** with an origin mismatch.

Options:

1. Accept it — test authentication on production only *(current position)*
2. Derive the values from Vercel's `VERCEL_URL` at runtime, which means editing
   `env.ts`
3. Attach a stable custom domain to previews

## Migration procedure

**Do not run migrations during the Vercel build.** Builds run on every push and
every preview; migrations must be deliberate.

Apply them from your machine before deploying:

```bash
cd app
# point DATABASE_URL at the production database
bun run db:migrate
```

The database is already baselined and current as of migration `0001`. See
[DATABASE.md](DATABASE.md).

## Deployment steps

### 1. Confirm the repository is clean

```bash
git status
cd app && bun test
cd ../client && bun run build && bun run lint
```

### 2. Commit and push

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 3. Import into Vercel

1. <https://vercel.com/new>
2. Select the `Ziva_ID` repository
3. **Root Directory: leave as the repository root** — not `client/`. The
   `api/` directory and `vercel.json` both live at the root
4. Framework preset: **Other** — `vercel.json` supplies the build settings
5. Do not override build or output settings in the dashboard

### 4. Add environment variables

Add all five from the table above **before** the first deploy. A missing
`DATABASE_URL` or a short `BETTER_AUTH_SECRET` will fail the boot with an
explicit message.

### 5. Deploy

Click **Deploy**, or from the CLI:

```bash
vercel          # preview deployment
vercel --prod   # production
```

### 6. Read the build logs

Confirm that both installs ran, the Vite build succeeded, and a function was
created from `api/index.ts`.

## Post-deployment testing

Replace `<url>` with your deployment URL.

### Routing

```bash
curl -i https://<url>/api/auth/ok          # 200
curl -i https://<url>/api/citizen/intake   # 401, JSON not HTML
curl -i https://<url>/openapi              # 200, documentation UI
curl -i https://<url>/                     # 200, SPA
```

The critical check: `/api/*` must return **JSON**, not the SPA's HTML. If it
returns HTML, the SPA fallback rewrite is shadowing the API rules.

### Deep links / SPA fallback

Visit each directly and refresh — none may 404:

- `/` · `/login/citizen` · `/register/citizen` · `/login/admin`
- `/citizen/dashboard` · `/citizen/apply/birth` · `/citizen/apply/id`
- `/admin/dashboard` · `/admin/review/ZID-BC-2026-000000`

### Authentication

- [ ] Citizen registration succeeds
- [ ] Login succeeds
- [ ] **Session survives a page refresh** — the key same-origin cookie test
- [ ] Logout clears the session
- [ ] Signed-out users are redirected from protected routes
- [ ] A citizen receives `403` on `/api/admin/intakes`

### Citizen workflow

- [ ] Both intake forms load with multilingual labels
- [ ] Submission returns a reference number
- [ ] The record appears on the dashboard with its status

### Admin workflow

- [ ] Review queue loads
- [ ] A record opens by reference number
- [ ] Checklist and audit history render
- [ ] A status update saves, with the officer comment
- [ ] A new audit entry appears after refresh

### Database

- [ ] Connection succeeds through the pooler URL
- [ ] No prepared-statement errors in the function logs
- [ ] No connection-exhaustion errors under repeated requests
- [ ] Existing records are intact

## Common deployment errors

| Symptom | Cause | Fix |
|---|---|---|
| `/api/*` returns HTML | SPA fallback shadowing API rewrites | Check rewrite order in `vercel.json` |
| `Invalid environment configuration` | Missing or invalid variable | Read the build log; it names each problem |
| `CORS_ORIGINS contains insecure origin` | An `http://` origin in production | Use `https://` |
| Session lost on refresh | `BETTER_AUTH_URL` mismatch | Must exactly match the deployment origin |
| `prepared statement already exists` | Direct connection instead of the pooler | Switch to port 6543 |
| `too many connections` | Direct connection | Switch to the pooler |
| `column "district_code" does not exist` | Migration `0001` not applied | Run `db:migrate` against production |
| Function build fails on imports | `app/` dependencies not installed | Verify `installCommand` ran both installs |
| 404 on frontend refresh | SPA fallback not matching | Check the negative-lookahead rewrite |

## Rollback

Vercel keeps every deployment. To roll back:

1. **Deployments** tab
2. Select the last known-good deployment
3. **⋯ → Promote to Production**

This is instant and requires no rebuild.

Database migrations are **not** covered by this. Migration `0001` is additive
and reversible by hand:

```sql
ALTER TABLE "intake_records" DROP COLUMN "district_code";
```

Roll application code back first; only reverse a migration if the schema is
genuinely the problem.

## Known risks

1. **Bun runtime may be permission-gated.** Vercel's documentation marks the Bun
   runtime as requiring permissions. If unavailable on your plan, the fallback is
   the Node runtime, which would require `@elysiajs/node` and `"type": "module"`.
2. **Elysia is not on Vercel's listed Bun-supported frameworks.** The Bun
   documentation names Next.js, Express, Hono, and Nitro; Elysia has its own
   documentation page confirming support. Slight ambiguity — the first deploy
   resolves it.
3. **Rewrite behaviour is unverified in production.** The configuration follows
   documented behaviour but has not been exercised on a real deployment.
4. **Preview deployments will have broken authentication** — see above.
5. **Cold starts.** Each cold start opens a new database connection; the pooler
   is what makes this safe.
