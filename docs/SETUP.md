# Setup Guide

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [Bun](https://bun.sh) | 1.3+ | Verified on 1.3.14. Runtime, package manager, and test runner |
| PostgreSQL | — | A Supabase project is the expected host |
| Git | — | |

Node.js is **not** required. Bun runs the TypeScript backend directly, with no
build step.

Check your installation:

```bash
bun --version
```

## 1. Clone

```bash
git clone https://github.com/mufaro-k07/Ziva_ID.git
cd Ziva_ID
```

The repository has **no root `package.json`**. The backend (`app/`) and frontend
(`client/`) are installed and run separately.

## 2. Database

Create a PostgreSQL database — a free Supabase project is sufficient. From the
Supabase dashboard, take **Settings → Database → Connection string → URI**.

Two connection styles matter:

| Style | Port | Use for |
|---|---|---|
| Direct connection | 5432 | Local development, migrations |
| Transaction pooler | 6543 | Serverless deployments |

For local development the direct connection is fine. `prepare: false` is
already set in `app/src/db/index.ts`, so either works.

## 3. Backend

```bash
cd app
bun install
cp .env.example .env
```

Edit `app/.env`:

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
BETTER_AUTH_SECRET=          # min 32 chars — see below
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:5173
TRUSTED_ORIGINS=http://localhost:5173
```

Generate a secret:

```bash
openssl rand -base64 32
```

On Windows without OpenSSL:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Apply the schema:

```bash
bun run db:migrate
```

Start the API:

```bash
bun run dev        # http://localhost:3000
```

You should see:

```
🦊 ZivaID API [development] listening on localhost:3000
   allowed origins: http://localhost:5173
```

## 4. Frontend

In a second terminal:

```bash
cd client
bun install
cp .env.example .env
bun run dev        # http://localhost:5173
```

`client/.env`:

```bash
VITE_BETTER_AUTH_URL=http://localhost:3000
```

⚠️ `VITE_*` values are compiled into the browser bundle and are **public**.
Never put `DATABASE_URL` or `BETTER_AUTH_SECRET` behind a `VITE_` prefix.

## 5. Running the system

Both services must run simultaneously, in separate terminals:

| Terminal | Directory | Command | URL |
|---|---|---|---|
| 1 | `app` | `bun run dev` | http://localhost:3000 |
| 2 | `client` | `bun run dev` | http://localhost:5173 |

Open http://localhost:5173 and register a citizen account.

## 6. Creating the first administrator

Admin promotion requires an existing admin, so the first one must be created
directly in the database:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-email@example.com';
```

Run this in the Supabase SQL editor or `psql`. Afterwards, sign in at
`/login/admin`. Further admins can be promoted through the API.

---

## Common setup errors

### `Invalid environment configuration`

The server refuses to start when configuration is wrong. The message lists each
problem. Common causes:

| Message | Fix |
|---|---|
| `DATABASE_URL is required` | Not set, or `.env` is in the wrong directory — it belongs in `app/`, not the repository root |
| `BETTER_AUTH_SECRET must be at least 32 characters` | Generate a longer secret |
| `contains insecure origin` | Production origins must be `https://` |

### The API binds the wrong port on Windows

**Symptom:** the server reports `listening on localhost:5432`.

**Cause:** a lowercase `port=` line in `app/.env`. Windows resolves environment
variables case-insensitively, so `port=5432` silently overrides `PORT`.

**Fix:** remove any lowercase `host=`, `port=`, `database=`, `user=`, or
`password=` lines. `DATABASE_URL` supersedes them all.

### CORS errors in the browser

Confirm `CORS_ORIGINS` in `app/.env` exactly matches the frontend origin,
including scheme and port, with no trailing slash. Restart the API afterwards —
environment changes are read only at startup.

### Session does not persist after sign-in

Check that `BETTER_AUTH_URL` matches the API's actual address and that
`TRUSTED_ORIGINS` includes the frontend origin. Frontend requests must send
`credentials: 'include'`, which they already do.

### `relation "..." already exists` when migrating

The database was created with `db:push` rather than migrations, so
`__drizzle_migrations` is missing. See the baselining section in
[DATABASE.md](DATABASE.md). A fresh database will not hit this.

### `column "district_code" does not exist`

Migration `0001` has not been applied. Run `bun run db:migrate` from `app/`.

### `bun install` fails on Windows

Run the terminal as Administrator, or enable Developer Mode — Bun creates
symlinks during install.

---

## Windows PowerShell notes

- Use `;` to chain commands. `&&` is not supported in Windows PowerShell 5.1.
- `cp` works as an alias for `Copy-Item`; `cp .env.example .env` is fine.
- Prefer `$env:VAR = "value"` over `export`.
- Paths containing spaces must be quoted — this repository's default path
  (`.../Introduction to Software Engineering/...`) contains several.

## Verifying the setup

```bash
# API responds
curl http://localhost:3000/

# Better Auth is mounted
curl http://localhost:3000/api/auth/ok

# Protected route rejects anonymous callers (expect 401)
curl -i http://localhost:3000/api/citizen/intake
```

Run the backend tests:

```bash
cd app
bun test
```

> ⚠️ These tests create a real user in the configured database on every run.
> See [TESTING.md](TESTING.md).

Build the frontend:

```bash
cd client
bun run build      # output in client/dist
bun run preview    # serve the build locally
```
