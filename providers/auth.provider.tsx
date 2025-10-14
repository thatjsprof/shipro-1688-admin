import { IUserRole } from "@/interfaces/user.interface";
import { useLazyGetProfileQuery } from "@/services/user.service";
import { useAppDispatch } from "@/store/hooks";
import { setAuthenticationState } from "@/store/user";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [getUser] = useLazyGetProfileQuery();
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const res = await getUser().unwrap();
      if (res.session) {
        const data = res.user;
        if (data.role === IUserRole.admin) {
          dispatch(
            setAuthenticationState({
              authenticated: true,
              user: data,
            })
          );
        } else {
          dispatch(setAuthenticationState(null));
          router.push("/login");
        }
      } else {
        dispatch(setAuthenticationState(null));
      }
    } catch {
      dispatch(setAuthenticationState(null));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthProvider;
