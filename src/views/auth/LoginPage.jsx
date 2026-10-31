"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import FormAlert from "../../components/feedback/FormAlert.jsx";
import FullPageLoader from "../../components/feedback/FullPageLoader.jsx";
import { TextField } from "../../components/forms/FormFields.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import {
  useGetMeQuery,
  useLoginMutation,
} from "../../features/auth/authApi.js";
import {
  selectSessionExpired,
  sessionCleared,
} from "../../features/auth/authSlice.js";
import { ROUTES } from "../../lib/constants.js";
import { applyServerErrors } from "../../lib/forms.js";
import { loginSchema } from "../../schemas/auth.schema.js";
import { baseApi } from "../../services/baseApi.js";

const safeRedirect = (from) =>
  typeof from === "string" &&
  from.startsWith("/") &&
  !from.startsWith("//") &&
  from !== ROUTES.login
    ? from
    : ROUTES.dashboard;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpiredFlag = useAppSelector(selectSessionExpired);
  const [wasExpired] = useState(sessionExpiredFlag);
  const { data: user, isLoading } = useGetMeQuery();
  const [login] = useLoginMutation();
  const redirectTo = safeRedirect(searchParams.get("from"));

  // Arriving here because a session was rejected: drop all cached (possibly sensitive) data.
  useEffect(() => {
    if (sessionExpiredFlag) {
      dispatch(baseApi.util.resetApiState());
      dispatch(sessionCleared());
    }
  }, [sessionExpiredFlag, dispatch]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values) => {
    try {
      const res = await login(values).unwrap();

      router.replace(redirectTo);
    } catch (error) {
      // Keep the typed email; the password field is intentionally left for the user to retype.
      applyServerErrors(error, setError, ["email", "password"]);
    }
  };

  const alreadySignedIn = Boolean(user) && !sessionExpiredFlag;
  useEffect(() => {
    if (alreadySignedIn) router.replace(redirectTo);
  }, [alreadySignedIn, redirectTo, router]);

  if (isLoading || alreadySignedIn)
    return <FullPageLoader label="Checking your session…" />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
            <Plus className="size-7" strokeWidth={3} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Doctor Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to the administration portal
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
            aria-label="Sign in"
          >
            {wasExpired && (
              <FormAlert message="Your session has expired. Please sign in again." />
            )}
            <FormAlert message={errors.root?.server?.message} />
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              required
              error={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized administrators only. Demo uses fictional data.
        </p>
      </div>
    </main>
  );
}
