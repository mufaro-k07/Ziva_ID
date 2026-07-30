import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { citizenRoutes } from "./routes/citizen";
import { adminRoutes } from "./routes/admin";

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

const app = new Elysia()
  .use(
    cors({
      // Origins come from CORS_ORIGINS; credentials:true forbids a wildcard.
      origin: env.CORS_ORIGINS,
      credentials: true,
    })
  )
  .use(betterAuthPlugin)
  .use(citizenRoutes)
  .use(adminRoutes)
  .get("/", () => "Hello Elysia")
  .listen(env.PORT);

console.log(
  `🦊 ZivaID API [${env.NODE_ENV}] listening on ${app.server?.hostname}:${app.server?.port}`
);
console.log(`   allowed origins: ${env.CORS_ORIGINS.join(", ")}`);