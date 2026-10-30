"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { setNavigator } from "../lib/navigation.js";
import { makeStore } from "./store.js";

/** Lets the RTK Query base query (non-React code) trigger Next.js navigation, e.g. to /403. */
function NavigatorBridge() {
  const router = useRouter();
  useEffect(() => {
    setNavigator((path) => router.push(path));
    return () => setNavigator(null);
  }, [router]);
  return null;
}

export default function Providers({ children }) {
  // One store per browser session (created lazily, never shared between server requests).
  const [store] = useState(() => makeStore());
  return (
    <Provider store={store}>
      <NavigatorBridge />
      {children}
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  );
}
