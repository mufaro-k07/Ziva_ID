import { app } from "./app";
import { env } from "./lib/env";

/**
 * Local / persistent-server entry point.
 *
 * The application itself is built in `./app`. This file only starts a listener,
 * which is why serverless deployments import `./app` directly instead of this.
 *
 *   bun run dev    — watch mode
 *   bun run start  — no watch
 */

app.listen(env.PORT);

console.log(
  `🦊 ZivaID API [${env.NODE_ENV}] listening on ${app.server?.hostname}:${app.server?.port}`
);
console.log(`   allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
console.log(`   API docs: http://localhost:${app.server?.port}/openapi`);
