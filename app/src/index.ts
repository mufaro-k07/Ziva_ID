import { app } from "./app";
import { env } from "./lib/env";

app.listen(env.PORT);

console.log(
  `🦊 ZivaID API [${env.NODE_ENV}] listening on ${app.server?.hostname}:${app.server?.port}`
);
console.log(`   allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
console.log(`   API docs: http://localhost:${app.server?.port}/openapi`);
