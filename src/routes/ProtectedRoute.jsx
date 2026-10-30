"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "../app/hooks.js";
import ErrorState from "../components/feedback/ErrorState.jsx";
import FullPageLoader from "../components/feedback/FullPageLoader.jsx";
import { useGetMeQuery } from "../features/auth/authApi.js";
import { selectSessionExpired } from "../features/auth/authSlice.js";
import { ROUTES } from "../lib/constants.js";

/**
 * Renders its children only after the SERVER has confirmed the session via GET /auth/me.
 * Nothing in Redux, cookies readable by JS or localStorage is trusted for this decision.
 * Real permissions are enforced by the API; this guard is for user experience.
 */
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const sessionExpired = useAppSelector(selectSessionExpired);
  const { data: user, isLoading, isFetching, isError, error, refetch } = useGetMeQuery();

  const needsLogin = sessionExpired || (isError && error?.status === 401);

  useEffect(() => {
    if (!needsLogin) return;
    // Remember where the user was heading so login can send them back.
    const from = `${pathname}${window.location.search}`;
    router.replace(`${ROUTES.login}?from=${encodeURIComponent(from)}`);
  }, [needsLogin, pathname, router]);

  if (needsLogin) return <FullPageLoader label="Redirecting to sign in…" />;
  if (isLoading || (isFetching && !user)) return <FullPageLoader label="Checking your session…" />;

  if (isError) {
    // Network/server failure: do not pretend the user was logged out.
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <ErrorState title="Can't verify your session" error={error} onRetry={refetch} retrying={isFetching} />
      </div>
    );
  }

  return user ? children : null;
}
