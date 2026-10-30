import { Suspense } from "react";
import FullPageLoader from "../../components/feedback/FullPageLoader.jsx";
import LoginPage from "../../views/auth/LoginPage.jsx";

export const metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <LoginPage />
    </Suspense>
  );
}
