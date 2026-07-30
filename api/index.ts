/**
 * Vercel Function entry point for the ZivaID API.
 *
 * Vercel does not support `app.listen()` — it requires the application to be
 * exported as a default export. This file therefore does nothing except
 * re-export the Elysia app built in `app/src/app.ts`.
 *
 * There is no route registration here on purpose. Routes, plugins, and the
 * `auth`/`adminOnly` macros are all registered once in `app/src/app.ts`, so the
 * serverless deployment and the local server (`app/src/index.ts`) run byte-for-
 * byte identical middleware in identical order.
 *
 * Runtime: Bun, configured via `bunVersion` in vercel.json.
 */
import app from "../app/src/app";

export default app;
