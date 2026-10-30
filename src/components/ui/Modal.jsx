"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils.js";

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: role="dialog", labelled by its title, Escape to close, focus moved
 * inside on open, Tab cycles within the dialog, focus restored to the trigger on close, page scroll locked.
 */
export default function Modal({ open, onClose, title, description, children, size = "md", closeDisabled = false }) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const first = panel?.querySelector("[data-autofocus]") ?? panel?.querySelector(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !closeDisabled) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const [firstItem, lastItem] = [items[0], items.at(-1)];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" aria-hidden="true" onClick={closeDisabled ? undefined : onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl",
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
