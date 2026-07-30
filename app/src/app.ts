import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { citizenRoutes } from "./routes/citizen";
import { adminRoutes } from "./routes/admin";

/**
 * Builds the ZivaID Elysia application WITHOUT starting a server.
 *
 * This file deliberately never calls `.listen()`. Two consumers import it:
 *
 *   - `src/index.ts`  — local development and any persistent-server host.
 *                       It imports this app and calls `.listen()`.
 *   - `api/index.ts`  — the serverless entry point, which exports the app as a
 *                       default export. Vercel does not support `.listen()`.
 *
 * There is exactly ONE app instance and ONE route registration path, so the
 * two environments cannot drift apart.
 *
 * Plugin order matters: `betterAuthPlugin` declares the `auth` and `adminOnly`
 * macros, so it MUST be registered before the route plugins that use them.
 */

const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },

    adminOnly: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        if (session.user.role !== "admin") {
          return status(403, { error: "Admin access required" });
        }
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

export const app = new Elysia()
  .use(
    cors({
      // Origins come from CORS_ORIGINS; credentials:true forbids a wildcard.
      origin: env.CORS_ORIGINS,
      credentials: true,
    })
  )
  // Interactive API documentation. Registered before the route plugins so
  // their `t.Object` schemas and `detail` metadata are picked up.
  //   UI:   /openapi
  //   Spec: /openapi/json
  .use(
    openapi({
      documentation: {
        info: {
          title: "ZivaID API",
          version: "1.0.0",
          description:
            "Digital Identity Document Application and Tracking System for " +
            "Zimbabwean birth certificates and National IDs.\n\n" +
            "**Authentication uses session cookies, not bearer tokens.** Sign in " +
            "via `/api/auth/sign-in/email` first; the browser then sends the " +
            "session cookie automatically.\n\n" +
            "Academic project — not an official Government of Zimbabwe service.",
        },
        tags: [
          { name: "Citizen", description: "Intake submission and tracking. Requires a citizen session." },
          { name: "Admin", description: "Review queue and adjudication. Requires the admin role." },
          { name: "System", description: "Service metadata." },
        ],
      },
    })
  )
  .use(betterAuthPlugin)
  .use(citizenRoutes)
  .use(adminRoutes)
  .get("/", () => "Hello Elysia", {
    detail: {
      tags: ["System"],
      summary: "Service root",
      description:
        "Returns a static greeting. This is a placeholder, not a health check.",
    },
  });

export default app;
