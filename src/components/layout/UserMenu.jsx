"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useGetMeQuery } from "../../features/auth/authApi.js";
import { useLogout } from "../../hooks/useLogout.js";
import { getInitials } from "../../lib/utils.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";

export default function UserMenu() {
  const { data: user } = useGetMeQuery();
  const { logout, isLoggingOut } = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
          {getInitials(user?.name) || "?"}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
        <ChevronDown className="size-4 text-slate-500" aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <Badge tone="brand" className="mt-2 capitalize">{user?.role}</Badge>
          <Button variant="secondary" className="mt-3 w-full" onClick={logout} loading={isLoggingOut}>
            {!isLoggingOut && <LogOut className="size-4" aria-hidden="true" />}
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}
