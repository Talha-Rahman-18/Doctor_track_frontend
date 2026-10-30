"use client";

import { TriangleAlert } from "lucide-react";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";

/** Confirmation for destructive actions. Both buttons lock while the request is in flight. */
export default function ConfirmDialog({ open, title, description, confirmLabel = "Delete", loading = false, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} closeDisabled={loading}>
      <div className="flex gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <TriangleAlert className="size-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
