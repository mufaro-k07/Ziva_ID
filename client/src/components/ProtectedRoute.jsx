import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client';

/**
 * Gates a route on an active Better Auth session, and optionally on a role.
 * The server already enforces this (401/403 from the `auth` / `adminOnly`
 * macros); this stops the officer UI from rendering to the wrong person.
 */
export function ProtectedRoute({ children, requireRole, redirectTo = '/' }) {
  const { data: session, isPending } = useSession();

  if (isPending) return <p style={{ padding: '40px' }}>Loading...</p>;

  if (!session) return <Navigate to={redirectTo} replace />;

  if (requireRole && session.user?.role !== requireRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
