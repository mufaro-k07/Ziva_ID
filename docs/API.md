# API Reference

## Base URL

| Environment | URL |
|---|---|
| Local development | `http://localhost:3000` |
| Production | Not yet deployed |

## Authentication

ZivaID uses **session cookies**, not bearer tokens. Sign in through Better Auth,
and the browser stores an HTTP-only session cookie that must accompany every
subsequent request.

From the browser:

```js
// API_BASE already contains the /api segment — see client/src/utils/records.js
fetch(`${API_BASE}/citizen/intake`, { credentials: 'include' });
```

From curl:

```bash
# Sign in and save the cookie
curl -c cookies.txt -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@example.com","password":"YOUR_PASSWORD"}'

# Reuse it
curl -b cookies.txt http://localhost:3000/api/citizen/intake
```

> No real credentials or tokens appear in this document. Replace all
> placeholders with your own test values.

### Access levels

| Level | Requirement | Failure |
|---|---|---|
| Public | None | — |
| Citizen | Valid session (`auth: true`) | `401` with empty body |
| Admin | Valid session **and** `role === "admin"` (`adminOnly: true`) | `401`, or `403 { "error": "Admin access required" }` |

Admin routes are protected on the server by the `adminOnly` macro. The
frontend's `ProtectedRoute` component is a convenience redirect only and is not
a security boundary.

---

## Authentication routes

| Method | Path | Access | Purpose |
|---|---|---|---|
| `*` | `/api/auth/*` | Public | Better Auth handler |

Better Auth is mounted at the root of the Elysia app and self-prefixes to
`/api/auth`. Commonly used endpoints:

| Endpoint | Purpose |
|---|---|
| `POST /api/auth/sign-up/email` | Register — `{ email, password, name, nationalID? }` |
| `POST /api/auth/sign-in/email` | Sign in — `{ email, password }` |
| `POST /api/auth/sign-out` | End the session |
| `GET /api/auth/get-session` | Current session and user |
| `GET /api/auth/ok` | Liveness check — returns `200` |

`role` **cannot** be set at sign-up. It is configured with `input: false` and
always defaults to `citizen`.

---

## Citizen routes

All require a valid session.

### `POST /api/citizen/intake`

Submit a new intake record. Creates the record, any checklist items, and an
initial `status_logs` entry in one request.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `documentType` | `"national_id" \| "birth_certificate"` | Yes | |
| `fullName` | string | Yes | |
| `dateOfBirth` | string | Yes | Stored as text, not a date type |
| `gender` | string | Yes | |
| `placeOfOrigin` | string | Yes | |
| `districtCode` | string | No | Two-digit registry district code |
| `details` | object | No | Document-specific fields; stored as JSON text |
| `checklist` | array | No | `{ itemLabel: string, isAvailable: boolean }` |

```json
{
  "documentType": "birth_certificate",
  "fullName": "Tendai Moyo",
  "dateOfBirth": "2008-04-12",
  "gender": "female",
  "placeOfOrigin": "Sally Mugabe Hospital, Harare",
  "districtCode": "63",
  "details": {
    "motherName": "Rutendo Moyo",
    "motherMaidenName": "Rutendo Chirwa",
    "motherIdNumber": "63-123456 A 42",
    "hospitalOfBirth": "Sally Mugabe Hospital"
  },
  "checklist": [
    { "itemLabel": "Notification of Birth from hospital/clinic", "isAvailable": true },
    { "itemLabel": "Mother's national ID card", "isAvailable": false }
  ]
}
```

**Response `201`** — the created record:

```json
{
  "id": 7,
  "referenceNumber": "ZID-BC-2026-482913",
  "documentType": "birth_certificate",
  "status": "submitted",
  "fullName": "Tendai Moyo",
  "dateOfBirth": "2008-04-12",
  "gender": "female",
  "placeOfOrigin": "Sally Mugabe Hospital, Harare",
  "districtCode": "63",
  "details": "{\"motherName\":\"Rutendo Moyo\"}",
  "submittedByUserId": "abc123",
  "isAdminAssisted": false,
  "createdAt": "2026-07-30T09:12:44.000Z",
  "updatedAt": "2026-07-30T09:12:44.000Z"
}
```

`details` is returned as a **JSON string**, exactly as stored. The admin
single-record route parses it; this one does not.

### `GET /api/citizen/intake`

All records submitted by the authenticated citizen. Returns an array (empty if
none). Records belonging to other users are never included.

### `GET /api/citizen/intake/:id`

One record by **integer database ID**, scoped to the caller.

| Response | Meaning |
|---|---|
| `200` | The record |
| `404 { "error": "Record not found" }` | No such record, **or** it belongs to another citizen |

The `404` is deliberate: it does not reveal whether a record exists under
another account.

---

## Administrator routes

All require `role === "admin"`.

### `GET /api/admin/users`

Every user row. Includes Better Auth fields.

### `PATCH /api/admin/users/:id/role`

Promote or demote a user.

```json
{ "role": "admin" }
```

`role` must be `"citizen"` or `"admin"`. Returns the updated user, or
`404 { "error": "User not found" }`.

### `GET /api/admin/intakes`

The review queue — all intake records ordered by `createdAt` descending. No
pagination.

### `GET /api/admin/intakes/:referenceNumber`

One record by **public reference number**, with its checklist and full audit
history. This is the record-inspection endpoint.

**Response `200`**

```json
{
  "id": 7,
  "referenceNumber": "ZID-BC-2026-482913",
  "documentType": "birth_certificate",
  "status": "under_review",
  "fullName": "Tendai Moyo",
  "districtCode": "63",
  "details": { "motherName": "Rutendo Moyo" },
  "checklist": [
    { "id": 1, "intakeRecordId": 7, "itemLabel": "Notification of Birth", "isAvailable": true }
  ],
  "auditHistory": [
    {
      "id": 2,
      "previousStatus": "submitted",
      "newStatus": "under_review",
      "comment": "Verifying supporting documents.",
      "createdAt": "2026-07-30T10:02:00.000Z",
      "changedBy": "Officer Ncube"
    }
  ]
}
```

Note: `details` **is** parsed into an object here, unlike the citizen routes.
`auditHistory` is newest-first and joins the officer's name.

Returns `404 { "error": "Intake record not found" }` if the reference number
does not exist.

### `PATCH /api/admin/intakes/:referenceNumber/status`

Update a record's status and write an audit entry. This is the core
adjudication endpoint.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `newStatus` | enum | Yes | One of the five status values |
| `comment` | string | Yes | Minimum 3 characters |

```json
{
  "newStatus": "missing_information",
  "comment": "Mother's National ID was not presented. Please bring the original."
}
```

**Response `200`**

```json
{
  "success": true,
  "record": { "id": 7, "status": "missing_information", "...": "..." },
  "message": "Record ZID-BC-2026-482913 updated to missing_information"
}
```

Behaviour worth knowing:

- The **comment is mandatory** — a status cannot change without a recorded reason
- A `status_logs` row is always written, capturing previous status, new status,
  officer ID, and comment
- The route authenticates **before** looking the record up, so a `404` never
  reveals whether a reference number exists to an unauthenticated caller
- **Transitions are not validated.** Any of the five statuses is accepted from
  any current state

---

## Other routes

| Method | Path | Access | Response |
|---|---|---|---|
| `GET` | `/` | Public | `"Hello Elysia"` |

This is a placeholder from the Elysia starter, not a health check. There is
currently **no dedicated health endpoint**.

---

## Error responses

| Status | Body | Cause |
|---|---|---|
| `400` | Elysia validation error | Body failed the `t.Object` schema |
| `401` | *(empty)* | No valid session — returned by the `auth`/`adminOnly` macros |
| `403` | `{ "error": "Admin access required" }` | Authenticated but not an admin |
| `404` | `{ "error": "Record not found" }` | Citizen record missing or not owned by caller |
| `404` | `{ "error": "Intake record not found" }` | Unknown reference number |
| `404` | `{ "error": "User not found" }` | Unknown user ID on role update |
| `422` | Elysia validation error | Malformed enum or too-short comment |

The `401` response has an **empty body** — the macros call `status(401)` with no
payload. Clients should treat any `401` as "not signed in" rather than parsing it.

---

## Reference number vs. database ID

Each intake record carries two identifiers:

| | `id` | `referenceNumber` |
|---|---|---|
| Type | integer, auto-generated | string |
| Visibility | Internal | Public — given to the citizen |
| Format | `1`, `2`, `3`… | `ZID-BC-2026-482913` |
| Used by | `GET /api/citizen/intake/:id`, foreign keys | All `/api/admin/intakes/*` routes |

Format: `ZID-{BC|NID}-{YEAR}-{6 digits}`, where `BC` is a birth certificate and
`NID` a National ID. Generation retries on collision until the value is unique
(`app/src/lib/reference-number.ts`).

The two are **not interchangeable**. Passing an integer to an admin route
returns `404`.

---

## Interactive documentation

Interactive OpenAPI documentation is configured via `@elysiajs/openapi`.

| Resource | URL (local) |
|---|---|
| Documentation UI | http://localhost:3000/openapi |
| Raw spec | http://localhost:3000/openapi/json |

Start the backend (`cd app && bun run dev`) and open the UI. Request bodies are
generated from the same `t.Object` schemas the routes validate against, so the
documentation cannot drift from the actual validation rules.

Routes are grouped under three tags:

| Tag | Covers |
|---|---|
| `Citizen` | Intake submission and tracking |
| `Admin` | Review queue and adjudication |
| `System` | Service metadata |

**Authenticating in the UI.** ZivaID uses session cookies. Sign in via
`/api/auth/sign-in/email` in the same browser first — the cookie is then sent
automatically with requests issued from the documentation page. There is no
bearer-token field to fill in.

> **The `/api/auth/*` routes are absent from the generated spec.** Better Auth
> is attached with `.mount(auth.handler)`, which Elysia treats as an opaque
> WinterCG handler and cannot introspect. Those endpoints are documented
> manually in the [Authentication routes](#authentication-routes) section above.

Postman workspace files are also present in `postman/` and `.postman/`.
