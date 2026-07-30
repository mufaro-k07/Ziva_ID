import { describe, it, expect } from "bun:test";
import { auth } from "../src/lib/auth";

describe("Better Auth — sign up & sign in", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "password123";

  it("signs up a new user with default role 'citizen'", async () => {
    const result = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: testPassword,
        name: "Test User",
      },
    });

    expect(result.user.email).toBe(testEmail);
    expect(result.user.role).toBe("citizen");
  });

  it("signs in with the same credentials", async () => {
    const result = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: testPassword,
      },
    });

    expect(result.user.email).toBe(testEmail);
  });
});