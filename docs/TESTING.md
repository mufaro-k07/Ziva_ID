# Testing

## Current state

| Item | Value |
|---|---|
| Test runner | `bun test` (Bun's built-in runner) |
| Backend test files | 1 — `app/tests/auth.test.ts` |
| Backend tests | 2, both passing |
| Frontend test files | **0** |
| Frontend test runner | Not configured |
| Linting | `oxlint` (frontend only) |
| Type checking | Not configured — TypeScript is not a dependency |
| CI | None |

## Running tests

```bash
cd app
bun test
```

Expected:

```
 2 pass
 0 fail
 3 expect() calls
```

Lint the frontend:

```bash
cd client
bun run lint
```

Build as a correctness check:

```bash
cd client
bun run build
```

## ⚠️ Tests write to the real database

`app/tests/auth.test.ts` calls `auth.api.signUpEmail` against whatever
`DATABASE_URL` points to. **Every run creates a real user row.** The email is
timestamped (`test-${Date.now()}@example.com`) to avoid collisions, so repeated
runs accumulate test users.

Consequences:

- Do not run the suite against a production database
- Test accounts must be cleaned up manually
- The suite requires a live database connection and will fail offline

Pointing `DATABASE_URL` at a separate test database before running is
strongly recommended.

## What is covered

| Area | Covered | Test |
|---|---|---|
| Sign-up creates a user | ✅ | Asserts email matches and role defaults to `citizen` |
| Sign-in with valid credentials | ✅ | Asserts the returned user's email |

That is the entirety of automated coverage. The role-default assertion is
valuable — it verifies that a new account cannot arrive with elevated privileges.

## What is not covered

Everything else, including all business logic:

| Area | Risk if broken |
|---|---|
| Intake submission | Citizens cannot apply |
| Reference-number uniqueness | Duplicate public identifiers |
| Citizen record isolation | One citizen reads another's data — **privacy breach** |
| `adminOnly` enforcement | A citizen reaches admin routes — **privilege escalation** |
| Status-update validation | Invalid statuses stored |
| Audit-log creation | Silent loss of accountability |
| Comment minimum length | Status changes without justification |
| All frontend components | Broken UI |
| Age eligibility check | Ineligible applications accepted |

The two highest-risk gaps are **citizen record isolation** and **`adminOnly`
enforcement**. Both are implemented, but neither has a regression test.

---

## Manual test scenarios

Until automated coverage exists, verify these by hand before any release.

### Authentication

| # | Scenario | Expected |
|---|---|---|
| A1 | Register a new citizen | Account created, redirected to dashboard, role `citizen` |
| A2 | Register with an existing email | Inline error, no duplicate |
| A3 | Sign in with valid credentials | Redirected to dashboard |
| A4 | Sign in with a wrong password | Inline error, no session |
| A5 | Refresh after signing in | Session persists |
| A6 | Sign out | Session cleared, protected routes redirect |
| A7 | Visit `/citizen/dashboard` signed out | Redirected to login |
| A8 | Visit `/admin/dashboard` as a citizen | Redirected, no admin data |

### Citizen intake

| # | Scenario | Expected |
|---|---|---|
| C1 | Submit a complete birth certificate intake | `201`, reference number `ZID-BC-*` |
| C2 | Submit a complete National ID intake | `201`, reference number `ZID-NID-*` |
| C3 | Submit with a required field empty | Browser validation blocks it |
| C4 | Submit a National ID application for someone under 16 | Blocked with the eligibility error |
| C5 | Tick some checklist items | Selections stored in `checklist_items` |
| C6 | Submit two records | Two distinct reference numbers |
| C7 | View the dashboard | Both records with correct statuses |

### Data isolation — **security critical**

| # | Scenario | Expected |
|---|---|---|
| D1 | Citizen A requests Citizen B's record ID | `404`, not the record |
| D2 | Citizen A's dashboard | Only their own records |
| D3 | `GET /api/admin/intakes` as a citizen | `403 Admin access required` |
| D4 | `PATCH /api/admin/intakes/.../status` as a citizen | `403` |
| D5 | Any admin route with no session | `401` |

### Officer review

| # | Scenario | Expected |
|---|---|---|
| O1 | Open the review queue | All records, newest first |
| O2 | Open a record by reference number | Details, checklist, audit history |
| O3 | Open an unknown reference number | `404 Intake record not found` |
| O4 | Update status with a valid comment | `200`, status changed |
| O5 | Update with a 2-character comment | Validation error, no change |
| O6 | Update with an invalid status value | Validation error |
| O7 | After a status update | New `status_logs` row with previous and new status |
| O8 | Update the same record twice | Two audit entries, both retained |

### Multilingual labels

| # | Scenario | Expected |
|---|---|---|
| M1 | Open either intake form | Labels show English, Shona, Ndebele |
| M2 | Submit with the checklist ticked | `item_label` stored in **English** |
| M3 | Narrow the viewport to 480px | Translations wrap, no overflow |
| M4 | Tab through a form | Focus order correct, every field labelled |

### Accessibility

| # | Scenario | Expected |
|---|---|---|
| X1 | Click a label | Focus moves to its input |
| X2 | Screen reader on an intake field | Announces the English label once |
| X3 | Keyboard-only navigation | All controls reachable |
| X4 | Submit an invalid form | Error is associated with its field |

---

## Planned testing

### Suggested API tests

```
POST /api/citizen/intake
  ✓ creates a record and returns 201 with a reference number
  ✓ writes an initial status_logs entry with previous_status null
  ✓ stores checklist items against the record
  ✓ rejects an unknown documentType
  ✓ rejects a missing required field
  ✓ returns 401 with no session

GET /api/citizen/intake/:id
  ✓ returns the caller's own record
  ✓ returns 404 for another citizen's record   ← security critical

PATCH /api/admin/intakes/:referenceNumber/status
  ✓ updates status and inserts an audit row
  ✓ rejects a comment shorter than 3 characters
  ✓ rejects a status outside the enum
  ✓ returns 403 for a citizen                  ← security critical
  ✓ returns 404 for an unknown reference number

Reference numbers
  ✓ remain unique across concurrent submissions
```

### Suggested frontend tests

A runner would need adding — Vitest is the natural fit alongside Vite.

```
IntakeForm
  ✓ renders English, Shona and Ndebele for every label
  ✓ blocks National ID submission for under-16 applicants
  ✓ submits English checklist labels regardless of display language
  ✓ posts the expected payload shape

ProtectedRoute
  ✓ redirects an unauthenticated user
  ✓ redirects a citizen away from an admin route

MultilingualLabel
  ✓ associates htmlFor with the input id
  ✓ marks translations aria-hidden
```

### Suggested end-to-end tests

Playwright would cover the full journeys:

```
✓ register → apply → receive reference number → see it on the dashboard
✓ officer signs in → opens record → updates status → citizen sees the change
```

## Recommended next steps

1. Point tests at a dedicated test database, so runs stop polluting real data.
2. Add the two security-critical API tests — record isolation and `adminOnly`.
3. Add intake-submission tests covering the happy path and validation failures.
4. Add Vitest and cover `IntakeForm` and `ProtectedRoute`.
5. Wire `bun test` and `bun run lint` into CI on pull requests.
