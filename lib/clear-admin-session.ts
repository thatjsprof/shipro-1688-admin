import { setAuthenticationState } from "@/store/user";
import type { AppDispatch } from "@/store/store";

let loggingOut = false;

export async function clearAdminSession(
  dispatch: AppDispatch,
  options?: { redirect?: boolean }
) {
  if (loggingOut) return;
  loggingOut = true;

  try {
    dispatch(setAuthenticationState(null));

    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Still redirect locally even if cookie cleanup fails.
    }

    if (options?.redirect === false || typeof window === "undefined") return;

    const path = window.location.pathname;
    if (path !== "/login" && path !== "/") {
      window.location.href = "/login";
    }
  } finally {
    loggingOut = false;
  }
}
