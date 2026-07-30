# ZivaID Documentation

Documentation index for the ZivaID Digital Identity Document Application and
Tracking System. Start with the [root README](../README.md) for project
overview, scope, and feature status.

## Contents

| Document | What it covers | Read it when |
|---|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, frontend–backend communication, authentication flow, role-based access, design decisions and their trade-offs | You want to understand how the pieces fit together |
| [API.md](API.md) | Every Elysia route with access level, request body, response shape, and error cases | You are calling the API or writing a client |
| [DATABASE.md](DATABASE.md) | All seven tables, enums, relationships, ER diagram, migration procedure | You are changing the schema or querying data |
| [SETUP.md](SETUP.md) | Prerequisites, installation, environment variables, running both services, common errors | You are setting the project up for the first time |
| [USER_FLOWS.md](USER_FLOWS.md) | Step-by-step citizen and officer journeys with diagrams | You want to know what a user actually experiences |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel architecture, environment variables, step-by-step deployment, post-deploy checklist, rollback | You are deploying the system |
| [TESTING.md](TESTING.md) | Current test setup, manual test scenarios, known gaps | You are testing or extending test coverage |
| [DEMO_GUIDE.md](DEMO_GUIDE.md) | Structured walkthrough with speaking cues for a submission video | You are recording a demonstration |
| [MULTILINGUAL_LABELS.md](MULTILINGUAL_LABELS.md) | English / Shona / Ndebele glossary with per-term confidence ratings | You are reviewing or extending the translations |

## Quick reference

| Item | Value |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| API (dev) | http://localhost:3000 |
| Auth endpoints | http://localhost:3000/api/auth |
| Backend runtime | Bun 1.3.14 + Elysia 1.4.29 |
| Frontend | React 19 + Vite 8 |
| Database | PostgreSQL (Supabase) via Drizzle ORM |
| Interactive API docs | http://localhost:3000/openapi (spec at `/openapi/json`) |

## Documentation conventions

- **National ID** and **birth certificate** are used consistently
- A submission is called an **intake record**, never an official government
  application — ZivaID does not process official applications
- **Reference number** (public, `ZID-*`) is distinct from the **database ID**
  (internal integer) — see [DATABASE.md](DATABASE.md)
- Feature status is one of *Implemented*, *Partial*, *In progress*, or *Planned*.
  Anything not marked *Implemented* should not be assumed to work.
