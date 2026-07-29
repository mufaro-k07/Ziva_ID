import { useState } from "react";
import { signUp, signIn, signOut, useSession } from "./lib/auth-client";

function AuthTest() {
  const { data: session, isPending } = useSession();
  const [email, setEmail] = useState("test2@example.com");
  const [password, setPassword] = useState("password123");

  if (isPending) return <p>Loading...</p>;

  if (session) {
    return (
      <div>
        <p>Logged in as: {session.user.email}</p>
        <p>Role: {session.user.role}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      <button
        onClick={() => signUp.email({ email, password, name: "Test User 2" })}
      >
        Sign up
      </button>
      <button onClick={() => signIn.email({ email, password })}>
        Sign in
      </button>
    </div>
  );
}

export default AuthTest;