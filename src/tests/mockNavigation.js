// Minimal, reactive stand-in for `next/navigation` so components can be tested without a Next runtime.
import { useMemo, useSyncExternalStore } from "react";

let url = "/";
let routeParams = {};
const listeners = new Set();
export const history = [];
const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setUrl = (nextUrl, params = {}) => {
  url = nextUrl;
  routeParams = params;
  history.push(nextUrl);
  emit();
};
export const getUrl = () => {
  const parsed = new URL(url, "http://localhost");
  return { pathname: parsed.pathname, search: parsed.search, href: `${parsed.pathname}${parsed.search}` };
};

const router = {
  push: (to) => setUrl(to, routeParams),
  replace: (to) => setUrl(to, routeParams),
  back: () => {},
  refresh: () => {},
  prefetch: () => {},
};

export const useRouter = () => router;
export const usePathname = () => useSyncExternalStore(subscribe, () => getUrl().pathname, () => "/");
export const useSearchParams = () => {
  const search = useSyncExternalStore(subscribe, () => getUrl().search, () => "");
  return useMemo(() => new URLSearchParams(search), [search]);
};
export const useParams = () => routeParams;
export const redirect = (to) => setUrl(to);
export const notFound = () => {
  throw new Error("NEXT_NOT_FOUND");
};
