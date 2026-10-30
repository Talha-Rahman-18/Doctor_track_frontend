import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLogoutMutation } from "../features/auth/authApi.js";
import { ROUTES } from "../lib/constants.js";

export function useLogout() {
  const router = useRouter();
  const [logoutRequest, { isLoading }] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutRequest().unwrap();
      router.replace(ROUTES.login);
    } catch (error) {
      toast.error(error?.message ?? "We couldn't sign you out. Please try again.");
    }
  };

  return { logout, isLoggingOut: isLoading };
}
