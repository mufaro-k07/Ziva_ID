# ZivaID

**Digital Identity Document Application and Tracking System for Zimbabwean Birth Certificates and National IDs**

The name comes from the Shona word *ziva*, meaning "to know" — the system exists
to help citizens know what is required before they travel to a registry office.

> **Academic project.** ZivaID is not an official Government of Zimbabwe service,
> is not connected to the Civil Registry database, and does not issue birth
> certificates or National IDs.

---

## 1. Project overview

ZivaID is a web application that helps Zimbabwean citizens **prepare** for
identity-document registration. Citizens create an account, choose whether they
need a birth certificate or a National ID, complete a structured intake form,
tick off the supporting documents they already have, and receive a reference
number they can use to follow the progress of their record.

On the other side, registry officers get a review queue: they open a submitted
intake record, inspect the applicant's details and document checklist, set a
status, and leave written guidance. Every status change is written to an
append-only audit log.

**What ZivaID does not do:** it does not issue documents, does not connect to any
government system, takes no payments, performs no biometric or physical identity
verification, and sends no SMS or email notifications. Supporting documents are
declared on a checklist — there is no file upload.

## 2. Mission

To improve access to identity-document *preparation and tracking*, so that
citizens spend less time and money working out what is required. Identity
documents underpin access to education, employment, healthcare, and travel;
ZivaID aims to reduce the friction of obtaining them. ZivaID itself provides
none of those services.

## 3. Problem statement

Obtaining a birth certificate or National ID in Zimbabwe commonly involves:

- **Unclear requirements** — applicants often learn what is needed only on arrival
- **Repeated visits** caused by missing supporting documents
- **Transport costs**, which fall hardest on rural applicants
- **Long queues** at registry offices
- **Manual, paper-based processes** with no progress visibility
- **No way to track** whether a record has been reviewed
- **Limited digital literacy**, which excludes some citizens from online systems

A citizen who arrives without their mother's National ID, or without a
Notification of Birth, is usually turned away and must return another day.

## 4. Proposed solution

| Component | What it provides |
|---|---|
| Citizen portal | Account creation, document selection, guided intake forms |
| Readiness checklist | Explicit list of supporting documents per document type |
| Reference number | A public tracking identifier issued on submission |
| Status tracking | Citizens see the current state of their intake record |
| Officer portal | Review queue, record inspection, status updates, written guidance |
| Audit log | Append-only history of every status change and who made it |
| Assisted intake | An officer can capture a record for a citizen who cannot use the system themselves *(UI only — see §23)* |

## 5. Scope and limitations

### Included in the MVP

- Citizen registration and login (email + password)
- Birth certificate intake
- National ID intake
- Supporting-document readiness checklist
- Reference-number generation
- Citizen dashboard with status tracking
- Officer review queue and record inspection
- Officer status updates with mandatory comment
- Append-only status audit log
- Role-based access control (citizen / admin)
- Multilingual form labels — English, Shona, Ndebele *(partial, see §23)*

### Outside the MVP

- Official document issuance
- Integration with Government of Zimbabwe systems
- Online payments
- Biometric or physical identity verification
- Supporting-document file uploads
- Production SMS or email delivery
- Automated eligibility determination

### Academic and legal disclaimer

ZivaID is a university software engineering project. It is **not** an official
Government of Zimbabwe platform and has no affiliation with the Registrar
General's Office. It does not issue legal identity documents. Any requirement or
guidance shown in the application must be verified with the responsible Civil
Registry authority. Standard birth registration is treated as free within the
scope of this project.

## 6. Key features

### Citizen features

- Create an account and sign in
- Choose between birth certificate and National ID
- Complete a document-specific intake form
- Declare which supporting documents are available
- Receive a reference number on submission
- View submitted records and their current status on a dashboard

### Administrator features

- Sign in to a separate officer portal
- View all submitted intake records, newest first
- Open an individual record by reference number
- Inspect applicant details, checklist, and full audit history
- Set a new status and record a mandatory officer comment
- Promote or demote user roles

### System features

- Session-based authentication with role resolution per request
- `auth` and `adminOnly` route guards
- Collision-checked reference-number generation
- Append-only `status_logs` table — updates never overwrite history
- Environment validated at startup; the server refuses to boot on bad config

### Accessibility and usability features

- Every form field has a programmatically associated label (`htmlFor` / `id`)
- Required fields marked visually and via the native `required` attribute
- Placeholders are never used as the only label
- Multilingual labels in English, Shona and Ndebele on citizen-facing forms
- Responsive layouts with a mobile breakpoint on label text
- Small asset footprint — one CSS file and one JS bundle, minimal imagery

## 7. User roles

| Role | Stored value | Capabilities |
|---|---|---|
| Citizen | `citizen` (default) | Submit intake records, view own records only |
| Administrator / Registry Officer | `admin` | View all records, update status, manage roles |
| Assisted citizen | *no separate role* | A record captured on their behalf is flagged `isAdminAssisted` |

Role is stored on the `user` table and defaults to `citizen`. It is not settable
during sign-up (`input: false` in the Better Auth config), so a user cannot
self-promote. Promotion happens only through `PATCH /api/admin/users/:id/role`.

An **assisted citizen** is not a login role. It describes a citizen who cannot
use the system independently and whose information is captured by an authorised
officer with their consent.

## 8. Application status lifecycle

The five values below come directly from `statusEnum` in
`app/src/db/schema.ts` and are the only values the status-update route accepts.

| Status | Meaning |
|---|---|
| `submitted` | Record received; no officer has reviewed it yet |
| `under_review` | An officer is actively assessing the record |
| `missing_information` | Something is required before the record can proceed; the officer's comment explains what |
| `ready_for_registry_visit` | Preparation is complete; the citizen can attend a registry office |
| `closed` | The record is finalised and requires no further action |

```mermaid
flowchart TD
    A[submitted] --> B[under_review]
    B --> C[missing_information]
    C --> B
    B --> D[ready_for_registry_visit]
    D --> E[closed]
    B --> E
    C --> E
```

**Important:** this diagram shows the *expected* progression. The API does not
enforce it. `PATCH /api/admin/intakes/:referenceNumber/status` accepts any of the
five values from any current state, so an officer can move a record directly
from `submitted` to `closed`. Transition validation is a planned improvement.

Every change writes a `status_logs` row capturing the previous status, the new
status, the officer, and the comment. Records are updated in place, but their
history is never overwritten.

## 9. User flows

### Citizen flow

```mermaid
flowchart LR
    A[Register or log in] --> B[Choose document type]
    B --> C[Complete intake form]
    C --> D[Tick document checklist]
    D --> E[Submit]
    E --> F[Receive reference number]
    F --> G[Track status on dashboard]
```

### Administrator flow

```mermaid
flowchart LR
    A[Log in to officer portal] --> B[View review queue]
    B --> C[Open intake record]
    C --> D[Inspect details and checklist]
    D --> E[Select new status]
    E --> F[Add officer comment]
    F --> G[Save update]
    G --> H[Audit log entry created]
```

Detailed step-by-step flows are in [docs/USER_FLOWS.md](docs/USER_FLOWS.md).

## 10. System architecture

ZivaID is a two-tier client–server application. The React SPA runs entirely in
the browser and communicates with the Elysia API over HTTP using `fetch` with
`credentials: 'include'`, so the session cookie accompanies every request.

```mermaid
flowchart TD
    CB[Citizen browser] --> FE[React SPA - Vite]
    AB[Administrator browser] --> FE
    FE -->|fetch with credentials| API[Elysia API - Bun]
    API --> BA[Better Auth]
    BA --> ORM[Drizzle ORM]
    API --> ORM
    ORM --> DB[(PostgreSQL - Supabase)]
```

Better Auth is mounted into the Elysia app and shares the same Drizzle
connection, so sessions and application data live in one database. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 11. Technology stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Bun | 1.3.14 | Backend runtime, package manager, test runner |
| API framework | Elysia | 1.4.29 | HTTP routing, validation, middleware |
| API language | TypeScript | — | Backend source language |
| Validation | Elysia `t` (TypeBox) | bundled | Request body schemas |
| API docs | `@elysiajs/openapi` | ^1.4.15 | Interactive OpenAPI UI at `/openapi` |
| CORS | `@elysiajs/cors` | ^1.4.2 | Credentialed cross-origin requests |
| Authentication | Better Auth | ^1.6.25 | Sessions, password hashing, role field |
| ORM | Drizzle ORM | ^0.45.2 | Type-safe queries and schema definition |
| Migrations | Drizzle Kit | ^0.31.10 | Migration generation and application |
| Driver | postgres.js | ^3.4.9 | PostgreSQL client |
| Database | PostgreSQL | — | Hosted on Supabase |
| Frontend | React | ^19.2.7 | UI library |
| Routing | React Router | ^7.18.2 | Client-side routing |
| Build tool | Vite | ^8.1.1 | Dev server and production build |
| Linting | oxlint | ^1.71.0 | Frontend linting |
| Config | dotenv | ^17.4.2 | Environment loading |
| Tooling | Git, GitHub, Postman | — | Version control and API testing |

The frontend is written in **JavaScript** (`.jsx`), not TypeScript, apart from
`src/lib/auth-client.ts`.

## 12. Repository structure

```
Ziva_ID/
├── api/
│   └── index.ts                  # Vercel Function entry — re-exports the Elysia app
├── vercel.json                   # Vercel runtime, build, and routing config
├── app/                          # Elysia + Bun backend
│   ├── drizzle/                  # Generated SQL migrations
│   │   ├── 0000_wise_captain_america.sql
│   │   ├── 0001_simple_junta.sql
│   │   └── meta/                 # Migration journal and snapshots
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client (postgres.js singleton)
│   │   │   └── schema.ts         # All 7 tables, 2 enums, relations
│   │   ├── lib/
│   │   │   ├── auth.ts           # Better Auth configuration
│   │   │   ├── env.ts            # Validated environment contract
│   │   │   └── reference-number.ts
│   │   ├── routes/
│   │   │   ├── admin.ts          # Officer routes (adminOnly)
│   │   │   └── citizen.ts        # Citizen intake routes (auth)
│   │   ├── app.ts                # Builds and exports the app — no .listen()
│   │   └── index.ts              # Local server entry — imports app, listens
│   ├── tests/auth.test.ts        # Sign-up / sign-in tests
│   ├── .env.example              # Backend environment contract
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
├── client/                       # React + Vite frontend
│   ├── public/                   # favicon.svg, icons.svg
│   ├── src/
│   │   ├── assets/               # Page-scoped CSS + images
│   │   ├── components/
│   │   │   ├── MultilingualLabel.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── constants/multilingualLabels.js
│   │   ├── lib/auth-client.ts    # Better Auth React client
│   │   ├── pages/
│   │   │   ├── admin/            # adminDashboard, adminReview
│   │   │   ├── auth/             # gateway, logins, registration
│   │   │   └── citizen/          # citizenDashboard, intakeForm
│   │   ├── utils/                # records.js, zimDistricts.js
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Global tokens + multilingual label styles
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment contract
│   ├── package.json
│   └── vite.config.js
├── docs/                         # Project documentation
├── postman/ + .postman/          # Postman workspace files
├── .gitignore
└── README.md
```

There is **no root `package.json`**. The frontend and backend are installed and
run independently. (This becomes relevant for deployment — see §23.)

Two files appear unused: `client/src/App1.jsx` and `client/src/AuthTest.jsx`.
They are not referenced by `App.jsx` and are likely development leftovers.

## 13. Database design

Seven tables. Four belong to Better Auth; three carry the ZivaID domain.

| Table | Owner | Purpose |
|---|---|---|
| `user` | Better Auth | Accounts, plus `role` and optional `nationalID` |
| `session` | Better Auth | Active sessions |
| `account` | Better Auth | Credentials, including the password hash |
| `verification` | Better Auth | Verification tokens |
| `intake_records` | ZivaID | One submitted application record |
| `checklist_items` | ZivaID | Declared supporting documents per record |
| `status_logs` | ZivaID | Append-only audit trail |

**Relationships**

- A `user` submits many `intake_records`
- An `intake_record` has many `checklist_items`
- An `intake_record` has many `status_logs`
- A `status_log` references the `user` (officer) who made the change

```mermaid
erDiagram
    user ||--o{ intake_records : submits
    user ||--o{ status_logs : "changed by"
    intake_records ||--o{ checklist_items : contains
    intake_records ||--o{ status_logs : records

    user {
        text id PK
        text name
        text email UK
        text role
        text national_id
    }
    intake_records {
        integer id PK
        text reference_number UK
        enum document_type
        enum status
        text full_name
        text date_of_birth
        text gender
        text place_of_origin
        text district_code
        text details
        text submitted_by_user_id FK
        boolean is_admin_assisted
    }
    checklist_items {
        integer id PK
        integer intake_record_id FK
        text item_label
        boolean is_available
    }
    status_logs {
        integer id PK
        integer intake_record_id FK
        text changed_by_user_id FK
        enum previous_status
        enum new_status
        text comment
    }
```

### Reference number vs. database ID

Every intake record has **two** identifiers, and they are not interchangeable:

- **`id`** — an auto-generated integer primary key. Internal. Used for foreign
  keys and by `GET /api/citizen/intake/:id`.
- **`reference_number`** — a unique public string, format
  `ZID-{BC|NID}-{YEAR}-{6 digits}` (e.g. `ZID-BC-2026-482913`). This is what the
  citizen is given and what the admin routes look records up by.

Admin routes address records by **reference number**, not integer ID, so an
officer never needs to know the internal key.

Full detail in [docs/DATABASE.md](docs/DATABASE.md).

## 14. API overview

Base URL in local development: `http://localhost:3000`

### Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| `*` | `/api/auth/*` | Public | Better Auth handler — sign-up, sign-in, sign-out, session |

Better Auth is mounted at the application root and self-prefixes to
`/api/auth`. Verified live: `GET /api/auth/ok` returns `200`.

### Citizen intake and tracking

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/citizen/intake` | Citizen | Submit a new intake record |
| `GET` | `/api/citizen/intake` | Citizen | List the caller's own records |
| `GET` | `/api/citizen/intake/:id` | Citizen | Fetch one own record by integer ID |

`POST /api/citizen/intake` body: `documentType` (`national_id` \| `birth_certificate`),
`fullName`, `dateOfBirth`, `gender`, `placeOfOrigin`, optional `districtCode`,
optional `details` object, optional `checklist` array of
`{ itemLabel, isAvailable }`. Responds `201` with the created record, including
its `referenceNumber`.

`GET /api/citizen/intake/:id` scopes the lookup to the caller's own `user.id`, so one
citizen cannot read another's record.

### Administrator

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all users |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Set role to `citizen` or `admin` |
| `GET` | `/api/admin/intakes` | Admin | Review queue, newest first |
| `GET` | `/api/admin/intakes/:referenceNumber` | Admin | Record + checklist + audit history |
| `PATCH` | `/api/admin/intakes/:referenceNumber/status` | Admin | Update status and write an audit entry |

The status route requires `newStatus` (one of the five enum values) and
`comment` (minimum 3 characters). The comment is mandatory — an officer cannot
change a status without recording a reason.

### Other

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/` | Public | Returns `"Hello Elysia"` — placeholder, not a health check |

There is **no dedicated health-check route**. Full request and response examples
are in [docs/API.md](docs/API.md).

## 15. Interactive API documentation

Interactive OpenAPI documentation is **configured and working**, provided by
`@elysiajs/openapi`.

| Resource | URL |
|---|---|
| Documentation UI | http://localhost:3000/openapi |
| Raw OpenAPI spec | http://localhost:3000/openapi/json |

To use it, start the backend and open the UI:

```bash
cd app
bun run dev
# then open http://localhost:3000/openapi
```

All eight application routes are documented, grouped under three tags —
**Citizen**, **Admin**, and **System**. Request bodies are generated
automatically from the existing Elysia `t.Object` validation schemas, so the
documentation cannot drift from the validation rules.

> **Package note:** this project uses `@elysiajs/openapi` (v1.4.x), which tracks
> the Elysia 1.4 line. The older `@elysiajs/swagger` package has not been
> updated past 1.3.1 and is not used here.

**Authentication in the docs UI.** ZivaID uses session cookies, not bearer
tokens. To exercise a protected route from `/openapi`, first sign in through
`/api/auth/sign-in/email` in the same browser; the session cookie is then sent
automatically with requests issued from the documentation page.

**Known limitation:** the Better Auth routes (`/api/auth/*`) do **not** appear
in the specification. They are mounted with `.mount(auth.handler)` as an opaque
WinterCG handler, which Elysia cannot introspect. They are documented manually
in [docs/API.md](docs/API.md).

## 16. Installation and setup

### Prerequisites

- [Bun](https://bun.sh) 1.3 or later (verified on 1.3.14)
- A PostgreSQL database (this project uses Supabase)
- Git

### Clone

```bash
git clone https://github.com/mufaro-k07/Ziva_ID.git
cd Ziva_ID
```

### Backend

```bash
cd app
bun install
cp .env.example .env      # then fill in the values — see §17
bun run dev               # http://localhost:3000
```

### Frontend

In a second terminal:

```bash
cd client
bun install
cp .env.example .env
bun run dev               # http://localhost:5173
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |
| Auth endpoints | http://localhost:3000/api/auth |

There is no single root command to start both — run them in separate terminals.
Detailed instructions, including Windows PowerShell notes, are in
[docs/SETUP.md](docs/SETUP.md).

## 17. Environment variables

### Backend — `app/.env`

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `NODE_ENV` | `development` or `production` | Optional (defaults to `development`) | `development` |
| `PORT` | Port the API binds | Optional (defaults to `3000`) | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | **Required** | `postgresql://USER:PASSWORD@HOST:5432/postgres` |
| `BETTER_AUTH_SECRET` | Session signing secret, **min 32 chars** | **Required** | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Public base URL of this API | **Required** | `http://localhost:3000` |
| `CORS_ORIGINS` | Comma-separated allowed browser origins | Required in production | `http://localhost:5173` |
| `TRUSTED_ORIGINS` | Origins Better Auth accepts for sign-in | Required in production | `http://localhost:5173` |

All of these are validated at startup by `app/src/lib/env.ts`. The server
**refuses to boot** on a missing `DATABASE_URL`, a short `BETTER_AUTH_SECRET`, or
an `http://` origin when `NODE_ENV=production`.

> **Windows note:** do not add a lowercase `port=` line to `app/.env`. Windows
> resolves environment variables case-insensitively, so it silently overrides
> `PORT`. This is documented in `app/.env.example`.

### Frontend — `client/.env`

| Variable | Purpose | Required | Example |
|---|---|---|---|
| `VITE_BETTER_AUTH_URL` | Base URL of the API | Optional (defaults to `http://localhost:3000`) | `http://localhost:3000` |

⚠️ `VITE_*` variables are inlined into the browser bundle and are **public**.
Never give `DATABASE_URL` or `BETTER_AUTH_SECRET` a `VITE_` prefix.

## 18. Database setup

The connection is a module-level `postgres.js` client in `app/src/db/index.ts`,
created once and reused. `prepare: false` is set, which is required for
compatibility with transaction-mode connection poolers such as Supabase's.

Drizzle is configured in `app/drizzle.config.ts`: schema at `src/db/schema.ts`,
migrations output to `./drizzle`, dialect `postgresql`.

```bash
cd app

bun run db:generate   # generate SQL from schema changes
bun run db:migrate    # apply pending migrations
bun run db:push       # push schema directly (development only)
```

**Recommended workflow:** edit `src/db/schema.ts`, run `db:generate`, review the
generated SQL, then `db:migrate`. Prefer this over `db:push` — generated
migrations are reviewable and reproducible.

There is **no seed script**. To create an administrator, register a normal
citizen account, then have an existing admin promote it via
`PATCH /api/admin/users/:id/role`. The first admin must be promoted manually in the
database.

> **Historical note:** the schema was originally created with `db:push`, which
> left the database without a `__drizzle_migrations` table. It has since been
> baselined so that `db:migrate` works normally. See
> [docs/DATABASE.md](docs/DATABASE.md).

## 19. Available scripts

| Script | Directory | Command | Purpose |
|---|---|---|---|
| `dev` | `app` | `bun run --watch src/index.ts` | Start API with hot reload |
| `start` | `app` | `bun run src/index.ts` | Start API without watch (production) |
| `test` | `app` | `bun test` | Run backend tests |
| `db:generate` | `app` | `drizzle-kit generate` | Generate migration SQL |
| `db:migrate` | `app` | `drizzle-kit migrate` | Apply pending migrations |
| `db:push` | `app` | `drizzle-kit push` | Push schema directly (dev only) |
| `dev` | `client` | `vite` | Start frontend dev server |
| `build` | `client` | `vite build` | Production build to `dist/` |
| `preview` | `client` | `vite preview` | Serve the production build locally |
| `lint` | `client` | `oxlint` | Lint frontend source |

There are no root-level scripts.

## 20. Testing

### Current state

| Item | Detail |
|---|---|
| Runner | `bun test` (Bun's built-in runner) |
| Test files | 1 — `app/tests/auth.test.ts` |
| Tests | 2, both passing |
| Frontend tests | **None** |

The existing tests cover Better Auth sign-up (asserting the default role is
`citizen`) and sign-in with the same credentials.

> ⚠️ **These tests hit the real database.** They call `auth.api.signUpEmail`
> against whatever `DATABASE_URL` points to, creating a real user row per run
> (the email is timestamped to avoid collisions). Do not run them against
> production without understanding this.

### Planned testing

Not yet implemented:

- Intake submission — valid payload, missing required fields, invalid `documentType`
- Reference-number uniqueness under concurrent submission
- Citizen record isolation — one citizen must not read another's record
- `adminOnly` enforcement — a citizen must receive `403` on admin routes
- Status update — enum validation, minimum comment length, audit-log creation
- Frontend component and form-validation tests
- End-to-end citizen and officer journeys

See [docs/TESTING.md](docs/TESTING.md).

## 21. Security and privacy considerations

**Implemented**

- Password hashing and session management handled by Better Auth
- Session cookies are HTTP-only by default; `secure` is applied automatically
  when `BETTER_AUTH_URL` is `https://`
- Role-based access via `auth` and `adminOnly` macros, resolved per request
- `role` cannot be set during sign-up (`input: false`), preventing self-promotion
- Citizen record queries are scoped to the authenticated user's own `id`
- CORS is restricted to configured origins; wildcards are impossible alongside
  `credentials: true`
- Startup validation rejects insecure production configuration
- Append-only audit log records who changed what, and when
- Secrets are kept in `.env`, which is git-ignored at every depth; no `.env`
  file has ever been committed to this repository

**Limitations**

- No rate limiting on authentication endpoints
- No email verification — `emailVerified` defaults to `false` and is unused
- No CSRF protection beyond Better Auth's built-in origin checking
- Status transitions are not validated against the lifecycle
- Personal data is stored in plain text (names, dates of birth, ID numbers)
- No data-retention or deletion policy

> This is an academic MVP. It has **not** undergone a formal production security
> audit and should not handle real citizen data.

## 22. Accessibility and low-bandwidth considerations

**Implemented**

- All form inputs have programmatically associated labels (`htmlFor` / `id`)
- Required fields use the native `required` attribute, announced by screen readers
- Placeholders supplement labels; they never replace them
- Multilingual labels (English / Shona / Ndebele) on citizen-facing forms, with
  translations marked `aria-hidden` so screen-reader output stays coherent —
  rationale in [docs/MULTILINGUAL_LABELS.md](docs/MULTILINGUAL_LABELS.md)
- Responsive layouts; label text scales down at a 480px breakpoint
- Small asset footprint: one CSS bundle (~12 kB) and one JS bundle
  (~318 kB, ~98 kB gzipped), with almost no imagery

**Planned improvements**

- Route-level code splitting — the app currently ships as a single JS chunk
- Formal colour-contrast audit
- Full keyboard-navigation and screen-reader testing
- Explicit `lang` attributes on Shona and Ndebele text runs
- Offline or poor-connectivity handling

## 23. Current development status

| Feature | Status | Notes |
|---|---|---|
| Citizen registration and login | **Implemented** | Better Auth, email + password |
| Officer login | **Implemented** | Same auth, separate page, role-gated |
| Role-based access control | **Implemented** | `auth` / `adminOnly` macros |
| Citizen dashboard | **Implemented** | Live data from `GET /api/citizen/intake` |
| Birth certificate intake | **Implemented** | `/citizen/apply/birth` |
| National ID intake | **Implemented** | `/citizen/apply/id`, includes 16+ age check |
| Document readiness checklist | **Implemented** | Stored in `checklist_items` |
| Reference-number generation | **Implemented** | Collision-checked, `ZID-*` format |
| Citizen status tracking | **Implemented** | Status shown on dashboard |
| Admin review queue | **Implemented** | `GET /api/admin/intakes` |
| Admin record inspection | **Implemented** | Record + checklist + audit history |
| Status update API | **Implemented** | Mandatory comment, enum-validated |
| Status audit logs | **Implemented** | Append-only; shown on the review page |
| District code capture | **Implemented** | 62 districts; added in migration `0001` |
| Multilingual labels | **Partial** | Implemented, but translations are unverified by a native speaker |
| Admin audit-log tab | **Partial** | Dashboard tab is a placeholder; audit data *is* shown per record |
| Assisted intake | **In progress** | UI form exists but has no server endpoint — submitting shows an alert |
| Status transition rules | **Planned** | Any status can currently follow any other |
| Notifications (SMS / email) | **Planned** | Not started |
| Document uploads | **Planned** | Checklist is declaration-only |
| Interactive API docs | **Implemented** | `@elysiajs/openapi` at `/openapi`; auth routes excluded — see §15 |
| Automated frontend tests | **Planned** | None exist |
| Deployment | **Partial** | Vercel config, function entry, and `/api` routing done and locally verified — **not yet deployed**. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

## 24. Screenshots

<!--
Add screenshots here before submission. Suggested captures:

  Citizen dashboard        — docs/images/citizen-dashboard.png
  Birth certificate intake — docs/images/intake-birth.png
  National ID intake       — docs/images/intake-national-id.png
  Admin review queue       — docs/images/admin-queue.png
  Admin record inspection  — docs/images/admin-review.png
  Status tracking          — docs/images/status-tracking.png

Create docs/images/ and reference them as:
  ![Citizen dashboard](docs/images/citizen-dashboard.png)

No image files are referenced yet, so this section renders empty by design.
-->

*Screenshots to be added before submission.*

## 25. Project documentation

| Document | Contents |
|---|---|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, auth flow, design decisions |
| [docs/API.md](docs/API.md) | Full route reference with request/response examples |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, relationships, migration procedure |
| [docs/SETUP.md](docs/SETUP.md) | Installation and troubleshooting |
| [docs/USER_FLOWS.md](docs/USER_FLOWS.md) | Step-by-step citizen and officer journeys |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel architecture, environment variables, deployment steps, rollback |
| [docs/TESTING.md](docs/TESTING.md) | Test setup, manual scenarios, coverage gaps |
| [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) | Structured walkthrough for a submission video |
| [docs/MULTILINGUAL_LABELS.md](docs/MULTILINGUAL_LABELS.md) | Translation glossary and confidence ratings |

## 26. Academic project disclaimer

ZivaID is an academic prototype built for a university software engineering
course. It is **not affiliated with the Government of Zimbabwe**, the Registrar
General's Office, or any civil registry authority. It does **not issue identity
documents** and confers no legal status on any record it stores.

Requirements, checklists, and guidance shown in the application are for
preparation only and **must be verified** with the responsible Civil Registry
authority before acting on them.

**Do not enter real sensitive personal information** into demonstration
deployments of this system.

## 27. Author

Developed by **Mufaro Kunze** as a software engineering project at the African
Leadership University.

Repository: <https://github.com/mufaro-k07/Ziva_ID>

## 28. Licence

Licence information has not yet been specified.
