"use client";

import { Menu } from "lucide-react";
import { Brand } from "./Sidebar.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Topbar({ onOpenMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onOpenMenu} aria-label="Open navigation menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <div className="lg:hidden"><Brand /></div>
      </div>
      <UserMenu />
    </header>
  );
}
