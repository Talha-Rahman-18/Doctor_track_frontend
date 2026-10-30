"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { buttonStyles } from "../../components/ui/Button.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { useLogout } from "../../hooks/useLogout.js";
import { ROUTES } from "../../lib/constants.js";

export default function ForbiddenPage() {
  const { logout, isLoggingOut } = useLogout();
  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-amber-700">Error 403</p>
      <h1 className="mt-1 text-2xl font-semibold text-slate-900">Access forbidden</h1>
      <p className="mt-2 text-sm text-slate-600">
        You're signed in, but your account doesn't have permission to view this page or perform this action.
        If you think this is a mistake, contact an administrator.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={ROUTES.dashboard} className={buttonStyles()}>Back to dashboard</Link>
        <Button variant="secondary" onClick={logout} loading={isLoggingOut}>
          {!isLoggingOut && <LogOut className="size-4" aria-hidden="true" />} Sign out
        </Button>
      </div>
    </Card>
  );
}
