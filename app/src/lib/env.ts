import 'dotenv/config';

/**
 * Single source of truth for server configuration.
 *
 * Every value is read and validated here at startup, so a misconfigured
 * deployment fails immediately with a clear message rather than surfacing
 * later as a confusing CORS, auth, or database error.
 */

const NODE_ENV = process.env.NODE_ENV?.trim() || 'development';
export const isProduction = NODE_ENV === 'production';

const problems: string[] = [];

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    problems.push(`${name} is required but was not set.`);
    return '';
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

/** Comma-separated origin list, e.g. "https://a.com,https://b.com". */
function originList(name: string, devFallback: string): string[] {
  const raw = process.env[name]?.trim();

  if (!raw) {
    if (isProduction) {
      problems.push(
        `${name} is required in production. Set it to a comma-separated list of allowed origins.`
      );
      return [];
    }
    return devFallback.split(',');
  }

  const origins = raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  for (const origin of origins) {
    try {
      new URL(origin);
    } catch {
      problems.push(`${name} contains "${origin}", which is not a valid absolute URL.`);
    }
    if (isProduction && origin.startsWith('http://')) {
      problems.push(`${name} contains insecure origin "${origin}". Production origins must use https://.`);
    }
  }

  return origins;
}

function port(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    problems.push(`${name} must be an integer between 1 and 65535, received "${raw}".`);
    return fallback;
  }
  return parsed;
}

const DATABASE_URL = required('DATABASE_URL');
const BETTER_AUTH_SECRET = required('BETTER_AUTH_SECRET');
const BETTER_AUTH_URL = required('BETTER_AUTH_URL');

// A short secret silently weakens every session token, so refuse to boot on one.
if (BETTER_AUTH_SECRET && BETTER_AUTH_SECRET.length < 32) {
  problems.push(
    `BETTER_AUTH_SECRET must be at least 32 characters (currently ${BETTER_AUTH_SECRET.length}). ` +
      `Generate one with: openssl rand -base64 32`
  );
}

export const env = {
  NODE_ENV,
  PORT: port('PORT', 3000),
  DATABASE_URL,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  /** Origins allowed to make credentialed browser requests to this API. */
  CORS_ORIGINS: originList('CORS_ORIGINS', 'http://localhost:5173'),
  /** Origins Better Auth will accept for sign-in / callback flows. */
  TRUSTED_ORIGINS: originList('TRUSTED_ORIGINS', 'http://localhost:5173'),
} as const;

if (problems.length > 0) {
  throw new Error(
    `Invalid environment configuration:\n` +
      problems.map((p) => `  - ${p}`).join('\n') +
      `\n\nSee app/.env.example for the full contract.`
  );
}
