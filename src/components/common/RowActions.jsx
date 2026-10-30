"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Button, { buttonStyles } from "../ui/Button.jsx";

/** View / edit links and a delete button with explicit accessible names per row. */
export default function RowActions({ name, viewTo, editTo, onDelete, deleting = false }) {
  return (
    <div className="flex items-center gap-1">
      {viewTo && (
        <Link href={viewTo} aria-label={`View ${name}`} title="View" className={buttonStyles({ variant: "ghost", size: "icon" })}>
          <Eye className="size-4" aria-hidden="true" />
        </Link>
      )}
      {editTo && (
        <Link href={editTo} aria-label={`Edit ${name}`} title="Edit" className={buttonStyles({ variant: "ghost", size: "icon" })}>
          <Pencil className="size-4" aria-hidden="true" />
        </Link>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon" aria-label={`Delete ${name}`} title="Delete" onClick={onDelete} disabled={deleting} className="hover:bg-red-50 hover:text-red-700">
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
