import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setAuthenticationState } from "@/store/user";
import { useLogoutMutation, userApi } from "@/services/user.service";
import { useState } from "react";

const useLogout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logoutFn] = useLogoutMutation();
  const [loading, setLoading] = useState<boolean>(false);
  const authenticated = useAppSelector((state) => state.user.authenticated);

  const clearReduxState = () => {
    dispatch(userApi.util.resetApiState());
  };

  const logout = async (pushToLogin = true) => {
    if (!authenticated) return; // TODO: Remove this later
    try {
      setLoading(true);
      if (authenticated) await logoutFn().unwrap();
      await fetch("/api/logout", {
        method: "POST",
      });

      dispatch(
        setAuthenticationState({
          authenticated: false,
          user: null,
        })
      );
      if (router.asPath === "/") return;
      pushToLogin && router.push("/login");
    } catch (err) {
      console.error("Sorry, we could not log you out.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    logout,
    clearReduxState,
  };
};

export default useLogout;
