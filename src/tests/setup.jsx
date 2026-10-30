import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Next.js modules are replaced with lightweight test doubles.
vi.mock("next/navigation", () => import("./mockNavigation.js"));
vi.mock("next/link", () => ({
  default: ({ href, children, prefetch: _prefetch, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => cleanup());

// jsdom does not implement these browser APIs.
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
Element.prototype.scrollIntoView ??= () => {};
